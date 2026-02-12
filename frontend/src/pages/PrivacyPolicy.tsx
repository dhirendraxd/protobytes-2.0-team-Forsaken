import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<{fullName?: string; email?: string} | null>(null);

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
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-3">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: December 2025</p>
          </div>

          <div className="space-y-8">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to VoiceLink. We are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, and safeguard your information.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Information We Collect</h2>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Personal Information</h3>
                  <p>When you apply as a moderator or contributor, we collect your name, phone number, email, and location information to verify your identity and communicate with you.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Usage Information</h3>
                  <p>We track how you interact with our platform, including the pages you visit and the information you access, to improve our service.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Device Information</h3>
                  <p>We may collect information about your device, including device type, browser, and IP address for security and analytics purposes.</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">How We Use Your Information</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary">•</span>
                  <span>To provide and improve our services</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">•</span>
                  <span>To communicate with you about your application status</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">•</span>
                  <span>To verify your identity and prevent fraud</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">•</span>
                  <span>To analyze how our platform is used</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">•</span>
                  <span>To comply with legal obligations</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard security measures to protect your personal information. Your data is encrypted and stored securely on our servers. However, no transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Your Rights</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                You have the right to access, update, or delete your personal information at any time. You can also request that we stop using your data for certain purposes. To exercise these rights, please contact us at contact@gaunkokhbar.np
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies to enhance your experience on our platform. These cookies help us remember your preferences and improve our services. You can disable cookies in your browser settings if you prefer.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Third-Party Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may use third-party services such as Firebase for data storage and analytics. These services have their own privacy policies, and we encourage you to review them to understand how your data is handled.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about this Privacy Policy or our privacy practices, please reach out to us:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p><strong className="text-foreground">Email:</strong> contact@gaunkokhbar.np</p>
                <p><strong className="text-foreground">Phone:</strong> 1660-XXX-XXXX</p>
                <p><strong className="text-foreground">Address:</strong> Pokhara, Nepal</p>
              </div>
            </Card>

            <Card className="p-6 bg-muted">
              <p className="text-sm text-muted-foreground text-center">
                This Privacy Policy is subject to change at any time. We will notify you of any material changes via email or through our platform.
              </p>
            </Card>
          </div>
        </div>
      </main>
      <Footer showLegal={true} isLoggedIn={isLoggedIn} />
    </div>
  );
};

export default PrivacyPolicy;
