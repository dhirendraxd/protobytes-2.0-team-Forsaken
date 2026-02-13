import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { lazy, Suspense, useEffect, useState } from "react";
import RouteLoader from "@/components/RouteLoader";
import { auth } from "@/config/firebase";

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const ModerationDashboard = lazy(() => import("./pages/ModerationDashboard"));
const Features = lazy(() => import("./pages/Features"));
const Pricing = lazy(() => import("./pages/Pricing"));
const WhyUs = lazy(() => import("./pages/WhyUs"));
const Contact = lazy(() => import("./pages/Contact"));

const queryClient = new QueryClient();

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });

    return unsubscribe;
  }, []);

  if (isAuthenticated === null) {
    return <RouteLoader />;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<RouteLoader />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/features" element={<Features />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/why-us" element={<WhyUs />} />
                <Route path="/contact" element={<Contact />} />
                
                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <ModerationDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/moderator"
                  element={
                    <ProtectedRoute>
                      <ModerationDashboard />
                    </ProtectedRoute>
                  }
                />
                
                {/* Fallback */}
                <Route
                  path="*"
                  element={
                    <div className="min-h-screen flex items-center justify-center bg-background">
                      <div className="text-center">
                        <h1 className="text-4xl font-bold mb-2">404 - Page Not Found</h1>
                        <p className="text-muted-foreground mb-4">The page you're looking for doesn't exist.</p>
                        <a href="/" className="text-primary hover:underline">
                          Go home
                        </a>
                      </div>
                    </div>
                  }
                />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;