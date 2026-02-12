import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useFormValidation, validationRules } from '@/hooks/useFormValidation';
import { Mail, AlertCircle, LogIn } from 'lucide-react';
import BrandIcon from '@/components/BrandIcon';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signInWithGoogle, user } = useAuth();
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
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Login Successful!",
        description: "Welcome back!",
      });

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

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast({
          title: "Google sign-in failed",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Login Successful!",
        description: "Signed in with Google.",
      });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BrandIcon className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">VoiceLink</h1>
          <p className="text-muted-foreground mt-2">Community Information Network</p>
        </div>

        {/* Login Card */}
        <Card className="border border-border/50 shadow-lg">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-center">
              <div className="p-2 rounded-lg bg-primary/10">
                <LogIn className="w-6 h-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
            <CardDescription className="text-center">
              Sign in to access your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
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
                  className={`${errors.email ? 'border-destructive' : ''}`}
                />
                {errors.email && (
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  onBlur={(e) => validateField('password', e.target.value)}
                  onChange={(e) => clearFieldError('password')}
                  required
                  className={`${errors.password ? 'border-destructive' : ''}`}
                />
                {errors.password && (
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Login Button */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              {/* Google Sign In Button */}
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={handleGoogleSignIn} 
                disabled={isLoading}
                size="lg"
              >
                Continue with Google
              </Button>
            </form>

            {/* Footer Text */}
            <div className="mt-6 text-center text-xs text-muted-foreground">
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/')}
                  className="text-primary font-semibold hover:underline"
                >
                  Back to home
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Info Text */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Your login is secured by Firebase Authentication
        </p>
      </div>
    </div>
  );
};

export default Auth;
