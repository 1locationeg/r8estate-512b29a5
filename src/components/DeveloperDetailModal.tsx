import { useState, useEffect } from "react";
import { Developer } from "@/data/mockData";
import { trackBuyerEngagement } from "@/lib/trackBuyerEngagement";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, CheckCircle, TrendingUp, Clock, Shield, AlertTriangle,
  Building2, Users, MapPin, CalendarDays, Briefcase, Banknote, FolderKanban
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface DeveloperDetailModalProps {
  developer: Developer | null;
  open: boolean;
  onClose: () => void;
}

export const DeveloperDetailModal = ({ developer, open, onClose }: DeveloperDetailModalProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Track developer view
  useEffect(() => {
    if (open && developer && user) {
      trackBuyerEngagement(user.id, 'developers_viewed');
    }
  }, [open, developer?.id, user]);

  const isUnlocked = !!user;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast({
          title: "Error",
          description: "Failed to sign in with Google. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Report Unlocked",
          description: "You now have full access to this developer's report.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = () => {
    onClose();
    navigate('/auth');
  };

  if (!developer) return null;

  const yearsInBusiness = new Date().getFullYear() - developer.yearEstablished;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary flex-shrink-0">
              <img src={developer.logo} alt={developer.name} className="w-full h-full object-cover" />
            </div>
            {developer.name}
          </DialogTitle>
          <DialogDescription>
            {t("developers.detailedReport", "Detailed business profile & reputation report")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Business Details Card */}
          <div className="bg-secondary/50 border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-foreground">{t("developers.businessDetails", "Business Details")}</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("developers.established", "Established")}</p>
                  <p className="text-sm font-semibold text-foreground">{developer.yearEstablished} ({yearsInBusiness} {t("developers.years", "yrs")})</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("developers.headquarters", "Headquarters")}</p>
                  <p className="text-sm font-semibold text-foreground">{developer.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("developers.employeesLabel", "Employees")}</p>
                  <p className="text-sm font-semibold text-foreground">{developer.employees.toLocaleString()}+</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FolderKanban className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("developers.projectsLabel", "Projects")}</p>
                  <p className="text-sm font-semibold text-foreground">{developer.projectsCompleted}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("developers.registeredUsers", "Registered Users")}</p>
                  <p className="text-sm font-semibold text-foreground">{developer.registeredUsers.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Banknote className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("developers.capital", "Capital")}</p>
                  <p className="text-sm font-semibold text-foreground">{developer.capital}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Specialties */}
          <div className="flex flex-wrap gap-2">
            {developer.specialties.map((spec) => (
              <span key={spec} className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
                {spec}
              </span>
            ))}
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {developer.sentimentScore.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">Sentiment Score</div>
            </div>
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold text-foreground">{developer.rating}</div>
              <div className="text-xs text-muted-foreground">Average Rating</div>
            </div>
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {developer.reviewCount.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Total Reviews</div>
            </div>
          </div>

          {isUnlocked ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Full Report Unlocked</span>
              </div>

              <div className="grid gap-4">
                <div className="bg-secondary/50 border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-primary" />
                    <h4 className="font-semibold">Delivery Performance</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">On-time Delivery Rate</span>
                      <span className="font-medium text-green-600">87%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average Delay</span>
                      <span className="font-medium text-amber-600">4.2 months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Projects On Schedule</span>
                      <span className="font-medium">12 of 14</span>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/50 border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <h4 className="font-semibold">Quality Assessment</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Build Quality Score</span>
                      <span className="font-medium">8.4/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Post-Handover Support</span>
                      <span className="font-medium text-amber-600">6.8/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Value for Money</span>
                      <span className="font-medium">7.5/10</span>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/50 border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-primary" />
                    <h4 className="font-semibold">Financial Health</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Escrow Compliance</span>
                      <span className="font-medium text-green-600">100%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Plan Flexibility</span>
                      <span className="font-medium">High</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Financial Stability</span>
                      <span className="font-medium text-green-600">Strong</span>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/50 border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <h4 className="font-semibold">Risk Factors</h4>
                  </div>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Some projects experienced 6+ month delays</li>
                    <li>• Mixed reviews on post-handover support</li>
                    <li>• Premium pricing compared to market average</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="blur-sm pointer-events-none opacity-40 space-y-3">
                <div className="bg-secondary/50 border border-border rounded-lg p-4 h-24" />
                <div className="bg-secondary/50 border border-border rounded-lg p-4 h-24" />
                <div className="bg-secondary/50 border border-border rounded-lg p-4 h-20" />
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-card border border-border rounded-lg p-8 space-y-6 shadow-xl max-w-sm w-full">
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-foreground">
                      Sign in to unlock detailed report
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Access comprehensive reputation data and insights
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full h-12 text-base gap-3"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      {isLoading ? "Signing in..." : "Continue with Google"}
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">or</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleEmailSignIn}
                      variant="outline"
                      className="w-full h-12 text-base gap-3"
                    >
                      <Mail className="w-5 h-5" />
                      Continue with Email
                    </Button>
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    By continuing, you agree to R8ESTATE's{" "}
                    <button className="underline hover:text-foreground transition-colors">
                      Trust Manifesto
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
