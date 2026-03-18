import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { ConfettiCelebration } from "@/components/ConfettiCelebration";
import { Trophy } from "lucide-react";
import { TrustSignals } from "@/components/TrustSignals";

interface WriteReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  developerName?: string;
  developerId?: string;
  onReviewSubmitted?: () => void;
}

const EXPERIENCE_TYPES_KEYS = [
  "form.exp_buyer",
  "form.exp_agent",
  "form.exp_investor",
  "form.exp_construction",
  "form.exp_family",
];

const EMOJI_QUICK = ["👍", "👎", "⭐", "🏠", "💰", "🔑", "📋", "✅", "❌", "🏗️", "😊", "😤"];

export const WriteReviewModal = ({
  open,
  onOpenChange,
  developerName = "",
  developerId = "",
  onReviewSubmitted,
}: WriteReviewModalProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, signUp } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [firstReviewCelebration, setFirstReviewCelebration] = useState(false);

  // Guest vs authenticated mode
  const isGuest = !user;

  // Post-submit account prompt state
  const [showAccountPrompt, setShowAccountPrompt] = useState(false);
  const [guestReviewId, setGuestReviewId] = useState<string | null>(null);
  const [signupEmail, setSignupEmail] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);

  // Form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [experienceType, setExperienceType] = useState("");
  const [unitType, setUnitType] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [guestName, setGuestName] = useState("");

  // AI state
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
    setAttachments([]);
    setVerificationFiles([]);
    setGuestName("");
    setShowAccountPrompt(false);
    setGuestReviewId(null);
    setSignupEmail("");
    setSignupName("");
    setSignupPassword("");
  };

  // AI Suggestions
  const getAiSuggestions = useCallback(async () => {
    setIsAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("review-ai-assist", {
        body: {
          action: "suggest",
          text: content,
          developerName,
          rating,
          experienceType,
        },
      });
      if (error) throw error;
      if (data.suggestions) setAiSuggestions(data.suggestions);
      if (data.emojis) setAiEmojis(data.emojis);
      if (data.keywords) setAiKeywords(data.keywords);
    } catch (e) {
      toast({ title: t("form.ai_unavailable"), description: t("form.ai_unavailable_desc"), variant: "destructive" });
    } finally {
      setIsAiLoading(false);
    }
  }, [content, developerName, rating, experienceType, toast]);

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
  }, [content, developerName, toast]);

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
            if (content.trim()) {
              await enhanceWithAi(true);
            }
          }
        } catch {
          toast({ title: "Voice processing", description: "Transcription complete. You can enhance with AI.", variant: "default" });
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
      toast({ title: "🎙️ Recording...", description: "Speak your review. Click stop when done." });
    } catch {
      toast({ title: "Microphone error", description: "Please allow microphone access.", variant: "destructive" });
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

  // Verification files
  const handleVerificationSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setVerificationFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeVerification = (index: number) => {
    setVerificationFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Receipt camera handler
  const handleReceiptCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to scan a receipt.", variant: "destructive" });
      return;
    }

    setIsReceiptUploading(true);
    try {
      const filePath = `receipts/${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("review-attachments")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("review-attachments")
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from("receipt_submissions")
        .insert({
          user_id: user.id,
          developer_id: developerId || null,
          developer_name: developerName || null,
          image_url: urlData.publicUrl,
          status: "pending",
        });

      if (dbError) throw dbError;

      const preview = URL.createObjectURL(file);
      setAttachments((prev) => [...prev, { file, preview, type: "receipt" }]);

      toast({
        title: "📸 Receipt captured!",
        description: "Your receipt has been submitted for admin verification.",
      });
    } catch (err) {
      console.error("Receipt upload error:", err);
      toast({ title: "Upload failed", description: "Could not upload receipt. Please try again.", variant: "destructive" });
    } finally {
      setIsReceiptUploading(false);
      e.target.value = "";
    }
  };

  // Submit — guest or authenticated
  const handleSubmit = async () => {
    if (rating === 0) {
      toast({ title: "Rating required", description: "Please select a star rating.", variant: "destructive" });
      return;
    }
    if (!content.trim()) {
      toast({ title: "Review required", description: "Please write your review.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      if (isGuest) {
        // Guest submit — insert into guest_reviews
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
          })
          .select("id")
          .single();

        if (error) throw error;

        setGuestReviewId((data as any).id);
        setShowAccountPrompt(true);
        toast({
          title: "✅ Review submitted!",
          description: `Your review for ${developerName} has been submitted. Create an account to track it!`,
        });
      } else {
        // Authenticated submit — existing flow
        const uploadedUrls: string[] = [];
        for (const att of [...attachments, ...verificationFiles.map((f) => ({ file: f, type: "verification" }))]) {
          const filePath = `${user.id}/${Date.now()}-${att.file.name}`;
          const { error } = await supabase.storage
            .from("review-attachments")
            .upload(filePath, att.file);
          if (!error) {
            const { data: urlData } = supabase.storage
              .from("review-attachments")
              .getPublicUrl(filePath);
            uploadedUrls.push(urlData.publicUrl);
          }
        }

        let displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email || "Anonymous";
        if (!isAnonymous) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", user.id)
            .single();
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
        });

        if (insertError) throw insertError;

        const { count: totalReviews } = await supabase
          .from("reviews")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);

        const isFirstReview = totalReviews === 1;

        if (isFirstReview) {
          setFirstReviewCelebration(true);
          toast({
            title: "🏆 First Review Badge Earned!",
            description: "You've earned the 'First Review' badge and +25 points! Keep sharing your experiences.",
            duration: 6000,
          });
          setTimeout(() => setFirstReviewCelebration(false), 4000);
        } else {
          toast({
            title: "✅ Review submitted!",
            description: `Your review for ${developerName} has been submitted successfully.${verificationFiles.length > 0 ? " Verification documents are under review." : ""}`,
          });
        }

        resetForm();
        onReviewSubmitted?.();
        onOpenChange(false);
      }
    } catch (e) {
      console.error("Review submission error:", e);
      toast({ title: "Submission error", description: "Could not submit review. Please try again.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle account creation after guest review
  const handleGuestSignup = async () => {
    if (!signupEmail || !signupPassword) {
      toast({ title: "Required fields", description: "Please fill in email and password.", variant: "destructive" });
      return;
    }
    if (signupPassword.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    setIsSigningUp(true);
    try {
      const { error } = await signUp(signupEmail, signupPassword, signupName || guestName || undefined);
      if (error) {
        if (error.message.includes("already registered")) {
          toast({ title: "Account exists", description: "An account with this email already exists. Please sign in.", variant: "destructive" });
        } else {
          toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
        }
        return;
      }

      // Mark the guest review as claimed (will be done after email verification + login)
      if (guestReviewId) {
        // Store in localStorage so we can claim after verification
        localStorage.setItem("r8_pending_claim_review", guestReviewId);
      }

      toast({
        title: "🎉 Account created!",
        description: "Please check your email to verify your account. Your review will be linked automatically.",
        duration: 6000,
      });

      resetForm();
      onReviewSubmitted?.();
      onOpenChange(false);
    } catch (e) {
      toast({ title: "Error", description: "Could not create account.", variant: "destructive" });
    } finally {
      setIsSigningUp(false);
    }
  };

  const insertText = (text: string) => {
    setContent((prev) => (prev ? `${prev} ${text}` : text));
  };

  if (!open) return null;

  // Post-submit account prompt for guests
  if (showAccountPrompt && isGuest) {
    return (
      <Dialog open={open} onOpenChange={(v) => { if (!v) { resetForm(); } onOpenChange(v); }}>
        <DialogContent className="max-w-md p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              {t("guestReview.claimTitle", "Claim your review")}
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 pt-3 space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("guestReview.claimDescription", "Create an account to track your review, earn badges, and edit it later.")}
            </p>

            <div className="space-y-3">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t("auth.fullName", "Full Name")}
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="ps-10"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder={t("auth.email", "Email")}
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="ps-10"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder={t("auth.password", "Password")}
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="ps-10"
                />
              </div>
            </div>

            <TrustSignals compact className="mt-2" />

            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={handleGuestSignup} disabled={isSigningUp} className="w-full gap-2">
                {isSigningUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {isSigningUp
                  ? t("guestReview.creatingAccount", "Creating account...")
                  : t("auth.createAccount", "Create Account")}
              </Button>
              <Button
                variant="ghost"
                className="w-full text-sm text-muted-foreground"
                onClick={() => {
                  resetForm();
                  onReviewSubmitted?.();
                  onOpenChange(false);
                }}
              >
                {t("guestReview.skipForNow", "Skip for now")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
    <ConfettiCelebration trigger={firstReviewCelebration} duration={3500} particleCount={80} />
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 md:p-6 pb-0">
          <DialogTitle className="text-lg md:text-xl font-bold text-foreground">
            Write a Review {developerName && `for ${developerName}`}
          </DialogTitle>
          {isGuest && (
            <p className="text-xs text-muted-foreground mt-1">
              {t("guestReview.noAccountNeeded", "No account needed — share your experience freely")}
            </p>
          )}
        </DialogHeader>

        <div className="p-4 md:p-6 pt-2 space-y-5">
          {/* Guest name field */}
          {isGuest && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{t("guestReview.yourName", "Your Name")}</label>
              <Input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder={t("guestReview.namePlaceholder", "Enter your name (optional)")}
              />
            </div>
          )}

          {/* Star Rating */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Your Rating *</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 touch-target"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={cn(
                      "w-8 h-8 transition-colors",
                      (hoverRating || rating) >= star
                        ? "fill-accent text-accent"
                        : "text-muted-foreground/30"
                    )}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm font-medium text-foreground">
                  {rating}/5
                </span>
              )}
            </div>
          </div>

          {/* Experience Type & Unit Type — only for authenticated users */}
          {!isGuest && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Experience Type</label>
                <Select value={experienceType} onValueChange={setExperienceType}>
                  <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Unit Type</label>
                <Input
                  value={unitType}
                  onChange={(e) => setUnitType(e.target.value)}
                  placeholder="e.g., 2BR Apartment, Villa..."
                />
              </div>
            </div>
          )}

          {/* Review Title */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Review Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience..."
              maxLength={100}
            />
          </div>

          {/* Review Content with AI toolbar — AI only for authenticated */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-foreground">Your Review *</label>
              {!isGuest && (
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant={isRecording ? "destructive" : "outline"}
                    size="sm"
                    className="h-8 gap-1 text-xs"
                    onClick={isRecording ? stopRecording : startRecording}
                  >
                    {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    {isRecording ? "Stop" : "Voice"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 text-xs"
                    onClick={getAiSuggestions}
                    disabled={isAiLoading}
                  >
                    {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    AI Suggest
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 text-xs"
                    onClick={() => enhanceWithAi(false)}
                    disabled={isEnhancing || !content.trim()}
                  >
                    {isEnhancing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-accent" />}
                    Enhance
                  </Button>
                </div>
              )}
            </div>

            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your experience... What was good? What could be better? Would you recommend?"
              rows={isGuest ? 4 : 5}
              className="resize-none"
            />

            {/* Quick Emoji Bar */}
            <div className="flex flex-wrap items-center gap-1 mt-2">
              {(aiEmojis.length > 0 ? aiEmojis : EMOJI_QUICK).map((emoji, i) => (
                <button
                  key={i}
                  type="button"
                  className="text-lg hover:scale-125 transition-transform p-0.5"
                  onClick={() => insertText(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* AI Suggestions Panel — authenticated only */}
          {!isGuest && aiSuggestions.length > 0 && (
            <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Suggestions — click to add
              </p>
              <div className="space-y-1.5">
                {aiSuggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    className="block w-full text-left text-sm p-2 rounded-md bg-background hover:bg-primary/5 border border-border/50 transition-colors"
                    onClick={() => insertText(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {aiKeywords.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {aiKeywords.map((kw, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary/10 text-xs"
                      onClick={() => insertText(kw)}
                    >
                      {kw}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Attachments — authenticated only */}
          {!isGuest && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block flex items-center gap-1.5">
                <Paperclip className="w-4 h-4" /> Attachments
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 text-xs"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-3.5 h-3.5" /> Photos
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 text-xs"
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = ".pdf,.doc,.docx";
                      fileInputRef.current.click();
                      fileInputRef.current.accept = "image/*,.pdf,.doc,.docx";
                    }
                  }}
                >
                  <FileText className="w-3.5 h-3.5" /> Documents
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 text-xs"
                  disabled={isReceiptUploading}
                  onClick={() => {
                    if (receiptCameraRef.current) {
                      receiptCameraRef.current.click();
                    }
                  }}
                >
                  {isReceiptUploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Camera className="w-3.5 h-3.5" />
                  )}
                  {isReceiptUploading ? "Uploading..." : "Scan Receipt"}
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
                multiple
                onChange={handleFileSelect}
              />

              <input
                ref={receiptCameraRef}
                type="file"
                className="hidden"
                accept="image/*"
                capture="environment"
                onChange={handleReceiptCapture}
              />

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
                      <button
                        type="button"
                        className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeAttachment(i)}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Verification Section — authenticated only */}
          {!isGuest && (
            <div className="bg-secondary/30 rounded-lg p-3 border border-border/50">
              <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-accent" /> Purchase Verification
                <Badge variant="secondary" className="text-[10px] ml-1">Optional</Badge>
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Upload proof of purchase (receipt, contract, payment confirmation) to get a <strong>Verified Buyer</strong> badge on your review.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 text-xs"
                onClick={() => verificationInputRef.current?.click()}
              >
                <Receipt className="w-3.5 h-3.5" /> Upload Verification
              </Button>
              <input
                ref={verificationInputRef}
                type="file"
                className="hidden"
                accept="image/*,.pdf"
                multiple
                onChange={handleVerificationSelect}
              />

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

          {/* Anonymous Toggle — authenticated only */}
          {!isGuest && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded border-border"
              />
              <span className="text-sm text-foreground">Post anonymously</span>
            </label>
          )}

          {/* Trust signals for guests */}
          {isGuest && <TrustSignals compact />}

          {/* Submit */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isUploading || rating === 0 || !content.trim()}
              className="gap-1.5 min-h-[44px]"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};
