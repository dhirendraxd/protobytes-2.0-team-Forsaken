import { Button } from "@/components/ui/button";
import { User, Globe } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { i18n } = useTranslation();
  
  const isActive = (path: string) => location.pathname === path;
  const isDashboard = location.pathname === "/dashboard";

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ne' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <nav className="mb-6 flex items-center justify-between bg-[#efefef] px-6 py-5 sm:px-8 rounded-xl">
      <Link to="/" className="flex items-center gap-1.5 text-lg font-semibold text-black">
        <span>VoiceLink</span>
        <span className="inline-block h-5 w-5 rounded-full bg-lime-300" />
      </Link>

      {!isDashboard && (
        <div className="hidden items-center gap-8 text-sm font-medium md:flex">
          <Link 
            to="/features" 
            className={`transition-colors ${
              isActive("/features") 
                ? "text-black underline decoration-2 decoration-lime-300 underline-offset-4" 
                : "text-black/70 hover:text-black"
            }`}
          >
            Features
          </Link>
          <Link 
            to="/pricing" 
            className={`transition-colors ${
              isActive("/pricing") 
                ? "text-black underline decoration-2 decoration-lime-300 underline-offset-4" 
                : "text-black/70 hover:text-black"
            }`}
          >
            Pricing
          </Link>
          <Link 
            to="/why-us" 
            className={`transition-colors ${
              isActive("/why-us") 
                ? "text-black underline decoration-2 decoration-lime-300 underline-offset-4" 
                : "text-black/70 hover:text-black"
            }`}
          >
            Why Us
          </Link>
          <Link 
            to="/contact" 
            className={`transition-colors ${
              isActive("/contact") 
                ? "text-black underline decoration-2 decoration-lime-300 underline-offset-4" 
                : "text-black/70 hover:text-black"
            }`}
          >
            Contact
          </Link>
        </div>
      )}

      {isDashboard && user && (
        <div className="hidden items-center gap-8 text-sm font-medium md:flex">
          <Link 
            to="/" 
            className={`transition-colors ${
              isActive("/") 
                ? "text-black underline decoration-2 decoration-lime-300 underline-offset-4" 
                : "text-black/70 hover:text-black"
            }`}
          >
            Home
          </Link>
          <Link 
            to="/about" 
            className={`transition-colors ${
              isActive("/about") 
                ? "text-black underline decoration-2 decoration-lime-300 underline-offset-4" 
                : "text-black/70 hover:text-black"
            }`}
          >
            About Us
          </Link>
          <Link 
            to="/contact" 
            className={`transition-colors ${
              isActive("/contact") 
                ? "text-black underline decoration-2 decoration-lime-300 underline-offset-4" 
                : "text-black/70 hover:text-black"
            }`}
          >
            Contact Us
          </Link>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLanguage}
          className="h-10 rounded-full px-3 text-sm text-black hover:bg-black/5"
          title={i18n.language === 'en' ? 'नेपाली' : 'English'}
        >
          <Globe className="h-5 w-5" />
          <span className="ml-1 text-xs font-semibold">
            {i18n.language === 'en' ? 'NE' : 'EN'}
          </span>
        </Button>
        {user ? (
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="h-10 rounded-full px-4 text-sm text-gray-900 hover:bg-black/5">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="h-6 w-6 rounded-full" />
              ) : (
                <User className="h-5 w-5" />
              )}
            </Button>
          </Link>
        ) : (
          <Link to="/auth">
            <Button size="sm" className="h-10 rounded-full bg-black px-5 text-sm text-white hover:bg-lime-600 active:scale-95 transition-all">
              Log In
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
