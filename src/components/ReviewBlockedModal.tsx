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
                {t("review.project_level_only")}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {t("review.project_level_desc")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <p className="text-sm text-muted-foreground">
            {parentName
              ? t("review.select_project_parent", { name: parentName })
              : t("review.select_project_generic")}
          </p>

          {childProjects.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("review.available_projects")}
              </p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {childProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => {
                      onSelectProject?.(project.id, project.name);
                      onOpenChange(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors text-start"
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
                {t("review.no_projects_yet")}
              </p>
            </div>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            {t("form.close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
