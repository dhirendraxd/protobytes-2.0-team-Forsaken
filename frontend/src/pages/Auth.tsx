import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, loading, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f3f3]">
        <div className="flex flex-col items-center gap-4 text-black/70">
          <Loader2 className="w-8 h-8 animate-spin text-black" />
          <p className="text-sm">Loading authentication...</p>
        </div>
      </div>
    );
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await signInWithGoogle();
      if (result.error) {
        setError(result.error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign in failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-[1400px] rounded-[32px] bg-white shadow-2xl overflow-hidden">
        <div className="grid lg:grid-cols-2">
          {/* Left Side - Form */}
          <div className="p-8 lg:p-12">
            {/* Logo */}
            <div className="mb-8 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black">
                <span className="text-lg font-bold text-lime-300">V</span>
              </div>
              <span className="text-xl font-bold text-black">VoiceLink</span>
            </div>

            {/* Welcome Text */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-black">Welcome Back!</h1>
              <p className="mt-2 text-sm text-gray-500">We Are Happy To See You Again</p>
            </div>

            {/* Tabs */}
            <div className="mb-6 flex gap-2">
              <button
                onClick={() => setActiveTab("signin")}
                className={`flex-1 rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
                  activeTab === "signin"
                    ? "bg-black text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Sign in
              </button>
              <button
                onClick={() => setActiveTab("signup")}
                className={`flex-1 rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
                  activeTab === "signup"
                    ? "bg-black text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              {/* Email Input */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl border-gray-200 bg-gray-50 pl-10 text-black placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-black"
                  disabled={isSubmitting}
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 rounded-xl border-gray-200 bg-gray-50 pl-10 pr-10 text-black placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-black"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="border-gray-300"
                  />
                  <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-sm font-medium text-black hover:underline">
                  Forgot Password?
                </a>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isSubmitting || !email || !password}
                className="h-12 w-full rounded-full bg-black text-white hover:bg-gray-800"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-500">OR</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full border-gray-200 bg-black text-white hover:bg-gray-800"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Log in with Apple
              </Button>

              <Button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                variant="outline"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Log in with Google
              </Button>
            </div>
          </div>

          {/* Right Side - Decorative */}
          <div className="relative hidden lg:block bg-gradient-to-br from-lime-600 via-lime-500 to-lime-700 overflow-hidden">
            {/* Abstract Wave Pattern */}
            <div className="absolute inset-0">
              <svg className="h-full w-full" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "#84cc16", stopOpacity: 0.8 }} />
                    <stop offset="100%" style={{ stopColor: "#65a30d", stopOpacity: 0.9 }} />
                  </linearGradient>
                  <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "#a3e635", stopOpacity: 0.6 }} />
                    <stop offset="100%" style={{ stopColor: "#84cc16", stopOpacity: 0.7 }} />
                  </linearGradient>
                </defs>
                
                {/* Wavy shapes */}
                <path
                  d="M0,100 Q100,50 200,100 T400,100 L400,300 Q300,350 200,300 T0,300 Z"
                  fill="url(#grad1)"
                  opacity="0.7"
                >
                  <animate
                    attributeName="d"
                    dur="10s"
                    repeatCount="indefinite"
                    values="
                      M0,100 Q100,50 200,100 T400,100 L400,300 Q300,350 200,300 T0,300 Z;
                      M0,150 Q100,100 200,150 T400,150 L400,350 Q300,300 200,350 T0,350 Z;
                      M0,100 Q100,50 200,100 T400,100 L400,300 Q300,350 200,300 T0,300 Z
                    "
                  />
                </path>
                
                <path
                  d="M0,200 Q100,150 200,200 T400,200 L400,500 Q300,450 200,500 T0,500 Z"
                  fill="url(#grad2)"
                  opacity="0.5"
                >
                  <animate
                    attributeName="d"
                    dur="15s"
                    repeatCount="indefinite"
                    values="
                      M0,200 Q100,150 200,200 T400,200 L400,500 Q300,450 200,500 T0,500 Z;
                      M0,250 Q100,200 200,250 T400,250 L400,550 Q300,500 200,550 T0,550 Z;
                      M0,200 Q100,150 200,200 T400,200 L400,500 Q300,450 200,500 T0,500 Z
                    "
                  />
                </path>

                <ellipse cx="300" cy="200" rx="150" ry="200" fill="url(#grad1)" opacity="0.3">
                  <animate attributeName="cy" dur="8s" repeatCount="indefinite" values="200;250;200" />
                </ellipse>
              </svg>
            </div>

            {/* Copyright Text */}
            <div className="absolute bottom-8 left-8 right-8">
              <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4 text-center">
                <p className="text-xs text-white/80">
                  © 2025 VoiceLink. All rights reserved.
                  <br />
                  Unauthorized use or reproduction of any content or materials from this platform is prohibited.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
