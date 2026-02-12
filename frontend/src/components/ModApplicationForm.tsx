import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { collection, addDoc, serverTimestamp, getDocs, query } from "firebase/firestore";
import { db } from "@/config/firebase";
import { Loader2, MapPin, User, Phone, Mail, Calendar, Home, CheckCircle2, Save, Trash2, AlertCircle } from "lucide-react";
import { sendCredentialsEmail } from "@/services/emailService";
import { createSafeStorageData, isRateLimited, getRemainingAttempts } from "@/lib/validation";

interface ModApplicationFormData {
  // Personal Information
  fullName: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  password: string;
  alternatePhone?: string;
  
  // Geographical Information
  province: string;
  district: string;
  municipality: string;
  wardNumber: string;
  tole: string;
  nearestLandmark?: string;
  
  // Demographic Information
  education: string;
  occupation: string;
  languagesSpoken: string;
  ethnicGroup?: string;
  
  // Additional Information
  experienceInCommunityWork?: string;
  reasonForApplying: string;
  availability: string;
  hasSmartphone: string;
  hasInternetAccess: string;
  
  // References
  referenceName?: string;
  referencePhone?: string;
  referenceRelation?: string;
}

const DRAFT_STORAGE_KEY = 'mod_application_draft';
const MODERATOR_RATE_LIMIT = 2; // Max 2 applications per minute
const MODERATOR_RATE_WINDOW = 60000; // 1 minute

