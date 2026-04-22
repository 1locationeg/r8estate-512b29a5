import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  Camera,
  Upload,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ScanLine,
  Lock,
  FileText,
  X,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  loadImageFromFile,
  fileToDataUrl,
  renderRedactedBlob,
  type NormalizedBox,
  type RedactionField,
} from "@/lib/contractRedaction";
import { fireCorridorEngage } from "@/lib/corridorEvents";

interface SecureContractUploadProps {
  developerId?: string | null;
  developerName?: string | null;
  /** Called once a redacted submission is saved successfully. */
  onSubmitted?: (submissionId: string) => void;
  /** When true, hides the inner submit button — parent handles submission via ref-style flow. */
  className?: string;
}

type Step = "upload" | "scanning" | "preview" | "submitting" | "done";

interface AnalysisResult {
  document_type: "reservation_form" | "payment_receipt" | "sale_contract" | "unknown";
  extracted_developer_name: string;
  redactions: NormalizedBox[];
  authenticity_score: number;
  authenticity_label: "authentic" | "needs_review" | "suspicious";
  authenticity_flags: string[];
}

const MAX_FILE_BYTES = 8 * 1024 * 1024;

const FIELD_LABEL_KEYS: Record<RedactionField, string> = {
  name: "verification.contract.fields.name",
  national_id: "verification.contract.fields.national_id",
  phone: "verification.contract.fields.phone",
  address: "verification.contract.fields.address",
  contract_value: "verification.contract.fields.contract_value",
  signature: "verification.contract.fields.signature",
  account_number: "verification.contract.fields.account_number",
  email: "verification.contract.fields.email",
};

const DOC_TYPE_LABEL_KEYS: Record<AnalysisResult["document_type"], string> = {
  reservation_form: "verification.contract.docTypes.reservation_form",
  payment_receipt: "verification.contract.docTypes.payment_receipt",
  sale_contract: "verification.contract.docTypes.sale_contract",
  unknown: "verification.contract.docTypes.unknown",
};

