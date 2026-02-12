import { LogOut } from "lucide-react";
import BrandIcon from "@/components/BrandIcon";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="relative container mx-auto px-4 py-6 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-3 hover:scale-105 transition-transform">
        <div className="p-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
          <BrandIcon className="w-6 h-6" />
        </div>
        <span className="text-2xl font-bold">VoiceLink</span>
      </Link>
      
      <div className="flex items-center gap-4 md:gap-6">
        <Link to="/" className={`text-sm font-medium transition-all duration-200 px-4 py-2 rounded-lg hover:bg-white/10`}>
          Home
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
