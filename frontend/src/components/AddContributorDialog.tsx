import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/config/firebase";

interface AddContributorDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  onContributorAdded?: () => void;
}

export const AddContributorDialog = ({ 
  open: externalOpen, 
  onOpenChange, 
  onSuccess,
  onContributorAdded 
}: AddContributorDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    
    const contributorData = {
      name: formData.get("name") as string,
      area: formData.get("area") as string,
      role: formData.get("role") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      bio: formData.get("bio") as string,
      contributions: 0,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, "contributors"), contributorData);
      
      toast({
        title: "Success!",
        description: "Contributor added successfully.",
      });
      
      setOpen(false);
      (e.target as HTMLFormElement).reset();
      onContributorAdded?.();
      onSuccess?.();
    } catch (error) {
      console.error("Error adding contributor:", error);
      toast({
        title: "Error",
        description: "Failed to add contributor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Contributor
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Contributor</DialogTitle>
          <DialogDescription>
            Add a new community reporter or contributor. Their profile will be visible to all viewers.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ram Bahadur Thapa"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select name="role" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Community Reporter">Community Reporter</SelectItem>
                    <SelectItem value="Market Reporter">Market Reporter</SelectItem>
                    <SelectItem value="Transport Reporter">Transport Reporter</SelectItem>
                    <SelectItem value="Health Reporter">Health Reporter</SelectItem>
                    <SelectItem value="Agriculture Expert">Agriculture Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Area/Coverage *</Label>
              <Input
                id="area"
                name="area"
                placeholder="Ward 1-3, Pokhara"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="98XXXXXXXX"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="contributor@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio/Description</Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="Brief description about the contributor and their expertise..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Contributor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
