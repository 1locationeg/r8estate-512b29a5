import { Developer } from "@/data/mockData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Phone } from "lucide-react";

interface DeveloperDetailModalProps {
  developer: Developer | null;
  open: boolean;
  onClose: () => void;
}

export const DeveloperDetailModal = ({ developer, open, onClose }: DeveloperDetailModalProps) => {
  if (!developer) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <span className="text-4xl">{developer.logo}</span>
            {developer.name}
          </DialogTitle>
          <DialogDescription>
            Detailed reputation and performance report
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
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
                {developer.projectsCompleted}
              </div>
              <div className="text-xs text-muted-foreground">Projects Completed</div>
            </div>
          </div>

          {/* Blurred Report Section */}
          <div className="relative">
            <div className="blur-sm pointer-events-none select-none">
              <h3 className="text-lg font-semibold mb-3 text-foreground">Detailed Report</h3>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  • Comprehensive project delivery timeline analysis
                </p>
                <p className="text-sm text-muted-foreground">
                  • Customer satisfaction metrics and trends
                </p>
                <p className="text-sm text-muted-foreground">
                  • Financial stability and credit rating insights
                </p>
                <p className="text-sm text-muted-foreground">
                  • Quality control and construction standards
                </p>
                <p className="text-sm text-muted-foreground">
                  • After-sales service performance data
                </p>
                <p className="text-sm text-muted-foreground">
                  • Legal compliance and dispute resolution history
                </p>
              </div>
            </div>

            {/* Unlock Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="text-center space-y-4 p-6">
                <Shield className="w-12 h-12 text-primary mx-auto" />
                <h4 className="text-xl font-bold text-foreground">
                  Unlock Detailed Report
                </h4>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Verify your phone number to access comprehensive reputation data and insights
                </p>
                <Button className="gap-2">
                  <Phone className="w-4 h-4" />
                  Verify Number to Unlock
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
