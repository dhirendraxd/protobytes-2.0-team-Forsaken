import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Loader2, Mic, MicOff, Play, Pause, Trash2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/config/firebase";

interface AnonymousAlertSubmissionProps {
  onAlertSubmitted?: () => void;
}

export const AnonymousAlertSubmission = ({ onAlertSubmitted }: AnonymousAlertSubmissionProps) => {
  const [idNumber, setIdNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [alertText, setAlertText] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploadedAudioFile, setUploadedAudioFile] = useState<File | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const { toast } = useToast();


  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        setAudioURL(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const togglePlayAudio = () => {
    if (audioPlayerRef.current) {
      if (isPlaying) {
        audioPlayerRef.current.pause();
        setIsPlaying(false);
      } else {
        audioPlayerRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const deleteAudio = () => {
    setAudioBlob(null);
    setAudioURL("");
    setUploadedAudioFile(null);
    setIsPlaying(false);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }
  };

  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        setUploadedAudioFile(file);
        setAudioURL(URL.createObjectURL(file));
        setAudioBlob(null); // Clear recorded audio if file is uploaded
      } else {
        toast({
          title: "Error",
          description: "Please upload a valid audio file",
          variant: "destructive",
        });
      }
    }
  };

  const handleAlertSubmission = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!idNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter your ID number",
        variant: "destructive",
      });
      return;
    }

    if (!fullName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your full name",
        variant: "destructive",
      });
      return;
    }

    if (!phoneNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    if (!alertText.trim() && !audioBlob && !uploadedAudioFile) {
      toast({
        title: "Error",
        description: "Please provide either alert text or audio message",
        variant: "destructive",
      });
      return;
    }

    // Email validation only if provided
    if (userEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userEmail)) {
        toast({
          title: "Error",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        return;
      }
    }


    setIsLoading(true);
    try {
      let audioDownloadURL = "";
      
      // Upload audio if exists (either recorded or uploaded file)
      if (audioBlob || uploadedAudioFile) {
        const audioFile = uploadedAudioFile || audioBlob;
        if (audioFile) {
          const audioFileName = `alerts/audio_${Date.now()}_${idNumber}.${uploadedAudioFile ? uploadedAudioFile.name.split('.').pop() : 'webm'}`;
          const audioRef = ref(storage, audioFileName);
          await uploadBytes(audioRef, audioFile);
          audioDownloadURL = await getDownloadURL(audioRef);
        }
      }

      // Submit alert to pending_alerts collection
      await addDoc(collection(db, "pending_alerts"), {
        id_number: idNumber,
        full_name: fullName,
        phone_number: phoneNumber,
        email: userEmail || null,
        alert_text: alertText || null,
        audio_url: audioDownloadURL || null,
        status: "pending",
        created_at: new Date(),
      });

      toast({
        title: "Success",
        description: userEmail 
          ? "Alert submitted successfully! Moderators will review it and notify you via email."
          : "Alert submitted successfully! Moderators will review it and contact you via phone.",
      });

      // Reset form
      setIdNumber("");
      setFullName("");
      setPhoneNumber("");
      setAlertText("");
      setUserEmail("");
      deleteAudio();

      if (onAlertSubmitted) {
        onAlertSubmitted();
      }
    } catch (error) {
      console.error("Error submitting alert:", error);
      toast({
        title: "Error",
        description: "Failed to submit alert. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-primary" />
          Submit an Alert Without Logging In
        </CardTitle>
        <CardDescription>
          Tell us about the alert. Moderators will review and contact you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAlertSubmission} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="id-number">
              ID Number *
            </Label>
            <Input
              id="id-number"
              placeholder="e.g., Citizenship/License/Passport Number"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Enter your government-issued ID number for verification
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="full-name">
              Full Name *
            </Label>
            <Input
              id="full-name"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number *
            </Label>
            <Input
              id="phone"
              placeholder="e.g., +977-9841234567 or 9841234567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isLoading}
              type="tel"
            />
            <p className="text-xs text-muted-foreground">
              Enter your phone number so moderators can contact you
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-email">
              Email Address (Optional)
            </Label>
            <Input
              id="user-email"
              type="email"
              placeholder="your.email@example.com"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Optionally provide email for updates about your alert status
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alert-text">
              Alert Message (Text)
            </Label>
            <Textarea
              id="alert-text"
              placeholder="Describe the alert details, what happened, where, and any important information..."
              value={alertText}
              onChange={(e) => setAlertText(e.target.value)}
              rows={4}
              className="resize-none"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              You can provide text, audio, or both
            </p>
          </div>

          {/* Audio Recording/Upload Section */}
          <div className="space-y-2">
            <Label>Alert Message (Audio)</Label>
            
            {!audioURL ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  {!isRecording ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={startRecording}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      Record Audio
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={stopRecording}
                      className="flex-1"
                    >
                      <MicOff className="w-4 h-4 mr-2" />
                      Stop Recording
                    </Button>
                  )}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading || isRecording}
                    className="flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Audio
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileUpload}
                  className="hidden"
                />
                {isRecording && (
                  <p className="text-sm text-red-500 flex items-center gap-2">
                    <span className="animate-pulse">●</span> Recording...
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2 p-3 border rounded-md">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {uploadedAudioFile ? uploadedAudioFile.name : "Recorded Audio"}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={deleteAudio}
                    disabled={isLoading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <audio
                  ref={audioPlayerRef}
                  src={audioURL}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={togglePlayAudio}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Play
                    </>
                  )}
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Record or upload an audio message instead of typing
            </p>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !idNumber.trim() || !fullName.trim() || !phoneNumber.trim() || (!alertText.trim() && !audioURL)}
            className="w-full gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                Submit Alert
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