export const ModApplicationForm = () => {
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<ModApplicationFormData>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });
  const [loading, setLoading] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [savingDraft, setSavingDraft] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(MODERATOR_RATE_LIMIT);
  const { toast } = useToast();

  // Watch all form values for auto-save
  const formValues = watch();

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        // Populate form with draft data
        Object.keys(draftData).forEach((key) => {
          setValue(key as keyof ModApplicationFormData, draftData[key]);
        });
        toast({
          title: "Draft Loaded",
          description: "Your previously saved draft has been restored.",
        });
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, [setValue, toast]);

  const saveDraft = (isAutoSave = false) => {
    try {
      const currentValues = watch();
      // Remove password and other sensitive fields before storing
      const safeDraftData = createSafeStorageData(currentValues);
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(safeDraftData));
      if (!isAutoSave) {
        setSavingDraft(true);
        setTimeout(() => setSavingDraft(false), 1000);
        toast({
          title: "Draft Saved",
          description: "Your application has been saved as a draft.",
        });
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Error",
        description: "Failed to save draft.",
        variant: "destructive",
      });
    }
  };

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (Object.keys(formValues).length > 0 && !applicationId) {
        const currentValues = watch();
        try {
          // Remove password and other sensitive fields before storing
          const safeDraftData = createSafeStorageData(currentValues);
          localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(safeDraftData));
        } catch (error) {
          console.error('Auto-save error:', error);
        }
      }
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [formValues, applicationId, watch]);

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    reset();
    toast({
      title: "Draft Cleared",
      description: "Your draft has been deleted.",
    });
  };
  const onSubmit = async (data: ModApplicationFormData) => {
    console.log('Form submitted with data:', data);
    
    // Check rate limit first
    const userKey = data.email ? `moderator_${data.email}` : 'moderator_anonymous';
    if (isRateLimited(userKey, MODERATOR_RATE_LIMIT, MODERATOR_RATE_WINDOW)) {
      const remaining = getRemainingAttempts(userKey, MODERATOR_RATE_LIMIT, MODERATOR_RATE_WINDOW);
      toast({
        title: "Too Many Applications",
        description: `You've submitted too many applications. Please wait a minute before submitting again. (${remaining}/${MODERATOR_RATE_LIMIT})`,
        variant: "destructive",
      });
      setRemainingAttempts(remaining);
      return;
    }
    
    // Verify Firebase is ready
    if (!db) {
      console.error('Firebase database not initialized');
      toast({
        title: "Database Error",
        description: "Database connection not available. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      // Check if moderator already exists (only check approved ones due to security rules)
      const modsRef = collection(db, "mod_applications");
      const q = query(modsRef, where("status", "==", "approved"));
      const snapshot = await getDocs(q);
      
      const existingModerator = snapshot.docs.find(doc => {
        const docData = doc.data();
        return (
          (docData.phone === data.phone) ||
          (docData.email === data.email)
        );
      });

      if (existingModerator) {
        toast({
          title: "Application Already Exists",
          description: "A moderator with this phone or email has already applied or exists.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      // Add application to Firestore and get the document reference
      const docRef = await addDoc(collection(db, "mod_applications"), {
        ...data,
        status: "pending",
        created_at: serverTimestamp(),
        reviewed: false,
        // Store all form data
        applicationData: {
          personalInfo: {
            fullName: data.fullName,
            age: data.age,
            gender: data.gender,
            phone: data.phone,
            email: data.email,
            alternatePhone: data.alternatePhone,
          },
          geographicalInfo: {
            province: data.province,
            district: data.district,
            municipality: data.municipality,
            wardNumber: data.wardNumber,
            tole: data.tole,
            nearestLandmark: data.nearestLandmark,
          },
          demographicInfo: {
            education: data.education,
            occupation: data.occupation,
            languagesSpoken: data.languagesSpoken,
            ethnicGroup: data.ethnicGroup,
          },
          additionalInfo: {
            experienceInCommunityWork: data.experienceInCommunityWork,
            reasonForApplying: data.reasonForApplying,
            availability: data.availability,
            hasSmartphone: data.hasSmartphone,
            hasInternetAccess: data.hasInternetAccess,
          },
          referenceInfo: {
            referenceName: data.referenceName,
            referencePhone: data.referencePhone,
            referenceRelation: data.referenceRelation,
          },
        },
      });

      // Get the auto-generated IDP (document ID)
      const applicationIDP = docRef.id;
      console.log('Document created with ID:', applicationIDP);

      // Try to send confirmation email
      // Don't fail the submission if email fails
      const emailResult = await sendCredentialsEmail({
        email: data.email,
        fullName: data.fullName,
        idp: applicationIDP,
        password: data.password,
      });

      if (!emailResult.success) {
        console.warn('Email sending failed, but application was saved:', emailResult.error);
      }
      
      toast({
        title: "Application Submitted!",
        description: "Your application has been submitted and is pending review. You'll receive an email once it's approved.",
      });

      // Store info to show success message
      setApplicationId(applicationIDP);
      setUserEmail(data.email);
      setUserPassword(data.password);

      // Update remaining attempts
      const userKey = data.email ? `moderator_${data.email}` : 'moderator_anonymous';
      const remaining = getRemainingAttempts(userKey, MODERATOR_RATE_LIMIT, MODERATOR_RATE_WINDOW);
      setRemainingAttempts(remaining);

      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Clear draft after successful submission
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      
      console.log('Application submitted successfully!');
    } catch (error) {
      console.error("Error submitting application:", error);
      console.error("Error details:", error instanceof Error ? error.message : error);
      console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onError = (errors: typeof errors) => {
    // Find the first error field and scroll to it
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      
      toast({
        title: "Missing Required Fields",
        description: `Please fill in all required fields. Check: ${firstErrorField}`,
        variant: "destructive",
      });
    }
  };

  // Success Modal
  if (applicationId) {
    return (
      <Card className="p-8 max-w-2xl mx-auto border-2 border-primary">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-green-100">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-green-600 mb-2">Application Submitted Successfully!</h2>
            <p className="text-muted-foreground">Your moderator application is now pending review.</p>
          </div>

          <div className="bg-primary/5 border-2 border-primary rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Mail className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Check Your Email</h3>
            </div>
            
            <div className="space-y-3">
              <div className="bg-white rounded-md p-4 border text-center">
                <Label className="text-xs text-muted-foreground">Email Sent To</Label>
                <p className="text-lg font-mono font-semibold break-all">{userEmail}</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left space-y-2">
            <h4 className="font-semibold text-amber-900 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Important: Next Steps
            </h4>
            <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
              <li>Your application credentials have been sent to <strong>{userEmail}</strong></li>
              <li>You will receive:
                <ul className="ml-6 mt-1 space-y-1">
                  <li>✉️ Application ID (IDP) - your unique identifier</li>
                  <li>🔐 Password - for login (can be changed later)</li>
                </ul>
              </li>
              <li>Your application is pending admin review</li>
              <li>You can only login after your application is approved</li>
              <li>Please check your inbox and spam folder</li>
            </ul>
          </div>

          <div className="pt-4 space-y-3">
            <Button
              onClick={() => window.location.href = '/auth'}
              size="lg"
              className="w-full"
            >
              Go to Login Page
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              size="lg"
              className="w-full"
            >
              Go to Homepage
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8">
      {/* Rate Limit Warning */}
      {remainingAttempts < 2 && remainingAttempts > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Limited Applications</p>
            <p className="text-xs text-amber-700">
              {remainingAttempts} application{remainingAttempts !== 1 ? 's' : ''} remaining this minute
            </p>
          </div>
        </div>
      )}
      
      {/* Draft Info Banner */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Save className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900">Auto-Save Enabled</h4>
            <p className="text-sm text-blue-700">
              Your progress is automatically saved every 30 seconds. You can also manually save your draft or clear it using the buttons at the bottom.
            </p>
          </div>
        </div>
      </Card>

      {/* Personal Information Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold">Personal Information</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name (as per official ID) *</Label>
            <Input
              id="fullName"
              {...register("fullName", { required: "Full name is required" })}
              placeholder="e.g., Ram Bahadur Thapa"
            />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age *</Label>
            <Input
              id="age"
              type="number"
              {...register("age", { 
                required: "Age is required",
                min: { value: 18, message: "Must be at least 18 years old" },
                max: { value: 70, message: "Must be under 70 years old" }
              })}
              placeholder="e.g., 25"
            />
            {errors.age && (
              <p className="text-sm text-destructive">{errors.age.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender *</Label>
            <Select 
              onValueChange={(value) => setValue("gender", value, { shouldValidate: true })}
              {...register("gender", { required: "Gender is required" })}
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="text-sm text-destructive">{errors.gender.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Primary Phone Number *</Label>
            <Input
              id="phone"
              {...register("phone", { 
                required: "Phone number is required",
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Must be a valid 10-digit number"
                }
              })}
              placeholder="98XXXXXXXX"
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="alternatePhone">Alternate Phone Number</Label>
            <Input
              id="alternatePhone"
              {...register("alternatePhone", {
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Must be a valid 10-digit number"
                }
              })}
              placeholder="98XXXXXXXX (Optional)"
            />
            {errors.alternatePhone && (
              <p className="text-sm text-destructive">{errors.alternatePhone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              {...register("email", { 
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
              placeholder="your.email@example.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Create Password *</Label>
            <Input
              id="password"
              type="password"
              {...register("password", { 
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters"
                }
              })}
              placeholder="Minimum 6 characters"
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              You'll use this password to login with your email after approval
            </p>
          </div>
        </div>
      </Card>

      {/* Geographical Information Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold">Geographical Information</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="province">Province *</Label>
            <Select 
              onValueChange={(value) => setValue("province", value, { shouldValidate: true })}
              {...register("province", { required: "Province is required" })}
            >
              <SelectTrigger id="province">
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="koshi">Koshi Pradesh</SelectItem>
                <SelectItem value="madhesh">Madhesh Pradesh</SelectItem>
                <SelectItem value="bagmati">Bagmati Pradesh</SelectItem>
                <SelectItem value="gandaki">Gandaki Pradesh</SelectItem>
                <SelectItem value="lumbini">Lumbini Pradesh</SelectItem>
                <SelectItem value="karnali">Karnali Pradesh</SelectItem>
                <SelectItem value="sudurpashchim">Sudurpashchim Pradesh</SelectItem>
              </SelectContent>
            </Select>
            {errors.province && (
              <p className="text-sm text-destructive">{errors.province.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="district">District *</Label>
            <Input
              id="district"
              {...register("district", { required: "District is required" })}
              placeholder="e.g., Kaski"
            />
            {errors.district && (
              <p className="text-sm text-destructive">{errors.district.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="municipality">Municipality/Rural Municipality *</Label>
            <Input
              id="municipality"
              {...register("municipality", { required: "Municipality is required" })}
              placeholder="e.g., Pokhara Metropolitan City"
            />
            {errors.municipality && (
              <p className="text-sm text-destructive">{errors.municipality.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="wardNumber">Ward Number *</Label>
            <Input
              id="wardNumber"
              type="number"
              {...register("wardNumber", { 
                required: "Ward number is required",
                min: { value: 1, message: "Invalid ward number" }
              })}
              placeholder="e.g., 5"
            />
            {errors.wardNumber && (
              <p className="text-sm text-destructive">{errors.wardNumber.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tole">Tole/Village Name *</Label>
            <Input
              id="tole"
              {...register("tole", { required: "Tole/Village name is required" })}
              placeholder="e.g., Lakeside"
            />
            {errors.tole && (
              <p className="text-sm text-destructive">{errors.tole.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nearestLandmark">Nearest Landmark</Label>
            <Input
              id="nearestLandmark"
              {...register("nearestLandmark")}
              placeholder="e.g., Near Mahendra School"
            />
          </div>
        </div>
      </Card>

      {/* Demographic Information Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Home className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold">Demographic Information</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="education">Educational Qualification *</Label>
            <Select 
              onValueChange={(value) => setValue("education", value, { shouldValidate: true })}
              {...register("education", { required: "Education is required" })}
            >
              <SelectTrigger id="education">
                <SelectValue placeholder="Select education level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slc">SLC/SEE</SelectItem>
                <SelectItem value="plus2">+2/Intermediate</SelectItem>
                <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                <SelectItem value="master">Master's Degree</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.education && (
              <p className="text-sm text-destructive">{errors.education.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="occupation">Current Occupation *</Label>
            <Input
              id="occupation"
              {...register("occupation", { required: "Occupation is required" })}
              placeholder="e.g., Teacher, Farmer, Student"
            />
            {errors.occupation && (
              <p className="text-sm text-destructive">{errors.occupation.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="languagesSpoken">Languages Spoken *</Label>
            <Input
              id="languagesSpoken"
              {...register("languagesSpoken", { required: "Languages are required" })}
              placeholder="e.g., Nepali, English, Magar"
            />
            {errors.languagesSpoken && (
              <p className="text-sm text-destructive">{errors.languagesSpoken.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ethnicGroup">Ethnic Group (Optional)</Label>
            <Input
              id="ethnicGroup"
              {...register("ethnicGroup")}
              placeholder="e.g., Magar, Brahmin, Tharu"
            />
          </div>
        </div>
      </Card>

      {/* Additional Information Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold">Additional Information</h3>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="experienceInCommunityWork">Previous Experience in Community Work</Label>
            <Textarea
              id="experienceInCommunityWork"
              {...register("experienceInCommunityWork")}
              placeholder="Describe any previous experience in community service, journalism, or related fields..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reasonForApplying">Why do you want to be a moderator? *</Label>
            <Textarea
              id="reasonForApplying"
              {...register("reasonForApplying", { 
                required: "Please explain your motivation",
                minLength: { value: 50, message: "Please provide at least 50 characters" }
              })}
              placeholder="Tell us why you want to serve your community as a moderator..."
              rows={5}
            />
            {errors.reasonForApplying && (
              <p className="text-sm text-destructive">{errors.reasonForApplying.message}</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="availability">Availability for Community Work *</Label>
              <Select 
                onValueChange={(value) => setValue("availability", value, { shouldValidate: true })}
                {...register("availability", { required: "Availability is required" })}
              >
                <SelectTrigger id="availability">
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time (6+ hours/day)</SelectItem>
                  <SelectItem value="part-time">Part-time (3-5 hours/day)</SelectItem>
                  <SelectItem value="flexible">Flexible (2-3 hours/day)</SelectItem>
                  <SelectItem value="weekends">Weekends only</SelectItem>
                </SelectContent>
              </Select>
              {errors.availability && (
                <p className="text-sm text-destructive">{errors.availability.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasSmartphone">Do you have a smartphone? *</Label>
              <Select 
                onValueChange={(value) => setValue("hasSmartphone", value, { shouldValidate: true })}
                {...register("hasSmartphone", { required: "This field is required" })}
              >
                <SelectTrigger id="hasSmartphone">
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              {errors.hasSmartphone && (
                <p className="text-sm text-destructive">{errors.hasSmartphone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasInternetAccess">Do you have internet access? *</Label>
              <Select 
                onValueChange={(value) => setValue("hasInternetAccess", value, { shouldValidate: true })}
                {...register("hasInternetAccess", { required: "This field is required" })}
              >
                <SelectTrigger id="hasInternetAccess">
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Yes, regularly</SelectItem>
                  <SelectItem value="occasional">Yes, occasionally</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              {errors.hasInternetAccess && (
                <p className="text-sm text-destructive">{errors.hasInternetAccess.message}</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Reference Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Phone className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold">Reference (Optional)</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="referenceName">Reference Person Name</Label>
            <Input
              id="referenceName"
              {...register("referenceName")}
              placeholder="Name of someone who can vouch for you"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="referencePhone">Reference Phone Number</Label>
            <Input
              id="referencePhone"
              {...register("referencePhone", {
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Must be a valid 10-digit number"
                }
              })}
              placeholder="98XXXXXXXX"
            />
            {errors.referencePhone && (
              <p className="text-sm text-destructive">{errors.referencePhone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="referenceRelation">Relation with Reference</Label>
            <Input
              id="referenceRelation"
              {...register("referenceRelation")}
              placeholder="e.g., Teacher, Community Leader, Friend"
            />
          </div>
        </div>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => saveDraft(false)}
            disabled={loading || savingDraft}
          >
            {savingDraft ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="lg"
            onClick={clearDraft}
            disabled={loading}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Draft
          </Button>
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="min-w-[200px]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Application"
          )}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground text-center">
        * Required fields. All information will be kept confidential and used only for verification purposes.
      </p>
    </form>
  );
};
