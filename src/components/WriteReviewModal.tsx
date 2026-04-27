import { useState, useRef, useCallback, useEffect } from "react";
import { DisclaimerCheckbox } from "@/components/DisclaimerCheckbox";
import { trackReviewFunnelEvent } from "@/lib/reviewFunnelAnalytics";
import { useTranslation } from "react-i18next";
import { checkContentLocally, checkContentWithAI, type AIModerationResult } from "@/lib/contentGuard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ReviewRichEditor, getPlainTextFromHtml } from "@/components/ReviewRichEditor";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  ChevronDown,
  Wand2,
  Check,
  PenLine,
  SmilePlus,
  Eye,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { ConfettiCelebration } from "@/components/ConfettiCelebration";
import { Trophy } from "lucide-react";
import { TrustSignals } from "@/components/TrustSignals";
import { ReviewSuccessOverlay } from "@/components/ReviewSuccessOverlay";
import { BrandLogo } from "@/components/BrandLogo";
import { useIsMobile } from "@/hooks/use-mobile";
import type { SearchCategory } from "@/data/searchIndex";
import { SecureContractUpload } from "@/components/SecureContractUpload";

interface WriteReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  developerName?: string;
  developerId?: string;
  onReviewSubmitted?: () => void;
  entityCategory?: string;
}

// ===================== CONTEXT-AWARE CONFIG =====================

interface ContextFieldConfig {
  label: string;
  placeholder: string;
  chips?: string[];
}

const getContextFieldConfig = (entityCategory: string, t: any): ContextFieldConfig => {
  switch (entityCategory) {
    case "developers":
      return { label: t("form.unit_type", "Unit Type"), placeholder: t("form.unit_type_placeholder", "e.g. Apartment, Villa") };
    case "projects":
      return { label: t("form.unit_type", "Unit Type"), placeholder: "e.g. Studio, Duplex" };
    case "brokers":
      return { label: t("form.serviceUsed", "Service Used"), placeholder: "e.g. Buy, Rent", chips: ["Buying", "Selling", "Renting", "Consulting"] };
    case "apps":
      return { label: t("form.featureUsed", "Feature Used"), placeholder: "e.g. Search, Listings", chips: ["Search", "Listings", "Maps", "Alerts"] };
    case "locations":
      return { label: t("form.propertyType", "Property Type"), placeholder: "e.g. Residential", chips: ["Residential", "Commercial", "Mixed-Use", "Land"] };
    default:
      return { label: t("form.serviceType", "Service Type"), placeholder: "e.g. Contract Review, Consultation" };
  }
};

const getExperienceChips = (entityCategory: string, t: any): { key: string; label: string; icon: string }[] => {
  switch (entityCategory) {
    case "developers":
    case "projects":
    case "units":
    case "locations":
      return [
        { key: "form.exp_buyer", label: t("form.exp_buyer", "Buyer"), icon: "🏠" },
        { key: "form.exp_agent", label: t("form.exp_agent", "Agent"), icon: "🏢" },
        { key: "form.exp_investor", label: t("form.exp_investor", "Investor"), icon: "💰" },
        { key: "form.exp_construction", label: t("form.exp_construction", "Construction"), icon: "🔨" },
        { key: "form.exp_family", label: t("form.exp_family", "Family"), icon: "👨‍👩‍👧" },
      ];
    case "brokers":
      return [
        { key: "form.exp_buying", label: t("form.exp_buying", "Buying"), icon: "🏠" },
        { key: "form.exp_selling", label: t("form.exp_selling", "Selling"), icon: "💵" },
        { key: "form.exp_renting", label: t("form.exp_renting", "Renting"), icon: "🔑" },
        { key: "form.exp_consulting", label: t("form.exp_consulting", "Consulting"), icon: "📋" },
      ];
    default:
      return [
        { key: "form.exp_client", label: t("form.exp_client", "Client"), icon: "👤" },
        { key: "form.exp_partner", label: t("form.exp_partner", "Partner"), icon: "🤝" },
        { key: "form.exp_vendor", label: t("form.exp_vendor", "Vendor"), icon: "📦" },
      ];
  }
};

const EMOJI_QUICK = ["👍", "👎", "⭐", "🏠", "💰", "🔑", "📋", "✅", "❌", "🏗️", "😊", "😤"];

// ===================== WORD-CLOUD CHIPS (per rating) =====================
// White-Arabic + warm-EN labels. Sentiment drives chip color.
type ChipSentiment = "pos" | "neg" | "neu";
interface ChipDef { ar: string; en: string; sentiment: ChipSentiment }

