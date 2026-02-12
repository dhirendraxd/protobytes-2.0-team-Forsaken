import { Menu, X, LogOut, Shield, User, Home, Settings } from "lucide-react";
import BrandIcon from "@/components/BrandIcon";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState<{fullName?: string; email?: string} | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

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

  const isActive = (path: string) => location.pathname === path;

  const confirmLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userData');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('hasLoggedInBefore');
    setIsLoggedIn(false);
    setUserData(null);
    setShowLogoutConfirm(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="relative container mx-auto px-4 py-6 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-3 hover:scale-105 transition-transform">
        <div className="p-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
          <BrandIcon className="w-6 h-6" />
        </div>
        <span className="text-2xl font-bold">VoiceLink</span>
      </Link>
      
      <div className="flex items-center gap-4 md:gap-6">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/market-prices" className={`text-sm font-medium transition-all duration-200 ${isActive('/market-prices') ? 'text-white underline' : 'hover:text-white hover:underline'}`}>
            {t('navigation.marketPrices')}
          </Link>
          <Link to="/transport" className={`text-sm font-medium transition-all duration-200 ${isActive('/transport') ? 'text-white underline' : 'hover:text-white hover:underline'}`}>
            {t('navigation.transport')}
          </Link>
          <Link to="/contributions" className={`text-sm font-medium transition-all duration-200 ${isActive('/contributions') ? 'text-white underline' : 'hover:text-white hover:underline'}`}>
            {t('navigation.contributors')}
          </Link>
        </div>
        
        {/* Mobile Menu Button - for both logged-in and non-logged-in */}
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/10"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          
          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-gradient-to-b from-primary to-primary/90 border-t border-white/10 shadow-lg md:hidden z-50">
              <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
                <Link 
                  to="/market-prices" 
                  className={`text-sm font-medium transition-all duration-200 py-2 ${isActive('/market-prices') ? 'text-white underline' : 'hover:text-white'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('navigation.marketPrices')}
                </Link>
                <Link 
                  to="/transport" 
                  className={`text-sm font-medium transition-all duration-200 py-2 ${isActive('/transport') ? 'text-white underline' : 'hover:text-white'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('navigation.transport')}
                </Link>
                <Link 
                  to="/contributions" 
                  className={`text-sm font-medium transition-all duration-200 py-2 ${isActive('/contributions') ? 'text-white underline' : 'hover:text-white'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('navigation.contributors')}
                </Link>
                
                {isLoggedIn && (
                  <>
                    <div className="border-t border-white/20 my-2"></div>
                    <Link 
                      to="/dashboard" 
                      className={`text-sm font-medium transition-all duration-200 py-2 flex items-center gap-2 ${isActive('/dashboard') ? 'text-white' : 'hover:text-white'}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Home className="w-4 h-4" />
                      {t('navigation.dashboard')}
                    </Link>
                    <button
                      onClick={() => setShowLogoutConfirm(true)}
                      className="text-sm font-medium transition-all duration-200 py-2 text-white hover:text-white flex items-center gap-2 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('navigation.logout')}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Desktop Auth Section */}
        {isLoggedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
              >
                <User className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{userData?.fullName || userData?.full_name || 'Moderator'}</span>
                  <span className="text-xs text-muted-foreground">{userData?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/dashboard" className="cursor-pointer flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  <span>{t('navigation.dashboard')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/contributions" className="cursor-pointer flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Contributions</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowLogoutConfirm(true)}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('navigation.logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link to="/auth" className={`text-sm font-medium transition-all duration-200 px-4 py-2 rounded-lg ${isActive('/auth') ? 'text-white bg-white/20' : 'hover:bg-white/10'}`}>
            {t('navigation.auth')}
          </Link>
        )}
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You'll need to sign in again to access your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmLogout}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Logout
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </nav>
  );
};

export default Navbar;

const Users = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292m7.753 2.905A9 9 0 1020.618 3.382m-1.414 8.387a4 4 0 11-5.657 5.657" />
  </svg>
);
