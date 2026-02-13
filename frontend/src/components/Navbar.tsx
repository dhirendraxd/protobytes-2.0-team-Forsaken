import { Button } from "@/components/ui/button";
import { LogOut, Shield, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  const isDashboard = location.pathname === "/dashboard";

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
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-10 rounded-full px-4 text-sm text-gray-900 hover:bg-black/5">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="h-6 w-6 rounded-full" />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link to="/dashboard" className="cursor-pointer text-sm">
                  <Shield className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <button
                  onClick={async () => await signOut()}
                  className="w-full cursor-pointer text-left text-sm text-red-600"
                >
                  <LogOut className="mr-2 inline h-4 w-4" />
                  Logout
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
