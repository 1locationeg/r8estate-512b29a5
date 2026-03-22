import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DisclaimerModalProps {
  open: boolean;
  onClose: () => void;
}

export const DisclaimerModal = ({ open, onClose }: DisclaimerModalProps) => {
  const { t } = useTranslation();

  const sections = Array.from({ length: 7 }, (_, i) => ({
    heading: t(`disclaimer.sections.${i}.heading`),
    content: t(`disclaimer.sections.${i}.content`),
  }));

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-base">{t("disclaimer.title")}</DialogTitle>
          <p className="text-[10px] text-muted-foreground">{t("disclaimer.lastUpdated")}</p>
        </DialogHeader>

        <ScrollArea className="px-6 max-h-[55vh]">
          <div className="space-y-4 pb-4">
            <p className="text-sm text-foreground leading-relaxed">{t("disclaimer.intro")}</p>

            {sections.map((s, i) => (
              <div key={i}>
                <h4 className="text-sm font-semibold text-foreground mb-1">
                  {i + 1}. {s.heading}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.content}</p>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="px-6 pb-4">
          <Button onClick={onClose} className="w-full" size="sm">
            {t("disclaimer.close", "Close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
