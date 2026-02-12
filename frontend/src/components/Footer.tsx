import { Link } from "react-router-dom";
import { Home, Users, Shield } from "lucide-react";
import BrandIcon from "@/components/BrandIcon";

interface FooterProps {
  isLoggedIn?: boolean;
}

const Footer = ({ isLoggedIn = false }: FooterProps) => {
  return (
    <footer className="bg-card border-t border-border mt-12">
      <div className="container mx-auto px-4 py-8">
        {isLoggedIn ? (
          // Logged-in User Footer
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Quick Actions */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Home className="w-4 h-4 text-primary" />
                Quick Access
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                    → My Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/market-prices" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Market Prices
                  </Link>
                </li>
                <li>
                  <Link to="/transport" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Transport Info
                  </Link>
                </li>
                <li>
                  <Link to="/contributions" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Contributions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Moderator Tools */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-accent" />
                Your Team
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/dashboard?tab=contributors" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Manage Contributors
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard?tab=applications" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Pending Applications
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard?tab=alerts" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Review Alerts
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          // Viewer/Guest Footer
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <BrandIcon className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold">VoiceLink</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Connecting rural communities with essential information through voice and web.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/market-prices" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Market Prices
                  </Link>
                </li>
                <li>
                  <Link to="/transport" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Transport
                  </Link>
                </li>
                <li>
                  <Link to="/contributions" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Contributions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Get Involved */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Get Involved</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/apply-moderator" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Become a Moderator
                  </Link>
                </li>
                <li>
                  <Link to="/apply-contributor" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Become a Contributor
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                    → Login
                  </Link>
                </li>
              </ul>
            </div>

          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