const CHIPS_BY_RATING: Record<number, ChipDef[]> = {
  5: [
    { ar: "تسليم في الموعد", en: "Delivered on time", sentiment: "pos" },
    { ar: "جودة عالية", en: "High quality", sentiment: "pos" },
    { ar: "موقع ممتاز", en: "Great location", sentiment: "pos" },
    { ar: "خدمة ممتازة", en: "Excellent service", sentiment: "pos" },
    { ar: "أمان وهدوء", en: "Safe & quiet", sentiment: "pos" },
    { ar: "سعر مناسب", en: "Fair price", sentiment: "neu" },
    { ar: "استثمار ناجح", en: "Solid investment", sentiment: "neu" },
  ],
  4: [
    { ar: "جودة جيدة", en: "Good quality", sentiment: "pos" },
    { ar: "موقع ممتاز", en: "Great location", sentiment: "pos" },
    { ar: "تأخير بسيط", en: "Minor delay", sentiment: "neg" },
    { ar: "خدمة عملاء جيدة", en: "Helpful support", sentiment: "neu" },
    { ar: "سعر مناسب", en: "Fair price", sentiment: "neu" },
    { ar: "ملاحظات على التشطيب", en: "Finishing issues", sentiment: "neg" },
  ],
  3: [
    { ar: "تجربة متوسطة", en: "Average experience", sentiment: "neu" },
    { ar: "تأخير في التسليم", en: "Delivery delay", sentiment: "neg" },
    { ar: "ملاحظات على التشطيب", en: "Finishing issues", sentiment: "neg" },
    { ar: "ضعف في خدمة العملاء", en: "Weak customer service", sentiment: "neg" },
    { ar: "موقع جيد", en: "Good location", sentiment: "pos" },
    { ar: "سعر مناسب", en: "Fair price", sentiment: "neu" },
  ],
  2: [
    { ar: "تأخير في التسليم", en: "Late delivery", sentiment: "neg" },
    { ar: "جودة منخفضة", en: "Low quality", sentiment: "neg" },
    { ar: "مشاكل متعددة", en: "Multiple issues", sentiment: "neg" },
    { ar: "خدمة سيئة", en: "Poor service", sentiment: "neg" },
    { ar: "وعود لم تتحقق", en: "Unmet promises", sentiment: "neg" },
    { ar: "سعر مرتفع", en: "Overpriced", sentiment: "neg" },
  ],
  1: [
    { ar: "تجربة سيئة جداً", en: "Very poor experience", sentiment: "neg" },
    { ar: "تأخير كبير", en: "Major delay", sentiment: "neg" },
    { ar: "جودة سيئة", en: "Bad quality", sentiment: "neg" },
    { ar: "لا أوصي به", en: "Wouldn't recommend", sentiment: "neg" },
    { ar: "وعود مضللة", en: "Misleading promises", sentiment: "neg" },
  ],
};

const CHIP_STYLES: Record<ChipSentiment, { bg: string; text: string; border: string }> = {
  pos: { bg: "#e4f5ec", text: "#1a6635", border: "#b8e2c8" },
  neg: { bg: "#fde8ec", text: "#a0102a", border: "#f5c5cd" },
  neu: { bg: "#e0eaf5", text: "#0a3d62", border: "#b8d0e8" },
};

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

const PHASE_LABELS = ["Rate", "Your Review", "Category Ratings", "Proof & Polish"];
const TOTAL_STEPS = 4;

// ===================== MOTIVATOR CHIP =====================
const MotivatorChip = ({ icon, text }: { icon: string; text: string }) => (
  <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-primary/80 bg-primary/5 border border-primary/15 rounded-full px-3 py-1.5 mx-auto w-fit max-w-full">
    <span>{icon}</span>
    <span className="truncate">{text}</span>
  </div>
);

// ===================== STAR ROW COMPONENT (for Phase 3) =====================

const MiniStarRow = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-sm font-medium text-foreground flex-1 min-w-0 truncate">{label}</span>
    <div className="flex items-center gap-0.5 shrink-0">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          className="p-0.5 active:scale-90 transition-transform"
          onClick={() => onChange(s === value ? 0 : s)}
        >
          <Star className={cn("w-5 h-5 md:w-6 md:h-6", s <= value ? "fill-accent text-accent" : "text-muted-foreground/25")} />
        </button>
      ))}
    </div>
  </div>
);

// ===================== TAPPABLE CHIP COMPONENT =====================

