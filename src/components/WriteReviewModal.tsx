import { useState, useRef, useCallback, useEffect } from "react";
import { DisclaimerCheckbox } from "@/components/DisclaimerCheckbox";
import { useTranslation } from "react-i18next";
import { checkContentLocally, checkContentWithAI, type AIModerationResult } from "@/lib/contentGuard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Star,
  Mic,
  MicOff,
  Sparkles,
  Paperclip,
  X,
  Camera,
  FileText,
  Shield,
  Loader2,
  Image as ImageIcon,
  Receipt,
  CheckCircle2,
  UserPlus,
  Lock,
  Mail,
  User,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { ConfettiCelebration } from "@/components/ConfettiCelebration";
import { Trophy } from "lucide-react";
import { TrustSignals } from "@/components/TrustSignals";
import { ReviewSuccessOverlay } from "@/components/ReviewSuccessOverlay";
import { BrandLogo } from "@/components/BrandLogo";
import type { SearchCategory } from "@/data/searchIndex";

interface WriteReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  developerName?: string;
  developerId?: string;
  onReviewSubmitted?: () => void;
  entityCategory?: string;
}

const EXPERIENCE_TYPES_KEYS = [
  "form.exp_buyer",
  "form.exp_agent",
  "form.exp_investor",
  "form.exp_construction",
  "form.exp_family",
];

const EMOJI_QUICK = ["👍", "👎", "⭐", "🏠", "💰", "🔑", "📋", "✅", "❌", "🏗️", "😊", "😤"];

const getCategoryMetricKeys = (category: string): string[] => {
  switch (category) {
    case 'developers': return ['delivery', 'quality', 'financial', 'support'];
    case 'projects': return ['progress', 'location', 'price', 'amenities'];
    case 'locations': return ['demand', 'infrastructure', 'potential', 'safety'];
    case 'apps': return ['usability', 'performance', 'features', 'support'];
    case 'units': return ['demand', 'roi', 'space', 'resale'];
    case 'brokers': return ['success', 'response', 'knowledge', 'negotiation'];
    default: return ['quality', 'reliability', 'value', 'satisfaction'];
  }
};

const PHASE_LABELS = ["Rating", "Your Review", "Category Ratings"];

