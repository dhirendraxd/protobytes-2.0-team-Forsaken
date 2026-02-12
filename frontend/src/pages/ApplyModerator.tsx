import { Card } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ModApplicationForm } from "@/components/ModApplicationForm";
import Footer from "@/components/Footer";

const ApplyModerator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    const storedUserData = localStorage.getItem('userData');
    setIsLoggedIn(!!loggedIn);
    if (storedUserData) {
      try {
        setUserData(JSON.parse(storedUserData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Apply to Become a Moderator
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join our team of community leaders helping to keep VoiceLink accurate, 
              trustworthy, and beneficial for everyone.
            </p>
          </div>

          {/* Benefits Section */}
          <Card className="p-8 mb-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-4">What You'll Do</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Manage Local Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Update market prices, transport schedules, and community alerts
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Verify Contributors</h3>
                  <p className="text-sm text-muted-foreground">
                    Add and manage verified community reporters in your area
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Serve Your Community</h3>
                  <p className="text-sm text-muted-foreground">
                    Help neighbors access accurate, timely local information
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Build Trust</h3>
                  <p className="text-sm text-muted-foreground">
                    Ensure information quality and community safety
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Requirements Section */}
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Requirements</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Must be 18 years or older and a permanent resident of the area</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Good understanding of local community and culture</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Access to smartphone and internet (at least occasionally)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Commitment to accuracy, fairness, and community service</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Basic literacy in Nepali and ability to communicate clearly</span>
              </li>
            </ul>
          </Card>

          {/* Application Form */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Application Form</h2>
            <ModApplicationForm />
          </Card>

          {/* Footer Note */}
          <div className="mt-8 p-6 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Note:</strong> All applications are carefully reviewed. If approved, you'll receive an access code 
              via email within 7-10 working days. Use this code to create your moderator account. 
              For questions, please contact us at <strong>contact@gaunkokhbar.np</strong>
            </p>
          </div>
        </div>
      </main>
      <Footer isLoggedIn={isLoggedIn} userData={userData} />
    </div>
  );
};

export default ApplyModerator;
