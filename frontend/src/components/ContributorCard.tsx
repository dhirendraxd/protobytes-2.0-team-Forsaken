import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Edit, Trash2 } from "lucide-react";

export interface Contributor {
  id: string;
  name: string;
  area?: string;
  village?: string;
  province?: string;
  role: string;
  phone: string;
  email?: string;
  bio?: string;
  contributions?: number;
  status: string;
  created_at: string;
}

interface ContributorCardProps {
  contributor: Contributor;
  showActions?: boolean;
  onEdit?: (contributor: Contributor) => void;
  onDelete?: (id: string) => void;
}

export const ContributorCard = ({ 
  contributor, 
  showActions = false,
  onEdit,
  onDelete 
}: ContributorCardProps) => {
  const name = contributor.name?.trim() || "Unknown"; // Avoid runtime crashes when name is missing
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <Card className="p-6 hover:shadow-[var(--card-shadow-hover)] transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-lg text-foreground">{name}</h3>
              <Badge variant="secondary" className="mt-1">{contributor.role}</Badge>
            </div>
            {showActions && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit?.(contributor)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete?.(contributor.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>{contributor.area || `${contributor.village || 'Unknown'}, ${contributor.province || 'Unknown'}`}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span>{contributor.phone}</span>
            </div>
            {contributor.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>{contributor.email}</span>
              </div>
            )}
          </div>

          {contributor.bio && (
            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
              {contributor.bio}
            </p>
          )}

          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-primary">{contributor.contributions || 0}</span> verified contributions
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
