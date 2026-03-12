import { Shield, MapPin, Star, Edit, Share2, ExternalLink, Building2, Calendar, Users, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrustGaugeMini } from '@/components/TrustGaugeMini';
import { Progress } from '@/components/ui/progress';

interface BusinessProfileHeaderProps {
  company: {
    name: string;
    logo?: string;
    location: string;
    established: number;
    employees: number;
    specialties: string[];
    rating: number;
    reviewCount: number;
    trustScore: number;
    isVerified: boolean;
  };
  profileCompletion: number;
  onEditProfile?: () => void;
  onSharePage?: () => void;
  onViewPublic?: () => void;
}

export const BusinessProfileHeader = ({
  company,
  profileCompletion,
  onEditProfile,
  onSharePage,
  onViewPublic,
}: BusinessProfileHeaderProps) => {
  return (
    <div className="space-y-4 mb-8">
      {/* Main Profile Card */}
      <div className="bg-card border border-border rounded-xl p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-5">
          {/* Logo / Avatar */}
          <div className="flex-shrink-0">
            <Avatar className="h-20 w-20 rounded-xl border-2 border-border">
              {company.logo && <AvatarImage src={company.logo} alt={company.name} className="rounded-xl" />}
              <AvatarFallback className="rounded-xl bg-primary/10 text-primary text-2xl font-bold">
                {company.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-foreground">{company.name}</h2>
                  {company.isVerified && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-verified/10 border border-verified rounded-full">
                      <Shield className="w-3 h-3 text-verified fill-verified" />
                      <span className="text-[10px] font-semibold text-verified-foreground">Verified</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{company.location}</span>
                </div>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Est. {company.established}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {company.employees} Employees
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    {company.specialties.length} Specialties
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {company.specialties.slice(0, 4).map((s) => (
                    <Badge key={s} variant="secondary" className="text-[10px] font-medium px-2 py-0.5">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Trust + Rating */}
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <TrustGaugeMini score={company.trustScore} size={64} />
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 mb-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.round(company.rating) ? 'text-accent fill-accent' : 'text-muted'}`}
                      />
                    ))}
                  </div>
                  <p className="text-lg font-bold text-foreground">{company.rating.toFixed(1)}</p>
                  <p className="text-[10px] text-muted-foreground">{company.reviewCount} reviews</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={onEditProfile}>
                <Edit className="w-3.5 h-3.5" />
                Edit Profile
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={onSharePage}>
                <Share2 className="w-3.5 h-3.5" />
                Share Page
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={onViewPublic}>
                <ExternalLink className="w-3.5 h-3.5" />
                View Public Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Completion */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Profile Completion</span>
          </div>
          <span className="text-sm font-bold text-foreground">{profileCompletion}%</span>
        </div>
        <Progress value={profileCompletion} className="h-2" />
        {profileCompletion < 100 && (
          <p className="text-[11px] text-muted-foreground mt-2">
            Complete your profile to increase visibility and build trust with buyers.
          </p>
        )}
      </div>
    </div>
  );
};
