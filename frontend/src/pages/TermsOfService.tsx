import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Footer from "@/components/Footer";

const TermsOfService = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<{ fullName?: string; email?: string } | null>(null);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    const storedUserData = localStorage.getItem("userData");
    setIsLoggedIn(!!loggedIn);
    if (storedUserData) {
      try {
        setUserData(JSON.parse(storedUserData));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-3">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: December 2025</p>
          </div>

          <div className="space-y-8">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using VoiceLink, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">2. Use License</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Permission is granted to temporarily download one copy of the materials (information or software) on VoiceLink for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary">•</span>
                  <span>Modify or copy the materials</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">•</span>
                  <span>Use the materials for any commercial purpose or for any public display</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">•</span>
                  <span>Attempt to decompile or reverse engineer any software contained on the platform</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">•</span>
                  <span>Remove any copyright or other proprietary notations from the materials</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">•</span>
                  <span>Transfer the materials to another person or "mirror" the materials on any other server</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Disclaimer</h2>
              <p className="text-muted-foreground leading-relaxed">
                The materials on VoiceLink are provided on an 'as is' basis. VoiceLink makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Limitations</h2>
              <p className="text-muted-foreground leading-relaxed">
                In no event shall VoiceLink or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the platform, even if VoiceLink or an authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Accuracy of Materials</h2>
              <p className="text-muted-foreground leading-relaxed">
                The materials appearing on VoiceLink could include technical, typographical, or photographic errors. VoiceLink does not warrant that any of the materials on the platform are accurate, complete, or current. VoiceLink may make changes to the materials contained on the platform at any time without notice.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">6. Links</h2>
              <p className="text-muted-foreground leading-relaxed">
                VoiceLink has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by VoiceLink of the site. Use of any such linked website is at the user's own risk.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">7. Modifications</h2>
              <p className="text-muted-foreground leading-relaxed">
                VoiceLink may revise these terms of service for the website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">8. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These terms and conditions are governed by and construed in accordance with the laws of Nepal, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">9. User Responsibilities</h2>
              <p className="text-muted-foreground mb-4">As a user of VoiceLink, you agree to:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary">•</span>
                  <span>Provide accurate and truthful information when applying as a moderator or contributor</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">•</span>
                  <span>Not submit false, misleading, or harmful information</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">•</span>
                  <span>Respect the rights and dignity of other users and community members</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">•</span>
                  <span>Comply with all applicable laws and regulations</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">10. Contact Information</h2>
              <p className="text-muted-foreground mb-4">For questions about these Terms of Service, please contact us:</p>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Email:</strong> contact@gaunkokhbar.np
                </p>
                <p>
                  <strong className="text-foreground">Phone:</strong> 1660-XXX-XXXX
                </p>
                <p>
                  <strong className="text-foreground">Address:</strong> Pokhara, Nepal
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-muted">
              <p className="text-sm text-muted-foreground text-center">
                By using VoiceLink, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </Card>
          </div>
        </div>
      </main>
      <Footer showLegal={true} isLoggedIn={isLoggedIn} />
    </div>
  );
};

export default TermsOfService;