export const WriteReviewModal = ({
  open,
  onOpenChange,
  developerName = "",
  developerId = "",
  onReviewSubmitted,
  entityCategory = "developers",
}: WriteReviewModalProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, signUp } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [firstReviewCelebration, setFirstReviewCelebration] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [successIsFirst, setSuccessIsFirst] = useState(false);
  const [successRating, setSuccessRating] = useState(5);

  // 3-phase state
  const [phase, setPhase] = useState(1);

  // Guest vs authenticated mode
  const isGuest = !user;

  // Post-submit account prompt state
  const [showAccountPrompt, setShowAccountPrompt] = useState(false);
  const [guestReviewId, setGuestReviewId] = useState<string | null>(null);
  const [signupEmail, setSignupEmail] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signupStep, setSignupStep] = useState<"options" | "password">("options");

  // Form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [experienceType, setExperienceType] = useState("");
  const [unitType, setUnitType] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [disclaimerAgreed, setDisclaimerAgreed] = useState(false);

  // Category sub-ratings (Phase 3)
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({});

  // AI state
  const [aiTitleSuggestions, setAiTitleSuggestions] = useState<{ title: string; starter: string }[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiEmojis, setAiEmojis] = useState<string[]>([]);
  const [aiKeywords, setAiKeywords] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Attachments state
  const [attachments, setAttachments] = useState<{ file: File; preview?: string; type: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Verification state
  const [verificationFiles, setVerificationFiles] = useState<File[]>([]);
  const verificationInputRef = useRef<HTMLInputElement>(null);

  // Receipt camera state
  const receiptCameraRef = useRef<HTMLInputElement>(null);
  const [isReceiptUploading, setIsReceiptUploading] = useState(false);

  // Content guard state
  const [localWarning, setLocalWarning] = useState<string | null>(null);
  const [aiModeration, setAiModeration] = useState<AIModerationResult | null>(null);
  const [isCheckingContent, setIsCheckingContent] = useState(false);

  const metricsCategory = ['developers', 'projects', 'locations', 'apps', 'units', 'brokers'].includes(entityCategory) 
    ? entityCategory 
    : 'developers';

  const categoryMetricKeys = getCategoryMetricKeys(metricsCategory);

  const resetForm = () => {
    setRating(0);
    setTitle("");
    setContent("");
    setExperienceType("");
    setUnitType("");
    setIsAnonymous(false);
    setAiSuggestions([]);
    setAiEmojis([]);
    setAiKeywords([]);
    setAiTitleSuggestions([]);
    setAttachments([]);
    setVerificationFiles([]);
    setGuestName("");
    setShowAccountPrompt(false);
    setGuestReviewId(null);
    setSignupEmail("");
    setSignupName("");
    setSignupPassword("");
    setPhase(1);
    setCategoryRatings({});
    setDisclaimerAgreed(false);
  };

  // AI Title Suggestions for Phase 2
  const getAiTitleSuggestions = useCallback(async () => {
    setIsAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("review-ai-assist", {
        body: {
          action: "suggest",
          text: content || "",
          developerName,
          rating,
          experienceType: unitType || experienceType || entityCategory,
        },
      });
      if (error) throw error;
      
      // Map AI suggestions to title+starter format
      if (data.suggestions) {
        const titles = data.suggestions.slice(0, 3).map((s: string) => ({
          title: s.length > 60 ? s.substring(0, 57) + "..." : s,
          starter: s,
        }));
        setAiTitleSuggestions(titles);
      }
      if (data.emojis) setAiEmojis(data.emojis);
      if (data.keywords) setAiKeywords(data.keywords);
    } catch (e) {
      toast({ title: t("form.ai_unavailable"), description: t("form.ai_unavailable_desc"), variant: "destructive" });
    } finally {
      setIsAiLoading(false);
    }
  }, [content, developerName, rating, experienceType, unitType, entityCategory, toast, t]);

  // AI Enhance
  const enhanceWithAi = useCallback(async (isVoice = false) => {
    if (!content.trim()) return;
    setIsEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke("review-ai-assist", {
        body: {
          action: isVoice ? "enhance_voice" : "enhance",
          text: content,
          developerName,
        },
      });
      if (error) throw error;
      if (data.enhanced) {
        setContent(data.enhanced);
        toast({ title: t("form.review_enhanced"), description: data.changes || t("form.review_enhanced_desc") });
      }
    } catch (e) {
      toast({ title: t("form.enhance_failed"), description: t("form.enhance_failed_desc"), variant: "destructive" });
    } finally {
      setIsEnhancing(false);
    }
  }, [content, developerName, toast, t]);

  // Voice Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
          toast({ title: t("form.voice_processing"), description: t("form.voice_converting") });
        }
        try {
          const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          if (SpeechRecognitionAPI) {
            if (content.trim()) await enhanceWithAi(true);
          }
        } catch {
          toast({ title: t("form.voice_processing"), description: t("form.voice_done"), variant: "default" });
        }
      };

      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        recognition.onresult = (event: any) => {
          let transcript = "";
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setContent((prev) => {
            const base = prev.replace(/\[recording\.\.\.\]$/, "").trim();
            return base ? `${base} ${transcript}` : transcript;
          });
        };
        recognition.onerror = () => {};
        recognition.start();
        recorder.addEventListener("stop", () => recognition.stop(), { once: true });
      }

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast({ title: t("form.recording"), description: t("form.recording_desc") });
    } catch {
      toast({ title: t("form.mic_error"), description: t("form.mic_error_desc"), variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
    setIsRecording(false);
  };

  // File Attachments
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newAttachments = files.map((file) => ({
      file,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      type: file.type.startsWith("image/") ? "image" : "document",
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);
    e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => {
      const removed = prev[index];
      if (removed.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleVerificationSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setVerificationFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeVerification = (index: number) => {
    setVerificationFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReceiptCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!user) {
      toast({ title: t("form.sign_in_required"), description: t("form.sign_in_receipt"), variant: "destructive" });
      return;
    }
    setIsReceiptUploading(true);
    try {
      const filePath = `receipts/${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("review-attachments").upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("review-attachments").getPublicUrl(filePath);
      const { error: dbError } = await supabase.from("receipt_submissions").insert({
        user_id: user.id,
        developer_id: developerId || null,
        developer_name: developerName || null,
        image_url: urlData.publicUrl,
        status: "pending",
      });
      if (dbError) throw dbError;
      const preview = URL.createObjectURL(file);
      setAttachments((prev) => [...prev, { file, preview, type: "receipt" }]);
      toast({ title: t("form.receipt_captured"), description: t("form.receipt_captured_desc") });
    } catch (err) {
      console.error("Receipt upload error:", err);
      toast({ title: t("form.upload_failed"), description: t("form.upload_failed_desc"), variant: "destructive" });
    } finally {
      setIsReceiptUploading(false);
      e.target.value = "";
    }
  };

  // Submit — guest or authenticated
  const handleSubmit = async () => {
    if (rating === 0) {
      toast({ title: t("form.rating_required"), description: t("form.rating_required_desc"), variant: "destructive" });
      return;
    }
    if (!content.trim()) {
      toast({ title: t("form.review_required"), description: t("form.review_required_desc"), variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      // Build category_ratings JSON
      const catRatingsPayload = Object.keys(categoryRatings).length > 0 ? categoryRatings : {};

      if (isGuest) {
        const { data, error } = await supabase
          .from("guest_reviews" as any)
          .insert({
            guest_name: guestName.trim() || "Guest",
            developer_id: developerId,
            developer_name: developerName,
            rating,
            title: title || null,
            comment: content,
            experience_type: experienceType || null,
            category_ratings: catRatingsPayload,
          })
          .select("id")
          .single();

        if (error) throw error;
        setGuestReviewId((data as any).id);
        setShowAccountPrompt(true);
        toast({ title: t("form.review_submitted"), description: t("form.review_submitted_guest", { name: developerName }) });
      } else {
        const uploadedUrls: string[] = [];
        for (const att of [...attachments, ...verificationFiles.map((f) => ({ file: f, type: "verification" }))]) {
          const filePath = `${user.id}/${Date.now()}-${att.file.name}`;
          const { error } = await supabase.storage.from("review-attachments").upload(filePath, att.file);
          if (!error) {
            const { data: urlData } = supabase.storage.from("review-attachments").getPublicUrl(filePath);
            uploadedUrls.push(urlData.publicUrl);
          }
        }

        let displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email || "Anonymous";
        if (!isAnonymous) {
          const { data: profile } = await supabase.from("profiles").select("full_name").eq("user_id", user.id).single();
          if (profile?.full_name) displayName = profile.full_name;
        }
        const authorName = isAnonymous ? "Anonymous" : displayName;
        const { error: insertError } = await supabase.from("reviews").insert({
          user_id: user.id,
          developer_id: developerId,
          developer_name: developerName,
          author_name: authorName,
          rating,
          title,
          comment: content,
          experience_type: experienceType || null,
          unit_type: unitType || null,
          is_anonymous: isAnonymous,
          attachment_urls: uploadedUrls,
          category_ratings: catRatingsPayload,
        });

        if (insertError) throw insertError;

        const { count: totalReviews } = await supabase
          .from("reviews")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);

        const isFirstReview = totalReviews === 1;
        const submittedRating = rating;

        resetForm();
        onOpenChange(false);

        setSuccessRating(submittedRating);
        setSuccessIsFirst(isFirstReview);
        setShowSuccessOverlay(true);

        onReviewSubmitted?.();
      }
    } catch (e) {
      console.error("Review submission error:", e);
      toast({ title: t("form.submission_error"), description: t("form.submission_error_desc"), variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleGuestSignup = async () => {
    if (!signupEmail || !signupPassword) {
      toast({ title: t("form.fields_required"), description: t("form.fields_required_desc"), variant: "destructive" });
      return;
    }
    if (signupPassword.length < 6) {
      toast({ title: t("form.password_short"), description: t("form.password_short_desc"), variant: "destructive" });
      return;
    }
    setIsSigningUp(true);
    try {
      const { error } = await signUp(signupEmail, signupPassword, signupName || guestName || undefined);
      if (error) {
        if (error.message.includes("already registered")) {
          toast({ title: t("form.account_exists"), description: t("form.account_exists_desc"), variant: "destructive" });
        } else {
          toast({ title: t("form.signup_failed"), description: error.message, variant: "destructive" });
        }
        return;
      }
      if (guestReviewId) {
        localStorage.setItem("r8_pending_claim_review", guestReviewId);
      }
      toast({ title: t("form.account_created"), description: t("form.account_created_desc"), duration: 6000 });
      resetForm();
      onReviewSubmitted?.();
      onOpenChange(false);
    } catch (e) {
      toast({ title: t("common.error"), description: t("form.account_error"), variant: "destructive" });
    } finally {
      setIsSigningUp(false);
    }
  };

  const insertText = (text: string) => {
    setContent((prev) => (prev ? `${prev} ${text}` : text));
  };

  // Rating label helper
  const getRatingWord = (r: number) => {
    if (r >= 5) return "Excellent! 🌟";
    if (r >= 4) return "Great! 😊";
    if (r >= 3) return "Good 👍";
    if (r >= 2) return "Fair 😐";
    if (r >= 1) return "Poor 😞";
    return "";
  };

  if (!open && !showSuccessOverlay) return null;

  // Success celebration overlay
  if (showSuccessOverlay) {
    return (
      <ReviewSuccessOverlay
        open={showSuccessOverlay}
        onClose={() => setShowSuccessOverlay(false)}
        isFirstReview={successIsFirst}
        developerName={developerName}
        rating={successRating}
      />
    );
  }

  // Post-submit account prompt for guests
  if (showAccountPrompt && isGuest) {
    const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
    const showPasswordStep = signupStep === "password";

    const handleSocialSignup = async (provider: "google" | "apple") => {
      if (guestReviewId) localStorage.setItem("r8_pending_claim_review", guestReviewId);
      const { signInWithOAuth } = (await import("@/integrations/lovable")).lovable.auth;
      await signInWithOAuth(provider, { redirect_uri: window.location.origin });
    };

    const handleEmailContinue = () => {
      if (isValidEmail(signupEmail)) setSignupStep("password");
    };

    return (
      <Dialog open={open} onOpenChange={(v) => { if (!v) { resetForm(); } onOpenChange(v); }}>
        <DialogContent className="max-w-sm p-0 gap-0 rounded-2xl overflow-hidden">
          <button
            onClick={() => { resetForm(); onReviewSubmitted?.(); onOpenChange(false); }}
            className="absolute end-3 top-3 text-muted-foreground hover:text-foreground z-10"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center px-6 pt-7 pb-2 gap-1">
            <BrandLogo size="sm" tagline="" />
            <h2 className="text-lg font-bold text-foreground mt-3">
              {t("auth.createAccount", "Create an account")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("auth.alreadyHaveAccount", "Already have an account?")}{" "}
              <button onClick={() => navigate("/auth")} className="text-primary font-semibold hover:underline">
                {t("auth.logIn", "Log In")}
              </button>
            </p>
          </div>

          <div className="px-6 pb-6 pt-3 space-y-3">
            <Button variant="outline" className="w-full gap-3 h-10 text-sm font-medium" onClick={() => handleSocialSignup("google")}>
              <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {t("auth.continueWithGoogle", "Continue with Google")}
            </Button>
            <Button variant="outline" className="w-full gap-3 h-10 text-sm font-medium" onClick={() => handleSocialSignup("apple")}>
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-foreground" aria-hidden>
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              {t("auth.continueWithApple", "Continue with Apple")}
            </Button>

            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">{t("auth.orContinueWith", "or continue with")}</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {!showPasswordStep ? (
              <>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder={t("auth.email", "Email")}
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleEmailContinue()}
                    className="ps-10"
                    autoFocus
                  />
                </div>
                <Button className="w-full" disabled={!isValidEmail(signupEmail)} onClick={handleEmailContinue}>
                  {t("auth.continue", "Continue")}
                </Button>
              </>
            ) : (
              <>
                <button className="text-xs text-primary hover:underline text-start" onClick={() => setSignupStep("options")}>
                  ← {signupEmail}
                </button>
                <div className="relative">
                  <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t("auth.fullName", "Full Name")}
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="ps-10"
                    autoFocus
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder={t("auth.password", "Password (6+ characters)")}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGuestSignup()}
                    className="ps-10"
                  />
                </div>
                <Button className="w-full gap-2" onClick={handleGuestSignup} disabled={isSigningUp || signupPassword.length < 6}>
                  {isSigningUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  {isSigningUp ? t("guestReview.creatingAccount", "Creating account...") : t("auth.createAccount", "Create Account")}
                </Button>
              </>
            )}

            <p className="text-xs text-center text-muted-foreground pt-1">
              {t("auth.areYouBusiness", "Are you a business?")}{" "}
              <button onClick={() => navigate("/auth?tab=business")} className="text-primary font-semibold hover:underline">
                {t("auth.registerBusiness", "Register your business →")}
              </button>
            </p>
            <TrustSignals compact className="justify-center pt-1" />
            <button
              className="w-full text-xs text-muted-foreground hover:text-foreground text-center pt-1"
              onClick={() => { resetForm(); onReviewSubmitted?.(); onOpenChange(false); }}
            >
              {t("guestReview.skipForNow", "Skip for now")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ===================== PHASE RENDERERS =====================

  const renderPhase1 = () => (
    <div className="flex flex-col items-center py-6 px-4 space-y-6">
      {/* Guest name for guests */}
      {isGuest && (
        <div className="w-full max-w-xs">
          <label className="text-sm font-medium text-foreground mb-1.5 block">{t("guestReview.yourName", "Your Name")}</label>
          <Input
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder={t("guestReview.namePlaceholder", "Enter your name (optional)")}
          />
        </div>
      )}

      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          {t("form.howWouldYouRate", "How would you rate")}
        </h3>
        <p className="text-sm text-muted-foreground font-medium">{developerName}</p>
      </div>

      {/* Large stars */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="p-1 transition-transform hover:scale-110 active:scale-95"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
          >
            <Star
              className={cn(
                "w-12 h-12 md:w-14 md:h-14 transition-colors",
                (hoverRating || rating) >= star
                  ? "fill-accent text-accent"
                  : "text-muted-foreground/30"
              )}
            />
          </button>
        ))}
      </div>

      {rating > 0 && (
        <div className="text-center space-y-3">
          <p className="text-lg font-semibold text-foreground">{getRatingWord(rating)}</p>
          <Button onClick={() => setPhase(2)} className="gap-2 min-w-[160px]">
            {t("form.continue", "Continue")}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );

  const renderPhase2 = () => (
    <div className="p-4 md:p-6 pt-2 space-y-4">
      {/* Unit Type + Experience Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">{t("form.unit_type")}</label>
          <Input
            value={unitType}
            onChange={(e) => setUnitType(e.target.value)}
            placeholder={t("form.unit_type_placeholder")}
          />
        </div>
        {!isGuest && (
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">{t("form.experience_type")}</label>
            <Select value={experienceType} onValueChange={setExperienceType}>
              <SelectTrigger><SelectValue placeholder={t("form.select_type")} /></SelectTrigger>
              <SelectContent>
                {EXPERIENCE_TYPES_KEYS.map((key) => (
                  <SelectItem key={key} value={key}>{t(key)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Review Title with AI suggestions */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-foreground">{t("form.review_title")}</label>
          {!isGuest && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={getAiTitleSuggestions}
              disabled={isAiLoading}
            >
              {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
              AI Suggest
            </Button>
          )}
        </div>

        {/* AI title chips */}
        {aiTitleSuggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {aiTitleSuggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                className="text-xs px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                onClick={() => {
                  setTitle(s.title);
                  if (!content.trim()) setContent(s.starter);
                }}
              >
                ✨ {s.title}
              </button>
            ))}
          </div>
        )}

        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("form.review_title_placeholder")}
          maxLength={100}
        />
      </div>

      {/* Review Content */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-foreground">{t("form.your_review")} *</label>
          {!isGuest && (
            <div className="flex items-center gap-1">
              <Button type="button" variant={isRecording ? "destructive" : "outline"} size="sm" className="h-7 gap-1 text-xs" onClick={isRecording ? stopRecording : startRecording}>
                {isRecording ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                {isRecording ? t("form.stop") : t("form.voice")}
              </Button>
              <Button type="button" variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={() => enhanceWithAi(false)} disabled={isEnhancing || !content.trim()}>
                {isEnhancing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-accent" />}
                {t("form.enhance")}
              </Button>
            </div>
          )}
        </div>

        <Textarea
          value={content}
          onChange={(e) => {
            const val = e.target.value;
            setContent(val);
            const localCheck = checkContentLocally(val);
            setLocalWarning(localCheck.blocked ? t("contentGuard.typingWarning") : null);
            if (aiModeration) setAiModeration(null);
          }}
          placeholder={t("form.review_placeholder")}
          rows={4}
          className="resize-none"
        />

        {/* Quick Emoji Bar */}
        <div className="flex flex-wrap items-center gap-1 mt-2">
          {(aiEmojis.length > 0 ? aiEmojis : EMOJI_QUICK).map((emoji, i) => (
            <button key={i} type="button" className="text-lg hover:scale-125 transition-transform p-0.5" onClick={() => insertText(emoji)}>
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Content warnings */}
      {localWarning && (
        <div className="flex items-start gap-2 rounded-lg p-3 bg-destructive/10 border border-destructive/20">
          <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-xs text-destructive font-medium">{localWarning}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" size="sm" onClick={() => setPhase(1)} className="gap-1">
          <ChevronLeft className="w-4 h-4" /> {t("form.back", "Back")}
        </Button>
        <Button
          onClick={() => setPhase(3)}
          disabled={!content.trim()}
          className="gap-2"
        >
          {t("form.nextAddDetails", "Next: Add Details")}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const renderPhase3 = () => (
    <div className="p-4 md:p-6 pt-2 space-y-5">
      {/* Category Sliders */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-1">
          {t("form.categoryRatings", "Rate specific categories")}
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          {t("form.categoryRatingsDesc", "Optional — helps others understand your experience better")}
        </p>

        <div className="space-y-4">
          {categoryMetricKeys.map((key) => (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  {t(`categoryMetrics.${metricsCategory}.${key}`, key)}
                </label>
                <span className="text-sm font-semibold text-primary min-w-[2ch] text-end">
                  {categoryRatings[key] || 0}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-4">1</span>
                <Slider
                  value={[categoryRatings[key] || 0]}
                  onValueChange={([val]) => setCategoryRatings((prev) => ({ ...prev, [key]: val }))}
                  min={0}
                  max={5}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-4">5</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attachments — authenticated only */}
      {!isGuest && (
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block flex items-center gap-1.5">
            <Paperclip className="w-4 h-4" /> {t("form.attachments")}
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            <Button type="button" variant="outline" size="sm" className="h-9 gap-1.5 text-xs" onClick={() => fileInputRef.current?.click()}>
              <ImageIcon className="w-3.5 h-3.5" /> {t("form.photos")}
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-9 gap-1.5 text-xs" onClick={() => {
              if (fileInputRef.current) { fileInputRef.current.accept = ".pdf,.doc,.docx"; fileInputRef.current.click(); fileInputRef.current.accept = "image/*,.pdf,.doc,.docx"; }
            }}>
              <FileText className="w-3.5 h-3.5" /> {t("form.documents")}
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-9 gap-1.5 text-xs" disabled={isReceiptUploading} onClick={() => receiptCameraRef.current?.click()}>
              {isReceiptUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              {isReceiptUploading ? t("form.uploading") : t("form.scan_receipt")}
            </Button>
          </div>
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx" multiple onChange={handleFileSelect} />
          <input ref={receiptCameraRef} type="file" className="hidden" accept="image/*" capture="environment" onChange={handleReceiptCapture} />
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {attachments.map((att, i) => (
                <div key={i} className="relative group">
                  {att.preview ? (
                    <img src={att.preview} alt="" className="w-16 h-16 rounded-lg object-cover border border-border" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg border border-border flex items-center justify-center bg-secondary">
                      <FileText className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <button type="button" className="absolute -top-1.5 -end-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeAttachment(i)}>
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Verification — authenticated only */}
      {!isGuest && (
        <div className="bg-secondary/30 rounded-lg p-3 border border-border/50">
          <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-accent" /> {t("form.purchase_verification")}
            <Badge variant="secondary" className="text-[10px] ms-1">{t("form.optional")}</Badge>
          </label>
          <p className="text-xs text-muted-foreground mb-2">{t("form.verification_desc")}</p>
          <Button type="button" variant="outline" size="sm" className="h-9 gap-1.5 text-xs" onClick={() => verificationInputRef.current?.click()}>
            <Receipt className="w-3.5 h-3.5" /> {t("form.upload_verification")}
          </Button>
          <input ref={verificationInputRef} type="file" className="hidden" accept="image/*,.pdf" multiple onChange={handleVerificationSelect} />
          {verificationFiles.length > 0 && (
            <div className="mt-2 space-y-1">
              {verificationFiles.map((file, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-foreground bg-background rounded-md px-2 py-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-trust-excellent" />
                  <span className="truncate flex-1">{file.name}</span>
                  <button type="button" onClick={() => removeVerification(i)} className="text-muted-foreground hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Anonymous Toggle */}
      {!isGuest && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="rounded border-border" />
          <span className="text-sm text-foreground">{t("form.post_anonymously")}</span>
        </label>
      )}

      {/* Trust signals for guests */}
      {isGuest && <TrustSignals compact />}

      {/* Disclaimer */}
      <DisclaimerCheckbox checked={disclaimerAgreed} onCheckedChange={setDisclaimerAgreed} />

      {/* AI Moderation warnings */}
      {aiModeration && aiModeration.suspicion_score > 50 && (
        <div className={cn(
          "flex items-start gap-2 rounded-lg p-3 text-sm",
          aiModeration.suspicion_score > 80
            ? "bg-destructive/10 border border-destructive/20 text-destructive"
            : "bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400"
        )}>
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-xs">{aiModeration.suspicion_score > 80 ? t("contentGuard.blocked") : t("contentGuard.warning")}</p>
            <p className="text-xs mt-0.5">{aiModeration.suggestion}</p>
          </div>
        </div>
      )}

      {/* Navigation + Submit */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" size="sm" onClick={() => setPhase(2)} className="gap-1">
          <ChevronLeft className="w-4 h-4" /> {t("form.back", "Back")}
        </Button>
        <Button
          onClick={async () => {
            const localCheck = checkContentLocally(content);
            if (localCheck.blocked) {
              setLocalWarning(t("contentGuard.profanity"));
              setPhase(2);
              return;
            }
            setIsCheckingContent(true);
            const result = await checkContentWithAI(content, "review", rating, (name, opts) => supabase.functions.invoke(name, opts));
            setIsCheckingContent(false);
            if (result) {
              setAiModeration(result);
              if (result.suspicion_score > 80) return;
            }
            handleSubmit();
          }}
          disabled={isUploading || isCheckingContent || rating === 0 || !content.trim() || !disclaimerAgreed || (aiModeration?.suspicion_score ?? 0) > 80}
          className="gap-1.5 min-h-[44px]"
        >
          {isCheckingContent ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> {t("contentGuard.checking")}</>
          ) : isUploading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> {t("form.submitting")}</>
          ) : (
            t("form.submit_review")
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <ConfettiCelebration trigger={firstReviewCelebration} duration={3500} particleCount={80} />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          {/* Progress Header */}
          <div className="px-4 md:px-6 pt-4 md:pt-6 pb-0 space-y-3">
            <DialogHeader>
              <DialogTitle className="text-lg md:text-xl font-bold text-foreground">
                {t("nav_write_review")} {developerName && t("form.for_developer", { name: developerName })}
              </DialogTitle>
              {isGuest && phase === 1 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {t("guestReview.noAccountNeeded", "No account needed — share your experience freely")}
                </p>
              )}
            </DialogHeader>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {t("form.step", "Step")} {phase} {t("form.of", "of")} 3
                </span>
                <span className="font-medium text-foreground">{PHASE_LABELS[phase - 1]}</span>
              </div>
              <Progress value={(phase / 3) * 100} className="h-2" />
            </div>

            {/* Star summary when past phase 1 */}
            {phase > 1 && (
              <div className="flex items-center gap-2 pb-1">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={cn("w-4 h-4", s <= rating ? "fill-accent text-accent" : "text-muted-foreground/30")} />
                  ))}
                </div>
                <span className="text-sm font-medium text-foreground">{rating}/5</span>
                <button type="button" onClick={() => setPhase(1)} className="text-xs text-primary hover:underline ms-auto">
                  {t("form.changeRating", "Change")}
                </button>
              </div>
            )}
          </div>

          {/* Phase Content with CSS transitions */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${(phase - 1) * 100}%)` }}
            >
              <div className="w-full flex-shrink-0">{renderPhase1()}</div>
              <div className="w-full flex-shrink-0">{renderPhase2()}</div>
              <div className="w-full flex-shrink-0">{renderPhase3()}</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