export const SecureContractUpload = ({
  developerId,
  developerName,
  onSubmitted,
  className,
}: SecureContractUploadProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [progress, setProgress] = useState(0);
  const [redactedPreview, setRedactedPreview] = useState<string | null>(null);
  const [redactedBlob, setRedactedBlob] = useState<Blob | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const reset = () => {
    setStep("upload");
    setProgress(0);
    setRedactedPreview(null);
    setRedactedBlob(null);
    setAnalysis(null);
    setErrorMsg(null);
  };

  const handleFile = useCallback(
    async (file: File) => {
      if (!user) {
        toast.error(t("verification.contract.signInRequired", "Please sign in to upload a contract."));
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        toast.error(t("verification.contract.tooLarge", "File too large. Max 8MB."));
        return;
      }
      if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
        toast.error(t("verification.contract.unsupported", "Only images or PDF are supported."));
        return;
      }
      // PDF handling: only accept image previews in v1; ask for a photo instead.
      if (file.type === "application/pdf") {
        toast.error(
          t(
            "verification.contract.pdfHint",
            "PDF support is coming soon. Please upload a photo or screenshot of the document.",
          ),
        );
        return;
      }

      setErrorMsg(null);
      setStep("scanning");
      setProgress(15);
      fireCorridorEngage(4, "contract_upload_started");

      try {
        // Load image client-side. Original never leaves the browser as raw bytes —
        // we send a downscaled data URL to the AI for analysis only.
        const img = await loadImageFromFile(file);
        setProgress(35);

        // Downscale for AI analysis to keep costs / latency bounded.
        const aiCanvas = document.createElement("canvas");
        const aiMax = 1280;
        const aiScale = img.naturalWidth > aiMax ? aiMax / img.naturalWidth : 1;
        aiCanvas.width = Math.round(img.naturalWidth * aiScale);
        aiCanvas.height = Math.round(img.naturalHeight * aiScale);
        const aiCtx = aiCanvas.getContext("2d");
        if (!aiCtx) throw new Error("Canvas unavailable");
        aiCtx.drawImage(img, 0, 0, aiCanvas.width, aiCanvas.height);
        const aiDataUrl = aiCanvas.toDataURL("image/jpeg", 0.82);

        setProgress(55);

        const { data, error } = await supabase.functions.invoke("verify-contract", {
          body: { image_data_url: aiDataUrl },
        });
        if (error) {
          // Try to surface server message
          const msg = (error as any)?.message || t("verification.contract.aiError", "Could not analyze document.");
          throw new Error(msg);
        }
        const result = data as AnalysisResult;

        setProgress(80);

        // Render redacted output from the ORIGINAL high-res image.
        const { blob, dataUrl } = await renderRedactedBlob(img, result.redactions, {
          maxWidth: 1600,
          quality: 0.85,
        });

        setRedactedBlob(blob);
        setRedactedPreview(dataUrl);
        setAnalysis(result);
        setProgress(100);
        setStep("preview");
        fireCorridorEngage(4, "contract_redaction_complete");
      } catch (err) {
        console.error("Contract verify error", err);
        const msg = err instanceof Error ? err.message : t("verification.contract.aiError", "Could not analyze document.");
        setErrorMsg(msg);
        toast.error(msg);
        setStep("upload");
        setProgress(0);
      }
    },
    [t, user],
  );

  const handleSubmit = async () => {
    if (!user || !redactedBlob || !analysis) return;
    setStep("submitting");
    try {
      const path = `receipts/${user.id}/${Date.now()}-redacted.jpg`;
      const { error: upErr } = await supabase.storage
        .from("review-attachments")
        .upload(path, redactedBlob, { contentType: "image/jpeg", upsert: false });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("review-attachments").getPublicUrl(path);

      const redactedFields = Array.from(new Set(analysis.redactions.map((r) => r.field)));

      const { data: inserted, error: insErr } = await supabase
        .from("receipt_submissions")
        .insert({
          user_id: user.id,
          developer_id: developerId || null,
          developer_name: developerName || analysis.extracted_developer_name || null,
          image_url: urlData.publicUrl,
          redacted_image_url: urlData.publicUrl,
          status: "pending",
          document_type: analysis.document_type,
          authenticity_score: analysis.authenticity_score,
          authenticity_label: analysis.authenticity_label,
          authenticity_flags: analysis.authenticity_flags,
          redacted_fields: redactedFields,
          extracted_developer_name: analysis.extracted_developer_name || null,
        } as any)
        .select("id")
        .single();
      if (insErr) throw insErr;

      fireCorridorEngage(4, "contract_submitted_for_verification");
      toast.success(t("verification.contract.submitted", "Contract submitted — protected and on its way to admins."));
      setStep("done");
      onSubmitted?.((inserted as any).id);
    } catch (err) {
      console.error("Contract submit error", err);
      toast.error(t("verification.contract.submitError", "Failed to submit. Please try again."));
      setStep("preview");
    }
  };

  // ===== UI =====

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = "";
  };

  const labelColor =
    analysis?.authenticity_label === "authentic"
      ? "border-trust-excellent/40 bg-trust-excellent/10 text-trust-excellent"
      : analysis?.authenticity_label === "needs_review"
        ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
        : "border-destructive/40 bg-destructive/10 text-destructive";

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-primary/15 bg-gradient-to-br from-background via-background to-primary/5 p-4 sm:p-5",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Lock className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-foreground text-sm sm:text-base flex items-center gap-2 flex-wrap">
            {t("verification.contract.title", "Secure contract verification")}
            <Badge variant="outline" className="border-accent/40 bg-accent/10 text-[10px] px-1.5 py-0 h-5">
              <ShieldCheck className="w-3 h-3 me-1" />
              {t("verification.contract.privacyBadge", "Auto-redacted")}
            </Badge>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {t(
              "verification.contract.subtitle",
              "We blur your name, ID, phone and contract value before anything is sent. Your private data never leaves your device unprotected.",
            )}
          </p>
        </div>
      </div>

      {/* Step: Upload */}
      {step === "upload" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPick}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={onPick}
            />
            <Button variant="outline" className="h-auto py-3 flex-col gap-1" onClick={() => cameraInputRef.current?.click()}>
              <Camera className="w-5 h-5" />
              <span className="text-xs">{t("verification.contract.takePhoto", "Take photo")}</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-1" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-5 h-5" />
              <span className="text-xs">{t("verification.contract.uploadFile", "Upload file")}</span>
            </Button>
          </div>
          <div className="flex items-start gap-2 text-[11px] text-muted-foreground bg-muted/40 rounded-md p-2.5">
            <ShieldCheck className="w-3.5 h-3.5 text-trust-excellent flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              {t(
                "verification.contract.privacyNote",
                "JPG or PNG up to 8MB. PDFs coming soon. Sensitive fields are detected and blurred on-device before upload.",
              )}
            </span>
          </div>
          {errorMsg && (
            <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 rounded-md p-2.5">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      )}

      {/* Step: Scanning */}
      {step === "scanning" && (
        <div className="space-y-3 py-2">
          <div className="relative h-32 rounded-lg border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent overflow-hidden flex items-center justify-center">
            <ScanLine className="w-10 h-10 text-primary animate-pulse" />
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent animate-[scan_2s_ease-in-out_infinite]" />
          </div>
          <Progress value={progress} className="h-1.5" />
          <p className="text-xs text-center text-muted-foreground">
            {t("verification.contract.scanning", "Detecting sensitive fields and authenticity signals…")}
          </p>
          <style>{`@keyframes scan { 0% { transform: translateY(0); } 50% { transform: translateY(128px); } 100% { transform: translateY(0); } }`}</style>
        </div>
      )}

      {/* Step: Preview */}
      {step === "preview" && analysis && redactedPreview && (
        <div className="space-y-3">
          {/* Authenticity badge row */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <Badge variant="outline" className={cn("text-xs px-2 py-1 h-auto", labelColor)}>
              {analysis.authenticity_label === "authentic" && <CheckCircle2 className="w-3.5 h-3.5 me-1.5" />}
              {analysis.authenticity_label === "needs_review" && <AlertTriangle className="w-3.5 h-3.5 me-1.5" />}
              {analysis.authenticity_label === "suspicious" && <AlertTriangle className="w-3.5 h-3.5 me-1.5" />}
              {t(`verification.contract.labels.${analysis.authenticity_label}`, analysis.authenticity_label)}
              <span className="ms-1.5 opacity-70">· {analysis.authenticity_score}/100</span>
            </Badge>
            <Badge variant="outline" className="text-[10px] gap-1">
              <FileText className="w-3 h-3" />
              {t(DOC_TYPE_LABEL_KEYS[analysis.document_type], analysis.document_type)}
            </Badge>
          </div>

          {/* Redacted preview */}
          <div className="rounded-lg overflow-hidden border border-border bg-muted/30">
            <img src={redactedPreview} alt="Redacted contract" className="w-full max-h-72 object-contain" />
          </div>

          {/* What was protected */}
          <div className="rounded-lg bg-trust-excellent/5 border border-trust-excellent/20 p-3">
            <p className="text-xs font-semibold text-trust-excellent mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t("verification.contract.protectedTitle", "Protected before upload")}
            </p>
            {analysis.redactions.length === 0 ? (
              <p className="text-[11px] text-muted-foreground">
                {t("verification.contract.noFieldsDetected", "No sensitive fields were detected. You can still submit.")}
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {Array.from(new Set(analysis.redactions.map((r) => r.field))).map((f) => (
                  <Badge key={f} variant="secondary" className="text-[10px] gap-1 bg-trust-excellent/10 text-trust-excellent border-0">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    {t(FIELD_LABEL_KEYS[f as RedactionField], f)}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Flags (only if useful) */}
          {analysis.authenticity_flags.length > 0 && (
            <details className="rounded-md border border-border/60 bg-muted/20 p-2 text-xs">
              <summary className="cursor-pointer text-muted-foreground select-none">
                {t("verification.contract.flagsTitle", "Authenticity signals")} ({analysis.authenticity_flags.length})
              </summary>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {analysis.authenticity_flags.map((f) => (
                  <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-background border border-border text-muted-foreground">
                    {f.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </details>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={reset} className="flex-1">
              <RotateCcw className="w-3.5 h-3.5 me-1.5" />
              {t("verification.contract.startOver", "Start over")}
            </Button>
            <Button size="sm" onClick={handleSubmit} className="flex-1">
              <ShieldCheck className="w-3.5 h-3.5 me-1.5" />
              {t("verification.contract.submit", "Submit for verification")}
            </Button>
          </div>
        </div>
      )}

      {/* Step: Submitting */}
      {step === "submitting" && (
        <div className="py-6 text-center space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
          <p className="text-xs text-muted-foreground">
            {t("verification.contract.submitting", "Uploading the protected version…")}
          </p>
        </div>
      )}

      {/* Step: Done */}
      {step === "done" && (
        <div className="py-6 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-trust-excellent/10 border-2 border-trust-excellent flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-trust-excellent" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">
              {t("verification.contract.doneTitle", "Submitted securely")}
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto leading-relaxed">
              {t(
                "verification.contract.doneSubtitle",
                "Your document is in review. You'll get a notification when admins approve your Verified Buyer badge.",
              )}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={reset}>
            {t("verification.contract.uploadAnother", "Upload another")}
          </Button>
        </div>
      )}
    </Card>
  );
};

export default SecureContractUpload;
