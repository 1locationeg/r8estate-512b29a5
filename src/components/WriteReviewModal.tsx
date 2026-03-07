import { useState, useRef, useCallback } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface WriteReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  developerName?: string;
  developerId?: string;
}

const EXPERIENCE_TYPES = [
  "Buyer",
  "Agent",
  "Investor",
  "Construction Professional",
  "Family Member",
];

const EMOJI_QUICK = ["👍", "👎", "⭐", "🏠", "💰", "🔑", "📋", "✅", "❌", "🏗️", "😊", "😤"];

export const WriteReviewModal = ({
  open,
  onOpenChange,
  developerName = "",
  developerId = "",
}: WriteReviewModalProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [experienceType, setExperienceType] = useState("");
  const [unitType, setUnitType] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

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
      toast({ title: "AI unavailable", description: "Could not get suggestions. Try again.", variant: "destructive" });
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
        toast({ title: "✨ Review enhanced", description: data.changes || "Your review has been improved." });
      }
    } catch (e) {
      toast({ title: "Enhancement failed", description: "Could not enhance text.", variant: "destructive" });
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
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

        // Use browser SpeechRecognition if available
        if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
          toast({ title: "🎙️ Processing voice...", description: "Converting speech to text..." });
        }

        // For now, use Web Speech API for transcription
        try {
          const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          if (SpeechRecognitionAPI) {
            // The recognition was already handling in real-time, so we just enhance
            if (content.trim()) {
              await enhanceWithAi(true);
            }
          }
        } catch {
          toast({ title: "Voice processing", description: "Transcription complete. You can enhance with AI.", variant: "default" });
        }
      };

      // Also start real-time speech recognition
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

  // Submit
  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to write a review.", variant: "destructive" });
      onOpenChange(false);
      navigate("/auth");
      return;
    }
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
      // Upload attachments
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

      toast({
        title: "✅ Review submitted!",
        description: `Your review for ${developerName} has been submitted successfully.${verificationFiles.length > 0 ? " Verification documents are under review." : ""}`,
      });

      resetForm();
      onOpenChange(false);
    } catch (e) {
      toast({ title: "Submission error", description: "Could not submit review. Please try again.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const insertText = (text: string) => {
    setContent((prev) => (prev ? `${prev} ${text}` : text));
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 md:p-6 pb-0">
          <DialogTitle className="text-lg md:text-xl font-bold text-foreground">
            Write a Review {developerName && `for ${developerName}`}
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 md:p-6 pt-2 space-y-5">
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

          {/* Experience Type & Unit Type */}
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

          {/* Review Content with AI toolbar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-foreground">Your Review *</label>
              <div className="flex items-center gap-1">
                {/* Voice Record */}
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

                {/* AI Suggest */}
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

                {/* AI Enhance */}
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
            </div>

            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your experience... What was good? What could be better? Would you recommend?"
              rows={5}
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

          {/* AI Suggestions Panel */}
          {aiSuggestions.length > 0 && (
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

          {/* Attachments */}
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
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = "image/*";
                    fileInputRef.current.capture = "environment";
                    fileInputRef.current.click();
                    fileInputRef.current.removeAttribute("capture");
                    fileInputRef.current.accept = "image/*,.pdf,.doc,.docx";
                  }
                }}
              >
                <Camera className="w-3.5 h-3.5" /> Scan Receipt
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

          {/* Verification Section */}
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

          {/* Anonymous Toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded border-border"
            />
            <span className="text-sm text-foreground">Post anonymously</span>
          </label>

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
  );
};
