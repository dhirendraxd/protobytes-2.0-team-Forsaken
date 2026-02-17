import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { lazy, Suspense } from "react";
import RouteLoader from "@/components/RouteLoader";
import FloatingParticles from "@/components/FloatingParticles";
import SeoMeta from "@/components/SeoMeta";

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const Features = lazy(() => import("./pages/Features"));
const Pricing = lazy(() => import("./pages/Pricing"));
const WhyUs = lazy(() => import("./pages/WhyUs"));
const Contact = lazy(() => import("./pages/Contact"));
const Team = lazy(() => import("./pages/Team"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
        <BrowserRouter>
          <FloatingParticles />
          <SeoMeta />
          <Suspense fallback={<RouteLoader />}>
            <div className="relative z-10">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/features" element={<Features />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/why-us" element={<WhyUs />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/team" element={<Team />} />

                {/* Legacy auth/dashboard paths redirected for static-mode */}
                <Route path="/auth" element={<Navigate to="/" replace />} />
                <Route path="/dashboard" element={<Navigate to="/" replace />} />
                <Route path="/campaigns" element={<Navigate to="/" replace />} />
                <Route path="/analytics" element={<Navigate to="/" replace />} />
                <Route path="/contacts" element={<Navigate to="/" replace />} />
                <Route path="/billing" element={<Navigate to="/" replace />} />
                <Route path="/alerts" element={<Navigate to="/" replace />} />
                <Route path="/settings" element={<Navigate to="/" replace />} />
                <Route path="/moderation" element={<Navigate to="/" replace />} />
                
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
            </div>
          </Suspense>
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
