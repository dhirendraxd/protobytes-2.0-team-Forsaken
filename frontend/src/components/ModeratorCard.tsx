import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Shield, Calendar, TrendingUp, User } from "lucide-react";

export interface Moderator {
  id: string;
  name: string;
  email: string;
  phone: string;
  village: string;
  province: string;
  dateOfBirth?: string;
  profilePhoto?: string;
  moderations?: number;
  joinedDate?: string;
  type: 'moderator';
}

interface ModeratorCardProps {
  moderator: Moderator;
}

export const ModeratorCard = ({ moderator }: ModeratorCardProps) => {
  const name = moderator.name?.trim() || "Unknown"; // Avoid runtime crashes when name is missing
  // Calculate age from DOB
  const calculateAge = (dob: string) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = moderator.dateOfBirth ? calculateAge(moderator.dateOfBirth) : null;

  return (
    <Card className="p-6 hover:shadow-[var(--card-shadow-hover)] transition-shadow border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="flex items-start gap-4">
        {/* Profile Photo */}
        <div className="relative flex-shrink-0">
          {moderator.profilePhoto ? (
            <img 
              src={moderator.profilePhoto} 
              alt={name}
              className="w-20 h-20 rounded-full object-cover border-4 border-primary/20"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary border-4 border-primary/20">
              {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1.5 rounded-full">
            <Shield className="w-4 h-4" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-bold text-xl text-foreground">{name}</h3>
              <Badge className="mt-1 bg-primary text-white">
                <Shield className="w-3 h-3 mr-1" />
                Moderator
              </Badge>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2 text-sm mt-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 flex-shrink-0 text-primary" />
              <span className="font-medium">{moderator.village}, {moderator.province}</span>
            </div>

            {/* Date of Birth / Age */}
            {moderator.dateOfBirth && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4 flex-shrink-0 text-primary" />
                <span>
                  {age && `${age} years old`}
                  {moderator.dateOfBirth && ` • Born ${new Date(moderator.dateOfBirth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                </span>
              </div>
            )}

            {/* Join Date */}
            {moderator.joinedDate && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4 flex-shrink-0 text-primary" />
                <span>Joined {new Date(moderator.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="mt-4 pt-4 border-t border-primary/20 bg-white/50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Moderations</p>
                <p className="text-2xl font-bold text-primary">{moderator.moderations || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
