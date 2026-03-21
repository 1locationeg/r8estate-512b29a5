import { useTranslation } from "react-i18next";
import { FileSearch, Upload, Clock, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ContractUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ContractUploadModal = ({ open, onOpenChange }: ContractUploadModalProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-primary" />
            {t("contractModal.title", "Contract Health Check")}
          </DialogTitle>
          <DialogDescription>
            {t("contractModal.description", "Upload your real estate contract and our AI will scan it for risky clauses, missing terms, and unfair penalties.")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-6">
          {/* Upload area placeholder */}
          <div className="w-full border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 flex flex-col items-center gap-3 bg-muted/30">
            <Upload className="w-10 h-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground text-center">
              {t("contractModal.uploadHint", "PDF, DOCX, or image of your contract")}
            </p>
          </div>

          {/* Coming Soon badge */}
          <div className="flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-semibold">
              {t("contractModal.comingSoon", "Coming Soon")}
            </span>
          </div>

          {/* What you'll get */}
          <div className="w-full space-y-2 mt-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("contractModal.whatYouGet", "What you'll get")}
            </p>
            {[
              { color: "text-green-500", label: t("contractModal.feature1", "Safe clauses highlighted in green") },
              { color: "text-red-500", label: t("contractModal.feature2", "Risky terms flagged in red") },
              { color: "text-amber-500", label: t("contractModal.feature3", "Warnings for vague or missing terms") },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <ShieldCheck className={`w-4 h-4 ${f.color}`} />
                <span className="text-sm">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
          {t("common.close", "Close")}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ContractUploadModal;