const ChipSelect = ({ options, value, onChange }: { options: { key: string; label: string; icon?: string }[]; value: string; onChange: (v: string) => void }) => (
  <div className="flex flex-wrap gap-1.5">
    {options.map((opt) => (
      <button
        key={opt.key}
        type="button"
        className={cn(
          "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
          value === opt.key
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-secondary/50 text-foreground border-border hover:bg-secondary"
        )}
        onClick={() => onChange(value === opt.key ? "" : opt.key)}
      >
        {opt.icon && <span className="me-1">{opt.icon}</span>}
        {opt.label}
      </button>
    ))}
  </div>
);

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
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [firstReviewCelebration, setFirstReviewCelebration] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [successIsFirst, setSuccessIsFirst] = useState(false);
  const [successRating, setSuccessRating] = useState(5);
  const [successTotalReviews, setSuccessTotalReviews] = useState(1);

  // Track review click for corridor progress
  useEffect(() => {
    if (open) {
      window.dispatchEvent(new CustomEvent("corridor:engage", { detail: { zone: 4, action: "review_click" } }));
    }
  }, [open]);

  // ===== Look for an in-progress draft when the modal opens =====
  useEffect(() => {
    if (!open || !user || !developerId) return;
    let cancelled = false;
    (async () => {
      setIsCheckingDraft(true);
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("id, rating, title, comment, experience_type, unit_type, is_anonymous, category_ratings, completion_level, created_at, developer_name")
          .eq("user_id", user.id)
          .eq("developer_id", developerId)
          .neq("completion_level", "full")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (cancelled) return;
        if (!error && data) {
          setDraft(data);
          setShowResumePrompt(true);
        } else {
          setDraft(null);
          setShowResumePrompt(false);
        }
      } catch (e) {
        console.warn("draft lookup failed", e);
      } finally {
        if (!cancelled) setIsCheckingDraft(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open, user, developerId]);

  const restoreDraft = () => {
    if (!draft) return;
    setSavedReviewId(draft.id);
    setRating(draft.rating || 0);
    setTitle(draft.title || "");
    setContent(draft.comment || "");
    setExperienceType(draft.experience_type || "");
    setUnitType(draft.unit_type || "");
    setIsAnonymous(!!draft.is_anonymous);
    setCategoryRatings(draft.category_ratings || {});
    // Resume on the next step the user hadn't completed.
    if (draft.completion_level === "with_comment") {
      setPhase(3);
    } else if (draft.completion_level === "rating_only") {
      setPhase(2);
    } else {
      setPhase(2);
    }
    setShowResumePrompt(false);
  };

  const discardDraft = async () => {
    if (!draft) {
      setShowResumePrompt(false);
      return;
    }
    try {
      await supabase.from("reviews").delete().eq("id", draft.id);
    } catch (e) {
      console.warn("draft discard failed", e);
    }
    setDraft(null);
    setSavedReviewId(null);
    setShowResumePrompt(false);
    toast({ title: t("form.draft_discarded", "Started fresh"), description: t("form.draft_discarded_desc", "Your previous draft was removed.") });
  };

  // 3-phase state + thanks interstitial
  const [phase, setPhase] = useState(1);
  const [showThanksScreen, setShowThanksScreen] = useState(false);

  // Progressive save: track the saved review ID
  const [savedReviewId, setSavedReviewId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // ===== Continue-your-review (draft resume) =====
  const [draft, setDraft] = useState<any | null>(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [isCheckingDraft, setIsCheckingDraft] = useState(false);

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

  // Word-cloud chips (Step 1) — selected chip labels (already-localized strings)
  const [selectedChips, setSelectedChips] = useState<string[]>([]);

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

  // Emoji bar toggle (mobile)
  const [showEmojiBar, setShowEmojiBar] = useState(false);

  // More options toggle (Phase 3 mobile)
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(!isMobile);

  // Helper to check if rich text content has actual text
  const contentPlainText = getPlainTextFromHtml(content).trim();
  const hasContent = contentPlainText.length > 0;

  const metricsCategory = ['developers', 'projects', 'locations', 'apps', 'units', 'brokers'].includes(entityCategory) 
    ? entityCategory 
    : 'developers';

  const categoryMetricKeys = getCategoryMetricKeys(metricsCategory);
  const contextField = getContextFieldConfig(entityCategory, t);
  const experienceChips = getExperienceChips(entityCategory, t);

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
    setShowThanksScreen(false);
    setSavedReviewId(null);
    setIsSaving(false);
    setShowEmojiBar(false);
    setDraft(null);
    setShowResumePrompt(false);
    setSelectedChips([]);
  };

  // ===================== PROGRESSIVE SAVE LOGIC =====================

  const saveRatingOnly = async (starRating: number) => {
    setIsSaving(true);
    try {
      if (isGuest) {
        const { data, error } = await supabase
          .from("guest_reviews" as any)
          .insert({
            guest_name: guestName.trim() || "Guest",
            developer_id: developerId,
            developer_name: developerName,
            rating: starRating,
            comment: null,
            completion_level: "rating_only",
          })
          .select("id")
          .single();
        if (error) throw error;
        setSavedReviewId((data as any).id);
        setGuestReviewId((data as any).id);
      } else {
        let displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email || "Anonymous";
        const { data: profile } = await supabase.from("profiles").select("full_name").eq("user_id", user.id).single();
        if (profile?.full_name) displayName = profile.full_name;

        const { data, error } = await supabase
          .from("reviews")
          .insert({
            user_id: user.id,
            developer_id: developerId,
            developer_name: developerName,
            author_name: displayName,
            rating: starRating,
            comment: null,
            completion_level: "rating_only",
          })
          .select("id")
          .single();
        if (error) throw error;
        setSavedReviewId(data.id);
      }
    } catch (e) {
      console.error("Error saving rating:", e);
      toast({ title: t("form.submission_error"), description: t("form.submission_error_desc"), variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const savePhase2 = async () => {
    if (!savedReviewId || !hasContent) return;
    try {
      const table = isGuest ? "guest_reviews" : "reviews";
      const updateData: any = {
        comment: content,
        title: title || null,
        completion_level: "with_comment",
      };
      if (!isGuest) {
        updateData.experience_type = experienceType || null;
        updateData.unit_type = unitType || null;
        updateData.is_anonymous = isAnonymous;
        if (isAnonymous) updateData.author_name = "Anonymous";
      } else {
        updateData.experience_type = experienceType || null;
        updateData.guest_name = guestName.trim() || "Guest";
      }
      await supabase.from(table as any).update(updateData).eq("id", savedReviewId);
    } catch (e) {
      console.error("Error updating review (phase 2):", e);
    }
  };

  const savePhase3 = async () => {
    if (!savedReviewId) return;
    try {
      const table = isGuest ? "guest_reviews" : "reviews";
      const catRatingsPayload = Object.keys(categoryRatings).length > 0 ? categoryRatings : {};
      const updateData: any = {
        category_ratings: catRatingsPayload,
        completion_level: "full",
      };

      if (!isGuest && user) {
        const uploadedUrls: string[] = [];
        for (const att of [...attachments, ...verificationFiles.map((f) => ({ file: f, type: "verification" }))]) {
          const filePath = `${user.id}/${Date.now()}-${att.file.name}`;
          const { error } = await supabase.storage.from("review-attachments").upload(filePath, att.file);
          if (!error) {
            const { data: urlData } = supabase.storage.from("review-attachments").getPublicUrl(filePath);
            uploadedUrls.push(urlData.publicUrl);
          }
        }
        if (uploadedUrls.length > 0) {
          updateData.attachment_urls = uploadedUrls;
        }
      }

      await supabase.from(table as any).update(updateData).eq("id", savedReviewId);
    } catch (e) {
      console.error("Error updating review (phase 3):", e);
    }
  };

  const handleDone = async () => {
    if (phase === 2 && hasContent) {
      await savePhase2();
    } else if (phase === 3) {
      await savePhase3();
    } else if (phase === 4) {
      await savePhase3();
    }

    const submittedRating = rating;

    if (!isGuest && user) {
      const { count: totalReviews } = await supabase
        .from("reviews")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      const isFirstReview = totalReviews === 1;
      setSuccessRating(submittedRating);
      setSuccessIsFirst(isFirstReview);
      setSuccessTotalReviews(totalReviews || 1);
      setShowSuccessOverlay(true);
    } else if (isGuest) {
      setShowAccountPrompt(true);
    }

    onReviewSubmitted?.();
    if (!isGuest) {
      resetForm();
      onOpenChange(false);
    }
  };

  // ===================== SAVE-ON-EXIT GUARANTEE =====================
  // Persists whatever the user entered before closing — no data is ever lost.
  const safeClose = async () => {
    try {
      if (phase === 1 && savedReviewId && hasContent) {
        await savePhase2();
      } else if (phase === 2 && hasContent) {
        await savePhase2();
      } else if (phase === 3 && Object.keys(categoryRatings).length > 0) {
        await savePhase3();
      } else if (phase === 4) {
        await savePhase3();
      }
    } catch (e) {
      console.error("safeClose save error", e);
    } finally {
      onReviewSubmitted?.();
      resetForm();
      onOpenChange(false);
    }
  };

  // ===================== EXISTING HELPERS =====================

  const getAiTitleSuggestions = useCallback(async () => {
    setIsAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("review-ai-assist", {
        body: {
          action: "suggest",
          text: getPlainTextFromHtml(content) || "",
          developerName,
          rating,
          experienceType: unitType || experienceType || entityCategory,
        },
      });
      if (error) throw error;
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

  const enhanceWithAi = useCallback(async (isVoice = false) => {
    const plain = getPlainTextFromHtml(content).trim();
    if (!plain) return;
    setIsEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke("review-ai-assist", {
        body: {
          action: isVoice ? "enhance_voice" : "enhance",
          text: plain,
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
            if (getPlainTextFromHtml(content).trim()) await enhanceWithAi(true);
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
    setContent((prev) => {
      const plain = getPlainTextFromHtml(prev);
      return plain ? `${prev} ${text}` : text;
    });
  };

  const getRatingWord = (r: number) => {
    if (r >= 5) return t("form.ratingExcellent", "Excellent! 🌟");
    if (r >= 4) return t("form.ratingGreat", "Great! 😊");
    if (r >= 3) return t("form.ratingGood", "Good 👍");
    if (r >= 2) return t("form.ratingFair", "Fair 😐");
    if (r >= 1) return t("form.ratingPoor", "Poor 😞");
    return "";
  };

  const getRatingEncouragement = (r: number) => {
    if (r >= 5) return t("form.encourage.r5", "Tell others what made it special ✨");
    if (r >= 4) return t("form.encourage.r4", "Share what impressed you — it helps others choose wisely 💡");
    if (r >= 3) return t("form.encourage.r3", "Your balanced view helps the community decide fairly ⚖️");
    if (r >= 2) return t("form.encourage.r2", "Your honesty warns others — share what went wrong 🛡️");
    if (r >= 1) return t("form.encourage.r1", "We hear you. Share your story so others are protected 🛡️");
    return "";
  };

  // Build the rating-aware impact-banner message (logged-in users only).
  const getImpactBannerText = (r: number): string => {
    if (r >= 5) return t("form.impactBanner.r5", "Your rating is saved ✓ — over 1,247 buyers will see this developer this week");
    if (r >= 4) return t("form.impactBanner.r4", "Your view matters ✓ — you just helped 1,247 buyers decide with confidence");
    if (r >= 3) return t("form.impactBanner.r3", "Thank you — your honesty helps buyers see the full picture");
    return t("form.impactBanner.rLow", "We're sorry it went this way — your review protects future buyers");
  };

  // Move to Step 2; if chips were selected and the editor is empty, seed a draft sentence.
  const goToPhase2 = () => {
    if (selectedChips.length > 0 && !contentPlainText) {
      const isAr = (typeof document !== "undefined" && document.documentElement.lang === "ar");
      const seed = isAr
        ? `اشتريت وحدتي في ${developerName}، وأبرز ما ميّز تجربتي: ${selectedChips.join("، ")}.`
        : `I bought my unit at ${developerName}. What stood out the most: ${selectedChips.join(", ")}.`;
      setContent(`<p>${seed}</p>`);
    }
    trackReviewFunnelEvent({
      eventType: "phase_advanced",
      phase: 2,
      rating,
      reviewId: savedReviewId,
      developerId,
      developerName,
      selectedChips,
      isGuest,
      metadata: { seededFromChips: selectedChips.length > 0 && !contentPlainText },
    });
    setPhase(2);
  };

  if (!open && !showSuccessOverlay) return null;

  if (showSuccessOverlay) {
    return (
      <ReviewSuccessOverlay
        open={showSuccessOverlay}
        onClose={() => setShowSuccessOverlay(false)}
        isFirstReview={successIsFirst}
        developerName={developerName}
        rating={successRating}
        totalReviews={successTotalReviews}
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

  // ===================== THANKS INTERSTITIAL (Facebook-style) =====================

  const renderThanksScreen = () => (
    <div className="flex flex-col items-center py-8 px-6 space-y-6">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <Check className="w-8 h-8 text-primary" />
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-foreground">
          {t("form.thanksFeedback", "Thanks for your feedback!")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t("form.ratingRecorded", "Your rating for {{name}} has been recorded.", { name: developerName })}
        </p>
      </div>

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={cn(
              "w-8 h-8",
              s <= rating ? "fill-accent text-accent" : "text-muted-foreground/30"
            )}
          />
        ))}
      </div>

      {/* Motivational micro-copy */}
      <p className="text-xs text-primary font-medium text-center">
        {t("form.thanksMotivation", "Adding details earns you +15 community points 🎯")}
      </p>
      <p className="text-[10px] text-muted-foreground text-center">
        Reviews like yours have helped 2,847 buyers this month
      </p>

      <div className="w-full space-y-3 max-w-xs">
        <Button
          className="w-full gap-2 min-h-[48px]"
          onClick={() => {
            setShowThanksScreen(false);
            setPhase(2);
          }}
        >
          <PenLine className="w-4 h-4" />
          {t("form.writeReview", "Write a Review")}
        </Button>

        <Button
          variant="ghost"
          className="w-full text-muted-foreground min-h-[44px]"
          onClick={() => handleDone()}
        >
          {t("form.doneForNow", "Done")}
        </Button>
      </div>
    </div>
  );

  // ===================== PHASE RENDERERS =====================

  // STEP 1 — Facebook-style single-screen Rate card
  const renderPhase1 = () => {
    const userDisplayName =
      (user?.user_metadata?.full_name as string) ||
      (user?.user_metadata?.name as string) ||
      user?.email ||
      "";
    return (
      <div className="flex flex-col py-4 px-4 md:px-6 space-y-4">
        {/* Brand row */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-border flex items-center justify-center text-primary font-bold text-lg shrink-0">
            {(developerName || "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground truncate">{developerName}</p>
            <p className="text-xs text-muted-foreground truncate">
              {t("form.shareYourExperience", "Share your experience")}
            </p>
          </div>
        </div>

        {/* Tap to Rate */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="text-sm font-medium text-foreground">
            {t("form.tapToRate", "Tap to Rate:")}
          </span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="p-0.5 transition-transform hover:scale-110 active:scale-95"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => {
                  setRating(star);
                  if (!savedReviewId) saveRatingOnly(star);
                  trackReviewFunnelEvent({
                    eventType: "rating_selected",
                    rating: star,
                    developerId,
                    developerName,
                    isGuest,
                  });
                }}
                disabled={isSaving}
              >
                <Star
                  className={cn(
                    "w-8 h-8 md:w-10 md:h-10 transition-colors",
                    (hoverRating || rating) >= star
                      ? "fill-accent text-accent"
                      : "text-muted-foreground/30"
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        {rating > 0 && savedReviewId && !isSaving && (
          <p className="text-sm text-primary/90 italic text-center">
            {getRatingEncouragement(rating)}
          </p>
        )}

        {/* Social Impact Banner — logged-in users only, after rating-only save */}
        {!isGuest && rating > 0 && savedReviewId && !isSaving && (
          <div
            className="flex items-start gap-2 rounded-xl p-3 animate-fade-in"
            style={{
              background: "#fdf3d0",
              border: "0.5px solid #f0d068",
              animationDelay: "600ms",
              animationFillMode: "both",
            }}
          >
            <Eye className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#7a5500" }} />
            <p className="text-xs leading-relaxed" style={{ color: "#7a5500" }}>
              {getImpactBannerText(rating)}
            </p>
          </div>
        )}

        {/* Word-Cloud Chips — pick what fits, helps draft the review */}
        {rating > 0 && savedReviewId && !isSaving && (
          <div className="space-y-2">
            <p
              className="text-[12px] font-semibold uppercase text-muted-foreground"
              style={{ letterSpacing: "0.06em" }}
            >
              {t("form.chips.header", "Pick what fits your experience")}
            </p>
            <div className="flex flex-wrap gap-2">
              {(CHIPS_BY_RATING[rating] || []).map((chip) => {
                const isAr = (typeof document !== "undefined" && document.documentElement.lang === "ar");
                const label = isAr ? chip.ar : chip.en;
                const isSelected = selectedChips.includes(label);
                const s = CHIP_STYLES[chip.sentiment];
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() =>
                      setSelectedChips((prev) => {
                        const isOn = prev.includes(label);
                        const next = isOn ? prev.filter((x) => x !== label) : [...prev, label];
                        trackReviewFunnelEvent({
                          eventType: isOn ? "chip_deselected" : "chip_selected",
                          chipLabel: label,
                          chipSentiment: chip.sentiment,
                          rating,
                          selectedChips: next,
                          reviewId: savedReviewId,
                          developerId,
                          developerName,
                          isGuest,
                        });
                        return next;
                      })
                    }
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium border transition-all min-h-[32px]",
                      isSelected && "ring-2 ring-[#ed1b40] scale-105"
                    )}
                    style={{ background: s.bg, color: s.text, borderColor: s.border }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <p
              className="text-xs"
              style={{ color: selectedChips.length > 0 ? "#1a6635" : undefined }}
            >
              {selectedChips.length > 0
                ? t("form.chips.hintReady", "Great — continue to write your review")
                : t("form.chips.hintEmpty", "Pick a few words and we'll help you draft the review ✨")}
            </p>
          </div>
        )}

        {/* Guest name input only — no "reviewing as" line for logged-in users */}
        {isGuest && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder={t("guestReview.namePlaceholder", "Your name (optional)")}
              className="h-8 text-xs flex-1"
            />
          </div>
        )}

        {/* Submit — primary action (rating-only) */}
        <div className="pt-1">
          <Button
            size="sm"
            className="gap-1.5 min-h-[44px] w-full"
            disabled={!rating || isSaving}
            onClick={async () => {
              await handleDone();
            }}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {t("form.submit", "Submit")}
          </Button>
        </div>

        {/* Motivating card — single CTA into Step 2 */}
        {rating > 0 && (
          <button
            type="button"
            onClick={goToPhase2}
            className="w-full text-start rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 p-4 hover:border-primary/50 hover:shadow-md transition-all active:scale-[0.99] group"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl shrink-0">✨</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {t("form.motivator.goDeeperCard.title", "Tell your full story →")}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t(
                    "form.motivator.goDeeperCard.subtitle",
                    "Add a title & a few lines. Earn +25 pts and help thousands of buyers decide with confidence."
                  )}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-primary mt-0.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        )}
      </div>
    );
  };

  const renderPhase2 = () => (
    <div className="p-4 md:p-6 pt-2 space-y-3 md:space-y-4">
      {/* Motivating hero banner — encourages deeper reviews */}
      <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 p-3 md:p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl shrink-0">✍️</div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {t("form.deepReview.title", "Your story helps thousands of buyers")}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t(
                "form.deepReview.subtitle",
                "Share what worked, what didn't, and what you'd tell a friend. Detailed reviews earn +50 pts and a verified badge."
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Review Title with AI suggestions */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-muted-foreground">{t("form.review_title", "Title")} <span className="text-muted-foreground/50">({t("form.optional", "optional")})</span></label>
          {!isGuest && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 gap-1 text-xs px-2 text-primary"
              onClick={getAiTitleSuggestions}
              disabled={isAiLoading}
            >
              {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
              AI
            </Button>
          )}
        </div>

        {aiTitleSuggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {aiTitleSuggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                className="text-xs px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                onClick={() => {
                  setTitle(s.title);
                  if (!hasContent) setContent(s.starter);
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
          placeholder={t("form.review_title_placeholder", "Sum up your experience")}
          maxLength={100}
          className="h-9 text-sm"
        />
      </div>

      {/* Review Content — hero section */}
      <div className="space-y-2">
        <Textarea
          value={contentPlainText}
          onChange={(e) => {
            const text = e.target.value;
            // Store as plain text wrapped in a paragraph so DB/HTML pipeline stays consistent
            setContent(text ? `<p>${text.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>")}</p>` : "");
            const localCheck = checkContentLocally(text);
            setLocalWarning(localCheck.blocked ? t("contentGuard.typingWarning") : null);
            if (aiModeration) setAiModeration(null);
          }}
          placeholder={t("form.review_placeholder", "Share your experience — what went well? What could improve?")}
          rows={isMobile ? 5 : 6}
          className="text-sm resize-none"
        />

        {/* Action toolbar — Voice + AI Enhance only */}
        <div className="flex items-center gap-2 flex-wrap">
          {!isGuest && (
            <>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  isRecording
                    ? "bg-destructive text-destructive-foreground animate-pulse"
                    : "bg-secondary/80 text-foreground hover:bg-secondary hover:shadow-sm"
                )}
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                {isRecording ? t("form.stop", "Stop") : t("form.voice_label", "Voice")}
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-40"
                onClick={() => enhanceWithAi(false)}
                disabled={isEnhancing || !hasContent}
              >
                {isEnhancing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {t("form.enhance_label", "Polish my writing ✨")}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content warnings */}
      {localWarning && (
        <div className="flex items-start gap-2 rounded-lg p-2.5 bg-destructive/10 border border-destructive/20">
          <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-xs text-destructive font-medium">{localWarning}</p>
        </div>
      )}

      {/* Navigation — sticky bottom */}
      <div className="flex items-center justify-between pt-1 sticky bottom-0 bg-background pb-1">
        <Button variant="ghost" size="sm" onClick={() => setPhase(1)} className="gap-1 h-9">
          <ChevronLeft className="w-4 h-4" /> {t("form.back", "Back")}
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              if (hasContent) {
                const localCheck = checkContentLocally(contentPlainText);
                if (localCheck.blocked) {
                  setLocalWarning(t("contentGuard.profanity"));
                  return;
                }
                await savePhase2();
              }
              await handleDone();
            }}
            disabled={isSaving}
            className="text-primary h-9 gap-1.5"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {t("form.submit", "Submit")}
          </Button>
          <Button
            size="sm"
            onClick={async () => {
              if (hasContent) {
                const localCheck = checkContentLocally(contentPlainText);
                if (localCheck.blocked) {
                  setLocalWarning(t("contentGuard.profanity"));
                  return;
                }
                setIsCheckingContent(true);
                const result = await checkContentWithAI(contentPlainText, "review", rating, (name, opts) => supabase.functions.invoke(name, opts));
                setIsCheckingContent(false);
                if (result) {
                  setAiModeration(result);
                  if (result.suspicion_score > 80) return;
                }
                await savePhase2();
              }
              setPhase(3);
            }}
            disabled={isCheckingContent}
            className="gap-1 h-9"
          >
            {isCheckingContent ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {t("contentGuard.checking")}</>
            ) : (
              <>{t("form.next", "Next")} <ChevronRight className="w-4 h-4" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  // STEP 3 — Category ratings only
  const renderPhase3 = () => (
    <div className="p-4 md:p-6 pt-2 space-y-4">
      {/* Rich-formatted review (optional upgrade from Step 2's plain text) */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          {t("form.richReviewLabel", "Polish your review with formatting")}
          <span className="text-muted-foreground/50">({t("form.optional", "optional")})</span>
        </label>
        <ReviewRichEditor
          content={content}
          onChange={(html) => {
            setContent(html);
            const plainText = getPlainTextFromHtml(html);
            const localCheck = checkContentLocally(plainText);
            setLocalWarning(localCheck.blocked ? t("contentGuard.typingWarning") : null);
            if (aiModeration) setAiModeration(null);
          }}
          placeholder={t("form.review_placeholder", "Share your experience — what went well? What could improve?")}
          rows={isMobile ? 4 : 5}
        />
        <div className="flex items-center gap-2 flex-wrap mt-2">
          {!isGuest && (
            <>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  isRecording
                    ? "bg-destructive text-destructive-foreground animate-pulse"
                    : "bg-secondary/80 text-foreground hover:bg-secondary hover:shadow-sm"
                )}
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                {isRecording ? t("form.stop", "Stop") : t("form.voice_label", "Voice")}
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-40"
                onClick={() => enhanceWithAi(false)}
                disabled={isEnhancing || !hasContent}
              >
                {isEnhancing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {t("form.enhance_label", "Polish my writing ✨")}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Context — moved from Step 2 to keep Step 2 focused on writing */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{contextField.label}</label>
        {contextField.chips ? (
          <ChipSelect
            options={contextField.chips.map((c) => ({ key: c.toLowerCase(), label: c }))}
            value={unitType}
            onChange={setUnitType}
          />
        ) : (
          <Input
            value={unitType}
            onChange={(e) => setUnitType(e.target.value)}
            placeholder={contextField.placeholder}
            className="h-9 text-sm"
          />
        )}
      </div>

      {!isGuest && (
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t("form.experience_type", "Experience Type")}</label>
          <ChipSelect
            options={experienceChips}
            value={experienceType}
            onChange={setExperienceType}
          />
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-1">
          {t("form.categoryRatings", "Rate specific categories")}
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          {t("form.categoryRatingsDesc", "Optional — helps others understand your experience better")}
          <span className="ms-1 inline-flex items-center gap-1 text-primary font-semibold">
            · {t("form.categoryRatingsBonus", "+5 pts per category rated")}
          </span>
        </p>

        <div className="space-y-3">
          {categoryMetricKeys.map((key) => (
            <MiniStarRow
              key={key}
              label={t(`categoryMetrics.${metricsCategory}.${key}`, key)}
              value={categoryRatings[key] || 0}
              onChange={(val) => setCategoryRatings((prev) => ({ ...prev, [key]: val }))}
            />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-1 sticky bottom-0 bg-background pb-1">
        <Button variant="ghost" size="sm" onClick={() => setPhase(2)} className="gap-1 h-9">
          <ChevronLeft className="w-4 h-4" /> {t("form.back", "Back")}
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => safeClose()}
            className="text-muted-foreground h-9"
          >
            {t("form.saveAndClose", "Save & Close")}
          </Button>
          <Button
            size="sm"
            onClick={async () => {
              if (Object.keys(categoryRatings).length > 0) await savePhase3();
              setPhase(4);
            }}
            className="gap-1 h-9"
          >
            {t("form.next", "Next")} <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <MotivatorChip
        icon="🛡️"
        text={t("form.motivator.step3", "Almost done — add proof next for a verified badge")}
      />
    </div>
  );

  // STEP 4 — Proof & Polish (attachments, verification, anonymous, final submit)
  const renderPhase4 = () => (
    <div className="p-4 md:p-6 pt-2 space-y-4">
      {!isGuest && (
        <Collapsible open={moreOptionsOpen} onOpenChange={setMoreOptionsOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-foreground w-full py-2 md:hidden">
            <ChevronDown className={cn("w-4 h-4 transition-transform", moreOptionsOpen && "rotate-180")} />
            {t("form.moreOptions", "More Options")}
            <Badge variant="secondary" className="text-[10px] ms-1">{t("form.optional", "Optional")}</Badge>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-4 md:!block">
            {/* Attachments */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block flex items-center gap-1.5">
                <Paperclip className="w-4 h-4" /> {t("form.attachments", "Attachments")}
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => fileInputRef.current?.click()}>
                  <ImageIcon className="w-3.5 h-3.5" /> {t("form.photos", "Photos")}
                </Button>
                <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => {
                  if (fileInputRef.current) { fileInputRef.current.accept = ".pdf,.doc,.docx"; fileInputRef.current.click(); fileInputRef.current.accept = "image/*,.pdf,.doc,.docx"; }
                }}>
                  <FileText className="w-3.5 h-3.5" /> {t("form.documents", "Documents")}
                </Button>
              </div>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx" multiple onChange={handleFileSelect} />
              {/* Secure contract upload (replaces raw receipt camera) */}
              {!isGuest && (
                <div className="mt-3">
                  <SecureContractUpload
                    developerId={developerId}
                    developerName={developerName}
                  />
                </div>
              )}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {attachments.map((att, i) => (
                    <div key={i} className="relative group">
                      {att.preview ? (
                        <img src={att.preview} alt="" className="w-14 h-14 rounded-lg object-cover border border-border" />
                      ) : (
                        <div className="w-14 h-14 rounded-lg border border-border flex items-center justify-center bg-secondary">
                          <FileText className="w-5 h-5 text-muted-foreground" />
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

            {/* Verification */}
            <div className="bg-secondary/30 rounded-lg p-3 border border-border/50">
              <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-accent" /> {t("form.purchase_verification", "Verification")}
                <Badge variant="secondary" className="text-[10px] ms-1">{t("form.optional", "Optional")}</Badge>
              </label>
              <p className="text-xs text-foreground/80 mb-2 leading-relaxed">
                {t(
                  "form.verification_desc",
                  "Upload your booking receipt to earn the Verified Buyer badge and 2× points."
                )}
              </p>
              <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => verificationInputRef.current?.click()}>
                <Receipt className="w-3.5 h-3.5" /> {t("form.upload_verification", "Upload")}
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

            {/* Anonymous Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="rounded border-border" />
              <span className="text-sm text-foreground">{t("form.post_anonymously", "Post anonymously")}</span>
            </label>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Trust signals for guests */}
      {isGuest && <TrustSignals compact />}

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

      {/* Disclaimer — gates final submission */}
      <DisclaimerCheckbox checked={disclaimerAgreed} onCheckedChange={setDisclaimerAgreed} />

      {/* Navigation + Done */}
      <div className="flex items-center justify-between pt-1 sticky bottom-0 bg-background pb-1">
        <Button variant="ghost" size="sm" onClick={() => setPhase(3)} className="gap-1 h-9">
          <ChevronLeft className="w-4 h-4" /> {t("form.back", "Back")}
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => safeClose()}
            className="text-muted-foreground h-9"
          >
            {t("form.saveAndClose", "Save & Close")}
          </Button>
          <Button
            size="sm"
            onClick={async () => {
              setIsUploading(true);
              await savePhase3();
              setIsUploading(false);
              handleDone();
            }}
            disabled={isUploading || !disclaimerAgreed || (aiModeration?.suspicion_score ?? 0) > 80}
            className="gap-1.5 min-h-[44px]"
          >
            {isUploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {t("form.saving", "Saving...")}</>
            ) : (
              <><Check className="w-4 h-4" /> {t("form.submitReview", "Submit Review")}</>
            )}
          </Button>
        </div>
      </div>

      <MotivatorChip
        icon="🏆"
        text={t("form.motivator.step4", "You're a top contributor — verified reviewers get 3× visibility")}
      />
    </div>
  );

  return (
    <>
      <ConfettiCelebration trigger={firstReviewCelebration} duration={3500} particleCount={80} />
      <Dialog open={open} onOpenChange={(v) => { if (!v) { safeClose(); } else { onOpenChange(true); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          {/* Progress Header */}
          <div className="px-4 md:px-6 pt-4 md:pt-6 pb-0 space-y-3">
            <DialogHeader>
              <DialogTitle className="text-lg md:text-xl font-bold text-foreground">
                {t("nav_write_review")} {developerName && t("form.for_developer", { name: developerName })}
              </DialogTitle>
              {isGuest && phase === 1 && !showThanksScreen && (
                <p className="text-xs text-muted-foreground mt-1">
                  {t("guestReview.noAccountNeeded", "No account needed — share your experience freely")}
                </p>
              )}
            </DialogHeader>

            {/* Progress Bar */}
            {!showThanksScreen && !showResumePrompt && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {t("form.step", "Step")} {phase} {t("form.of", "of")} {TOTAL_STEPS}
                  </span>
                  <span className="font-medium text-foreground">{PHASE_LABELS[phase - 1]}</span>
                </div>
                <Progress value={(phase / TOTAL_STEPS) * 100} className="h-2" />
              </div>
            )}

            {/* Star summary when past phase 1 */}
            {phase > 1 && !showThanksScreen && !showResumePrompt && (
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

          {/* Phase Content */}
          <div className="overflow-hidden">
            {showResumePrompt && draft ? (
              <div className="px-4 md:px-6 py-6 space-y-5">
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <PenLine className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-lg font-bold text-foreground">
                        {t("form.resume_title", "Continue your review?")}
                      </h3>
                      <p className="text-xs md:text-sm text-muted-foreground mt-1">
                        {t("form.resume_subtitle", "We saved your progress from last time. Pick up right where you left off.")}
                      </p>
                    </div>
                  </div>

                  {/* Draft summary */}
                  <div className="rounded-xl bg-background border border-border p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={cn("w-4 h-4", s <= (draft.rating || 0) ? "fill-accent text-accent" : "text-muted-foreground/30")} />
                        ))}
                      </div>
                      <span className="text-xs font-medium text-foreground">{draft.rating}/5</span>
                      <Badge variant="secondary" className="ms-auto text-[10px]">
                        {draft.completion_level === "with_comment"
                          ? t("form.resume_step_categories", "Step 3 · Categories")
                          : t("form.resume_step_review", "Step 2 · Your Review")}
                      </Badge>
                    </div>
                    {draft.title && (
                      <p className="text-sm font-medium text-foreground line-clamp-1">{draft.title}</p>
                    )}
                    {draft.comment && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{getPlainTextFromHtml(draft.comment)}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground">
                      {t("form.resume_saved_at", "Saved")} {new Date(draft.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={restoreDraft} className="flex-1 gap-2">
                      <ChevronRight className="w-4 h-4" />
                      {t("form.resume_continue", "Continue where I left off")}
                    </Button>
                    <Button onClick={discardDraft} variant="outline" className="flex-1">
                      {t("form.resume_start_fresh", "Start fresh")}
                    </Button>
                  </div>
                </div>
              </div>
            ) : showThanksScreen ? (
              renderThanksScreen()
            ) : (
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${(phase - 1) * (100 / TOTAL_STEPS)}%)`, width: `${TOTAL_STEPS * 100}%` }}
              >
                <div className="flex-shrink-0" style={{ width: `${100 / TOTAL_STEPS}%` }}>{renderPhase1()}</div>
                <div className="flex-shrink-0" style={{ width: `${100 / TOTAL_STEPS}%` }}>{renderPhase2()}</div>
                <div className="flex-shrink-0" style={{ width: `${100 / TOTAL_STEPS}%` }}>{renderPhase3()}</div>
                <div className="flex-shrink-0" style={{ width: `${100 / TOTAL_STEPS}%` }}>{renderPhase4()}</div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
