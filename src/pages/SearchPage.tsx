import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, ArrowLeft, ArrowRight, Sparkles, Mic, X, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchSuggestions } from "@/components/SearchSuggestions";
import { ResearchToolkitPanel } from "@/components/ResearchToolkitPanel";
import { TrustInsightsModal } from "@/components/TrustInsightsModal";
import { WriteReviewModal } from "@/components/WriteReviewModal";
import { CompareModal } from "@/components/CompareModal";
import { type SearchItem } from "@/data/searchIndex";
import { addToSearchHistory } from "@/lib/searchHistory";
import { useSearchPhrases } from "@/hooks/useSearchPhrases";
import { toast } from "sonner";

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [reviewItem, setReviewItem] = useState<SearchItem | null>(null);
  const [compareItem, setCompareItem] = useState<SearchItem | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const trustPhrases = useSearchPhrases();

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  // Auto-start voice search if ?voice=1
  const shouldAutoVoice = searchParams.get("voice") === "1";
  const voiceTriggeredRef = useRef(false);
  useEffect(() => {
    if (!shouldAutoVoice || voiceTriggeredRef.current) return;
    voiceTriggeredRef.current = true;
    // Small delay to let component mount
    const timer = setTimeout(() => {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast.error(t("hero.voiceNotSupported"));
        return;
      }
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = i18n.language === "ar" ? "ar-EG" : "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onresult = (event: any) => {
        setQuery(event.results[0][0].transcript);
        inputRef.current?.focus();
      };
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      setIsListening(true);
      recognition.start();
    }, 300);
    return () => clearTimeout(timer);
  }, [shouldAutoVoice, i18n.language, t]);

  // Placeholder rotation
  useEffect(() => {
    if (query) return;
    const interval = setInterval(() => {
      setPlaceholderVisible(false);
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % trustPhrases.length);
        setPlaceholderVisible(true);
      }, 400);
    }, 3500);
    return () => clearInterval(interval);
  }, [query, trustPhrases.length]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [query]);

  const handleSelect = useCallback((item: SearchItem) => {
    addToSearchHistory(item.name);
    if (item.meta?.dynamicBusinessProfile) {
      navigate(`/entity/${item.id}`);
    } else if (item.category === "developers") {
      navigate(`/entity/${item.id}`);
    } else {
      navigate(`/entity/${item.id}`);
    }
  }, [navigate]);

  const handleCorrection = useCallback((corrected: string) => {
    setQuery(corrected);
    inputRef.current?.focus();
  }, []);

  const handleWriteReview = useCallback((item: SearchItem) => {
    setReviewItem(item);
  }, []);

  const handleCompare = useCallback((item: SearchItem) => {
    setCompareItem(item);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => prev + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(-1, prev - 1));
        break;
      case "Escape":
        navigate(-1);
        break;
    }
  }, [navigate]);

  const handleVoiceSearch = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error(t("hero.voiceNotSupported"));
      return;
    }
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = i18n.language === "ar" ? "ar-EG" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      setQuery(event.results[0][0].transcript);
      inputRef.current?.focus();
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    setIsListening(true);
    recognition.start();
  }, [isListening, i18n.language, t]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-3 md:px-6 pt-3 pb-3 border-b border-border/40 safe-top">
        {/* Home button */}
        <button
          onClick={() => navigate("/")}
          className="shrink-0 p-2.5 rounded-xl hover:bg-muted/60 transition-colors"
          aria-label={t("pageHeader.home", "Home")}
        >
          <Home className="w-5 h-5 text-foreground" />
        </button>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="shrink-0 p-2.5 rounded-xl hover:bg-muted/60 transition-colors"
          aria-label={t("pageHeader.back", "Go back")}
        >
          <BackIcon className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Search input */}
        <div className="flex-1 relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholderVisible ? trustPhrases[placeholderIndex] : ""}
            autoFocus
            className="w-full ps-9 pe-10 py-3 bg-secondary/60 border border-border/60 rounded-xl text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            style={{ fontSize: "16px" }}
          />
          {query && (
            <button
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              className="absolute end-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted/60"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Voice */}
        <button
          onClick={handleVoiceSearch}
          className={cn(
            "shrink-0 p-2.5 rounded-xl transition-all",
            isListening ? "bg-destructive text-destructive-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          )}
        >
          <Mic className="w-5 h-5" />
        </button>

        {/* AI button */}
        <button
          onClick={() => setIsAIModalOpen(true)}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 bg-gradient-to-r from-primary to-primary/85 text-primary-foreground rounded-xl font-medium text-xs md:text-sm whitespace-nowrap hover:from-primary/90 hover:to-primary/80 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">{t("hero.askAI")}</span>
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <SearchSuggestions
            query={query}
            isOpen={true}
            onSelect={handleSelect}
            onCorrection={handleCorrection}
            onWriteReview={handleWriteReview}
            onCompare={handleCompare}
            selectedIndex={selectedIndex}
            className="relative top-auto mt-0 rounded-none border-0 shadow-none max-h-none"
          />
          {!query && (
            <ResearchToolkitPanel
              onClose={() => navigate(-1)}
              onOpenCompare={() => setCompareItem({} as any)}
              onOpenAIAgent={() => setIsAIModalOpen(true)}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <TrustInsightsModal open={isAIModalOpen} onOpenChange={setIsAIModalOpen} />
      <WriteReviewModal
        open={!!reviewItem}
        onOpenChange={(open) => !open && setReviewItem(null)}
        developerName={reviewItem?.name || ""}
        developerId={reviewItem?.id || ""}
      />
      <CompareModal
        item={compareItem}
        open={!!compareItem}
        onClose={() => setCompareItem(null)}
      />
    </div>
  );
};

export default SearchPage;