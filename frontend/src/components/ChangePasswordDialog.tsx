import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { Loader2, KeyRound } from "lucide-react";

export const ChangePasswordDialog = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get user data from localStorage
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const userEmail = localStorage.getItem('userEmail');

      if (!userEmail) {
        toast({
          title: "Error",
          description: "User session not found. Please login again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Verify current password
      if (userData.password !== currentPassword) {
        toast({
          title: "Incorrect Password",
          description: "Your current password is incorrect.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Validate new password
      if (newPassword.length < 6) {
        toast({
          title: "Invalid Password",
          description: "New password must be at least 6 characters long.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Check if passwords match
      if (newPassword !== confirmPassword) {
        toast({
          title: "Passwords Don't Match",
          description: "New password and confirmation don't match.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Find user's application document
      const applicationsRef = collection(db, "mod_applications");
      const q = query(
        applicationsRef,
        where("email", "==", userEmail),
        where("status", "==", "approved")
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          title: "Error",
          description: "Could not find your application record.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Update password in Firestore
      const docRef = doc(db, "mod_applications", querySnapshot.docs[0].id);
      await updateDoc(docRef, {
        password: newPassword,
      });

      // Update localStorage
      const updatedUserData = { ...userData, password: newPassword };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));

      toast({
        title: "Password Changed!",
        description: "Your password has been updated successfully.",
      });

      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setOpen(false);
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <KeyRound className="w-4 h-4 mr-2" />
          Change Password
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Update your password to keep your account secure.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleChangePassword}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
