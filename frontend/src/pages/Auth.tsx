import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useFormValidation, validationRules } from '@/hooks/useFormValidation';
import { Phone, Key, Mail, ArrowLeft, Home, AlertCircle } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { AnonymousAlertSubmission } from '@/components/AnonymousAlertSubmission';
import Navbar from '@/components/Navbar';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstTimeLogin, setIsFirstTimeLogin] = useState(true);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form validation
  const { errors, validateField, validateAll, clearFieldError } = useFormValidation({
    email: [
      validationRules.required('Email is required'),
      validationRules.email(),
    ],
    password: [
      validationRules.required('Password is required'),
      validationRules.minLength(6, 'Password must be at least 6 characters'),
    ],
  });

  // Check if user has logged in before
  useState(() => {
    const hasLoggedInBefore = localStorage.getItem('hasLoggedInBefore');
    setIsFirstTimeLogin(!hasLoggedInBefore);
  });

  // Redirect if already logged in
  if (user) {
    navigate('/');
    return null;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Validate before submission
    if (!validateAll({ email, password })) {
      return;
    }

    setIsLoading(true);

    try {
      // Verify email and password (only approved applications can be queried)
      const applicationsRef = collection(db, "mod_applications");
      const q = query(
        applicationsRef,
        where("email", "==", email),
        where("status", "==", "approved")
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          title: "Invalid Email",
          description: "No account found with this email address.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Get application data
      const applicationData = querySnapshot.docs[0].data();
      
      // Check if application is approved
      if (applicationData.status !== "approved") {
        toast({
          title: "Application Not Approved",
          description: "Your moderator application is still pending review. You'll be able to login once it's approved.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Verify password
      if (applicationData.password !== password) {
        toast({
          title: "Incorrect Password",
          description: "The password you entered is incorrect. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Store application data
      localStorage.setItem('userData', JSON.stringify(applicationData));
      localStorage.setItem('userEmail', email);
      localStorage.setItem('isLoggedIn', 'true');
      
      toast({
        title: "Login Successful!",
        description: `Welcome, ${applicationData.fullName}!`,
      });
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  // Removed signup - users get credentials immediately upon application submission

  return (
    <div className="min-h-screen bg-background">
      {/* Header with gradient */}
      <header className="relative animated-gradient text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        
        {/* Floating particles */}
        <div className="floating-particle w-12 h-12 left-[10%]" style={{ animation: 'float-up 15s infinite linear' }}></div>
        <div className="floating-particle w-8 h-8 left-[25%]" style={{ animation: 'float-up 12s infinite linear 2s' }}></div>
        <div className="floating-particle w-16 h-16 left-[40%]" style={{ animation: 'float-diagonal 18s infinite linear 1s' }}></div>
        <div className="floating-particle w-6 h-6 left-[55%]" style={{ animation: 'float-up 10s infinite linear 3s' }}></div>
        <div className="floating-particle w-10 h-10 left-[70%]" style={{ animation: 'float-diagonal 16s infinite linear' }}></div>
        <div className="floating-particle w-14 h-14 left-[85%]" style={{ animation: 'float-up 14s infinite linear 4s' }}></div>
        <div className="floating-particle w-8 h-8 left-[15%]" style={{ animation: 'float-diagonal 13s infinite linear 5s' }}></div>
        <div className="floating-particle w-12 h-12 left-[60%]" style={{ animation: 'float-up 17s infinite linear 2.5s' }}></div>
        
        {/* Floating orbs */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>

        <Navbar />

        <div className="relative container mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl font-bold mb-3">Account Access</h1>
          <p className="text-xl text-white/90">
            Login as a moderator or submit a community alert
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Left Side - Moderator Login */}
        <Card className="glass-card-light border-white/40 shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Phone className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Moderator Login</CardTitle>
            <CardDescription>Login with your email and password</CardDescription>
            <p className="text-sm text-muted-foreground pt-2">
              Only approved moderators can login. Check your email for approval notification.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  onBlur={(e) => validateField('email', e.target.value)}
                  onChange={(e) => clearFieldError('email')}
                  required
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Use the email you provided in your application
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  onBlur={(e) => validateField('password', e.target.value)}
                  onChange={(e) => clearFieldError('password')}
                  required
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.password}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  The password you set during application submission
                </p>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Login'}
              </Button>
              
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  Don't have an account? <a href="/apply-moderator" className="text-primary hover:underline font-medium">Submit Application</a>
                </p>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Your application will be reviewed before you can login.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Right Side - Submit Alert */}
        <div>
          <AnonymousAlertSubmission />
        </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
