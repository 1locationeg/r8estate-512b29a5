import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Building2, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ReviewBlockedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentName?: string;
  childProjects: { id: string; name: string }[];
  onSelectProject?: (projectId: string, projectName: string) => void;
}

export const ReviewBlockedModal = ({
  open,
  onOpenChange,
  parentName,
  childProjects,
  onSelectProject,
}: ReviewBlockedModalProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
              <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <DialogTitle className="text-lg">
                Project-Level Reviews Only
              </DialogTitle>
              <DialogDescription className="mt-1">
                Reviews for individual projects help buyers make better decisions
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <p className="text-sm text-muted-foreground">
            {parentName
              ? `We're currently collecting reviews for ${parentName}'s individual projects and compounds. Please select a project below to share your experience.`
              : `This entity is currently accepting reviews at the project level only. Please select a specific project to review.`}
          </p>

          {childProjects.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Available Projects
              </p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {childProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => {
                      onSelectProject?.(project.id, project.name);
                      onOpenChange(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors text-left"
                  >
                    <Building2 className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm font-medium flex-1">{project.name}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 bg-muted/50 rounded-lg">
              <Building2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No projects listed yet. Check back soon!
              </p>
            </div>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
