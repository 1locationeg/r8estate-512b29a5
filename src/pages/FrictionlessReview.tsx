// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Shield, Video, Award, CheckCircle2, AlertTriangle, Loader2, Mail, X, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/* ─── helpers ─── */
function getDeviceFingerprint() {
  return {
    userAgent: navigator.userAgent,
    screenSize: `${screen.width}x${screen.height}`,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    platform: navigator.platform,
    timestamp: new Date().toISOString(),
  };
}

function getRatingColor(r: number) {
  if (r <= 1) return "text-red-500";
  if (r === 2) return "text-orange-500";
  if (r === 3) return "text-yellow-500";
  if (r === 4) return "text-green-500";
  return "text-primary";
}

/* ─── page ─── */
const FrictionlessReview = () => {
  const { token } = useParams<{ token?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  /* pre-fill from token */
  const [prefill, setPrefill] = useState<{ first_name?: string; project_name?: string; developer_id?: string; developer_name?: string } | null>(null);

  /* form state */
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [wantsVideo, setWantsVideo] = useState(false);
  const [guestName, setGuestName] = useState("");

  /* flow state */
  const [step, setStep] = useState(1); // 1=stars, 2=comment, 3+=extras
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [integrityWarning, setIntegrityWarning] = useState<string | null>(null);
  const [integrityBlocked, setIntegrityBlocked] = useState(false);

  /* video */
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const videoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* RTL detection */
  const isRTL = document.documentElement.dir === "rtl" || document.documentElement.lang === "ar";

  /* ─── anonymous auth on mount ─── */
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        await supabase.auth.signInAnonymously();
      }
    })();
  }, []);

  /* ─── fetch token prefill ─── */
  useEffect(() => {
    if (!token) return;
    (async () => {
      const { data } = await supabase
        .from("pending_reviews")
        .select("first_name, project_name, developer_id, developer_name")
        .eq("token", token)
        .eq("is_used", false)
        .maybeSingle();
      if (data) setPrefill(data);
    })();
  }, [token]);

  /* ─── star click ─── */
  const handleStarClick = (star: number) => {
    setRating(star);
    if (step === 1) setStep(2);
  };

  /* ─── video recording ─── */
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "video/webm" });
      videoChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) videoChunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(videoChunksRef.current, { type: "video/webm" });
        setVideoBlob(blob);
        setVideoUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
      videoTimerRef.current = setTimeout(() => stopRecording(), 30000);
    } catch {
      toast({ title: "Camera access denied", variant: "destructive" });
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (videoTimerRef.current) clearTimeout(videoTimerRef.current);
    setRecording(false);
  }, []);

  /* ─── integrity check ─── */
  const checkIntegrity = async (): Promise<boolean> => {
    if (comment.length < 20) return true; // too short to check
    try {
      const { data, error } = await supabase.functions.invoke("review-integrity-check", {
        body: { review_text: comment, rating },
      });
      if (error) return true; // fail-open
      if (data.suspicion_score > 90) {
        setIntegrityBlocked(true);
        setIntegrityWarning(data.suggestion || "This review appears to contain promotional language.");
        return false;
      }
      if (data.suspicion_score > 70) {
        setIntegrityWarning(data.suggestion || "Your review may sound promotional. Consider adding personal details.");
        return true; // warn but allow
      }
      return true;
    } catch {
      return true; // fail-open
    }
  };

  /* ─── submit ─── */
  const handleSubmit = async () => {
    if (rating === 0 || comment.trim().length < 5) {
      toast({ title: "Please add a rating and comment", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    setIntegrityWarning(null);
    setIntegrityBlocked(false);

    const passed = await checkIntegrity();
    if (!passed) {
      setSubmitting(false);
      return;
    }

    try {
      const developerId = prefill?.developer_id || "general";
      const developerName = prefill?.developer_name || null;
      const fingerprint = getDeviceFingerprint();

      // Upload video if exists
      let attachmentUrl: string | null = null;
      if (videoBlob) {
        const fileName = `video-${Date.now()}.webm`;
        const { error: uploadError } = await supabase.storage
          .from("review-attachments")
          .upload(fileName, videoBlob, { contentType: "video/webm" });
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("review-attachments").getPublicUrl(fileName);
          attachmentUrl = urlData.publicUrl;
        }
      }

      const { error } = await supabase.from("guest_reviews").insert({
        rating,
        comment,
        guest_name: guestName || prefill?.first_name || "Anonymous",
        developer_id: developerId,
        developer_name: developerName,
        device_fingerprint: fingerprint,
      });

      if (error) throw error;

      // Mark token as used
      if (token) {
        await supabase.from("pending_reviews").update({ is_used: true }).eq("token", token);
      }

      setSubmitted(true);
      toast({ title: "Review submitted! 🎉" });
    } catch (e) {
      toast({ title: "Submission failed", description: e instanceof Error ? e.message : "Please try again", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── inline signup state ─── */
  const [signupStep, setSignupStep] = useState<"options" | "email" | "password">("options");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  const handleGoogleSignup = async () => {
    localStorage.setItem("r8_pending_claim_review", "true");
    await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
      extraParams: { prompt: "select_account" },
    });
  };

  const handleAppleSignup = async () => {
    localStorage.setItem("r8_pending_claim_review", "true");
    await lovable.auth.signInWithOAuth("apple", {
      redirect_uri: window.location.origin,
    });
  };

  const handleEmailContinue = () => {
    if (!signupEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail)) {
      setSignupError("Please enter a valid email");
      return;
    }
    setSignupError(null);
    setSignupStep("password");
  };

  const handleEmailSignup = async () => {
    if (signupPassword.length < 6) {
      setSignupError("Password must be at least 6 characters");
      return;
    }
    setSignupLoading(true);
    setSignupError(null);
    localStorage.setItem("r8_pending_claim_review", "true");
    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        emailRedirectTo: window.location.origin,
        data: { account_type: "buyer" },
      },
    });
    setSignupLoading(false);
    if (error) {
      setSignupError(error.message);
    } else {
      toast({ title: "Check your email to verify! 📧" });
      navigate("/");
    }
  };

  /* ─── render stars (RTL-aware) ─── */
  const stars = [1, 2, 3, 4, 5];
  const displayStars = isRTL ? [...stars].reverse() : stars;
  const activeRating = hoverRating || rating;

  /* ─── inline signup: full name ─── */
  const [signupFullName, setSignupFullName] = useState("");

  const handleEmailSignupFull = async () => {
    if (!signupFullName.trim()) {
      setSignupError("Please enter your name");
      return;
    }
    if (!signupEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail)) {
      setSignupError("Please enter a valid email");
      return;
    }
    if (signupPassword.length < 6) {
      setSignupError("Password must be at least 6 characters");
      return;
    }
    setSignupLoading(true);
    setSignupError(null);
    localStorage.setItem("r8_pending_claim_review", "true");
    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: signupFullName, account_type: "buyer" },
      },
    });
    setSignupLoading(false);
    if (error) {
      setSignupError(error.message);
    } else {
      toast({ title: "Check your email to verify! 📧" });
      navigate("/");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-4 relative">
        <div className="fixed bottom-4 left-4 opacity-10 pointer-events-none select-none">
          <div className="flex items-center gap-1 text-xs font-bold text-primary">
            <Shield className="w-4 h-4" /> R8-Trust Integrity
          </div>
        </div>
        <Card className="w-full max-w-md mx-auto shadow-xl border-0">
          <CardContent className="p-6 sm:p-8 space-y-5">
            {/* Close / X button */}
            <div className="flex justify-end">
              <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Header */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Claim your review
              </h2>
              <p className="text-sm text-muted-foreground">
                Create an account to track your review, earn badges, and edit it later.
              </p>
            </div>

            {/* Social logins */}
            <div className="space-y-3">
              <Button onClick={handleGoogleSignup} variant="outline" className="w-full h-12 gap-3 text-base font-medium">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google
              </Button>
              <Button onClick={handleAppleSignup} variant="outline" className="w-full h-12 gap-3 text-base font-medium">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                Apple
              </Button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-3 text-muted-foreground">or continue with email</span></div>
            </div>

            {/* Form fields */}
            <div className="space-y-3">
              {/* Full Name */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={signupFullName}
                  onChange={(e) => { setSignupFullName(e.target.value); setSignupError(null); }}
                  className="pl-10 h-12"
                />
              </div>

              {/* Email */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                </div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={signupEmail}
                  onChange={(e) => { setSignupEmail(e.target.value); setSignupError(null); }}
                  className="pl-10 h-12"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={signupPassword}
                  onChange={(e) => { setSignupPassword(e.target.value); setSignupError(null); }}
                  onKeyDown={(e) => e.key === "Enter" && handleEmailSignupFull()}
                  className="pl-10 pr-10 h-12"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {signupError && (
                <p className="text-sm text-destructive">{signupError}</p>
              )}
            </div>

            {/* Trust signals */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Your review is protected
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                256-bit encrypted
              </span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> We never spam.
            </p>

            {/* CTA */}
            <Button onClick={handleEmailSignupFull} disabled={signupLoading} className="w-full h-12 text-base font-semibold gap-2">
              {signupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
              Create Account
            </Button>

            {/* Skip */}
            <button onClick={() => navigate("/")} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-1">
              Skip for now
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4 relative" dir={isRTL ? "rtl" : "ltr"}>
      {/* R8-Trust Integrity watermark */}
      <div className="fixed bottom-4 left-4 opacity-10 pointer-events-none select-none z-0">
        <div className="flex items-center gap-1 text-xs font-bold text-primary">
          <Shield className="w-4 h-4" /> R8-Trust Integrity
        </div>
      </div>

      <Card className="w-full max-w-md mx-auto shadow-xl border-0 overflow-hidden">
        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Star className="w-6 h-6 text-primary" />
            </div>
            {prefill ? (
              <>
                <h1 className="text-xl font-bold text-foreground">
                  مرحباً {prefill.first_name}! 👋
                </h1>
                <p className="text-muted-foreground text-sm">
                  كيف كانت تجربتك مع <strong>{prefill.project_name}</strong>?
                </p>
              </>
            ) : (
              <>
                <h1 className="text-xl font-bold text-foreground">Share Your Experience</h1>
                <p className="text-muted-foreground text-sm">رأيك أمانة — Your opinion matters</p>
              </>
            )}
          </div>

          {/* Step 1: Stars */}
          <div className="flex justify-center gap-2">
            {displayStars.map((star) => (
              <button
                key={star}
                type="button"
                className="transition-all duration-200 hover:scale-125 focus:outline-none"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => handleStarClick(star)}
                aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
              >
                <Star
                  className={cn(
                    "w-10 h-10 sm:w-12 sm:h-12 transition-all duration-200",
                    star <= activeRating
                      ? `${getRatingColor(activeRating)} fill-current`
                      : "text-muted-foreground/30"
                  )}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center text-sm font-medium text-muted-foreground">
              {rating === 5 && "⭐ Excellent!"}
              {rating === 4 && "👍 Good!"}
              {rating === 3 && "😐 Average"}
              {rating === 2 && "👎 Below Average"}
              {rating === 1 && "😞 Poor"}
            </p>
          )}

          {/* Step 2: Comment (progressive reveal) */}
          <div
            className={cn(
              "transition-all duration-500 ease-out overflow-hidden",
              step >= 2 ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            )}
          >
            <div className="space-y-3">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={isRTL ? "قبل ما ألاقي R8ESTATE كنت... بعدها اكتشفت إن... ✍️" : "Before R8ESTATE, I was about to... Then I discovered... ✍️"}
                className="min-h-[120px] text-base resize-none"
                maxLength={1000}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{comment.length}/1000</span>
                <div className="flex gap-1">
                  {["👍", "👎", "🏠", "💰", "⚠️"].map((e) => (
                    <button
                      key={e}
                      type="button"
                      className="hover:scale-125 transition-transform text-lg"
                      onClick={() => setComment((p) => p + " " + e)}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name field */}
              {!prefill?.first_name && (
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  dir="auto"
                />
              )}
            </div>
          </div>

          {/* Step 3: Video toggle (progressive reveal) */}
          <div
            className={cn(
              "transition-all duration-500 ease-out overflow-hidden delay-200",
              step >= 2 && comment.length > 0 ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
            )}
          >
            <div className="border rounded-xl p-4 bg-accent/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium">Video Review</span>
                </div>
                <Switch checked={wantsVideo} onCheckedChange={setWantsVideo} />
              </div>
              <p className="text-xs text-muted-foreground">
                Record a 30s video to earn a <strong className="text-accent">Gold Badge 🏅</strong>
              </p>

              {wantsVideo && (
                <div className="space-y-2">
                  {!videoBlob && !recording && (
                    <Button variant="outline" size="sm" onClick={startRecording} className="w-full">
                      <Video className="w-4 h-4 mr-2" /> Start Recording (30s max)
                    </Button>
                  )}
                  {recording && (
                    <Button variant="destructive" size="sm" onClick={stopRecording} className="w-full animate-pulse">
                      ⏹ Stop Recording
                    </Button>
                  )}
                  {videoUrl && (
                    <video src={videoUrl} controls className="w-full rounded-lg max-h-40" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Integrity warning */}
          {integrityWarning && (
            <div className={cn(
              "flex items-start gap-2 rounded-lg p-3 text-sm",
              integrityBlocked ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent-foreground"
            )}>
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{integrityWarning}</span>
            </div>
          )}

          {/* Submit button */}
          <div
            className={cn(
              "transition-all duration-500",
              step >= 2 ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            <Button
              onClick={handleSubmit}
              disabled={submitting || rating === 0 || integrityBlocked}
              className="w-full h-12 text-base font-semibold"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
              ) : (
                "Submit Review ✅"
              )}
            </Button>
          </div>

          {/* Trust footer */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Protected by R8-Trust Integrity</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FrictionlessReview;
