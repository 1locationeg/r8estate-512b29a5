// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Shield, Video, Award, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
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

  /* ─── claim badge ─── */
  const handleClaimBadge = () => {
    localStorage.setItem("r8_pending_claim_review", "true");
    navigate("/auth");
  };

  /* ─── render stars (RTL-aware) ─── */
  const stars = [1, 2, 3, 4, 5];
  const displayStars = isRTL ? [...stars].reverse() : stars;
  const activeRating = hoverRating || rating;

  if (submitted) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-4 relative">
        {/* Integrity watermark */}
        <div className="fixed bottom-4 left-4 opacity-10 pointer-events-none select-none">
          <div className="flex items-center gap-1 text-xs font-bold text-primary">
            <Shield className="w-4 h-4" /> R8-Trust Integrity
          </div>
        </div>
        <Card className="w-full max-w-md mx-auto shadow-xl border-0">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">شكراً لك! Thank You!</h2>
            <p className="text-muted-foreground">Your honest review helps the community make better decisions.</p>
            <div className="border rounded-xl p-4 bg-accent/10 space-y-3">
              <Award className="w-8 h-8 text-accent mx-auto" />
              <h3 className="font-semibold text-foreground">Claim your Verified Buyer Badge 🏅</h3>
              <p className="text-sm text-muted-foreground">Sign up to earn a badge and track your impact on the community.</p>
              <Button onClick={handleClaimBadge} className="w-full">
                Claim Badge & Sign Up
              </Button>
            </div>
            <button onClick={() => navigate("/")} className="text-sm text-primary underline underline-offset-4">
              Continue browsing →
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
                placeholder="كلمة حق تفرق.. رأيك أمانة ✍️"
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
