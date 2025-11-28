import { Developer } from "@/data/mockData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail } from "lucide-react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface DeveloperDetailModalProps {
  developer: Developer | null;
  open: boolean;
  onClose: () => void;
}

export const DeveloperDetailModal = ({ developer, open, onClose }: DeveloperDetailModalProps) => {
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      toast({
        title: "Success",
        description: `Signed in as ${result.user.email}`,
      });
      // TODO: Unlock the detailed report after successful sign-in
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEmailSignIn = () => {
    // TODO: Implement email sign-in flow
    toast({
      title: "Coming Soon",
      description: "Email authentication will be available soon.",
    });
  };

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

          {/* Sign Up / Login Card */}
          <div className="bg-card border border-border rounded-lg p-8 space-y-6">
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
                variant="outline"
                className="w-full h-12 text-base gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
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
      </DialogContent>
    </Dialog>
  );
};
