import { useState, useEffect, useCallback, useRef } from "react";
import { developers } from "@/data/mockData";

interface Props {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  body: string;
  onInsertMention: (devName: string, startPos: number, queryLen: number) => void;
}

export function DeveloperMentionSuggestions({ textareaRef, body, onInsertMention }: Props) {
  const [suggestions, setSuggestions] = useState<typeof developers>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [mentionStart, setMentionStart] = useState(-1);
  const [query, setQuery] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  // Detect @mention query from cursor position
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleInput = () => {
      const cursorPos = textarea.selectionStart;
      const textBefore = body.substring(0, cursorPos);
      const atIdx = textBefore.lastIndexOf("@");

      if (atIdx === -1 || (atIdx > 0 && /\S/.test(textBefore[atIdx - 1]))) {
        setSuggestions([]);
        return;
      }

      const partial = textBefore.substring(atIdx + 1);
      if (partial.includes(" ") && partial.includes(" ") && partial.split(" ").length > 2) {
        setSuggestions([]);
        return;
      }

      if (!partial && atIdx >= 0) {
        // Show all devs when just typed @
        setSuggestions(developers.slice(0, 6));
        setMentionStart(atIdx);
        setQuery(partial);
        setSelectedIdx(0);
        return;
      }

      const lower = partial.toLowerCase();
      const matches = developers.filter(d => {
        const name = d.name.toLowerCase();
        const id = d.id.toLowerCase();
        return name.includes(lower) || id.includes(lower) ||
          id.replace(/-/g, " ").includes(lower);
      }).slice(0, 6);

      setSuggestions(matches);
      setMentionStart(atIdx);
      setQuery(partial);
      setSelectedIdx(0);
    };

    // Run on body change
    handleInput();
  }, [body, textareaRef]);

  // Keyboard navigation
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || suggestions.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (suggestions.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx(prev => Math.min(prev + 1, suggestions.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx(prev => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && suggestions.length > 0) {
        e.preventDefault();
        selectDeveloper(suggestions[selectedIdx]);
      } else if (e.key === "Escape") {
        setSuggestions([]);
      }
    };

    textarea.addEventListener("keydown", handleKeyDown);
    return () => textarea.removeEventListener("keydown", handleKeyDown);
  }, [suggestions, selectedIdx, textareaRef]);

  const selectDeveloper = useCallback((dev: typeof developers[0]) => {
    onInsertMention(dev.name, mentionStart, query.length + 1); // +1 for @
    setSuggestions([]);
  }, [mentionStart, query, onInsertMention]);

  if (suggestions.length === 0) return null;

  return (
    <div
      ref={listRef}
      className="absolute z-50 bottom-full mb-1 left-0 right-0 max-h-48 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg"
    >
      {suggestions.map((dev, idx) => (
        <button
          key={dev.id}
          onMouseDown={(e) => {
            e.preventDefault();
            selectDeveloper(dev);
          }}
          className={`flex items-center gap-2 w-full px-3 py-2 text-start text-sm transition-colors ${
            idx === selectedIdx ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
          }`}
        >
          <img
            src={dev.logo}
            alt={dev.name}
            className="w-6 h-6 rounded object-contain bg-background p-0.5"
          />
          <span className="truncate font-medium">{dev.name}</span>
          <span className="text-xs text-muted-foreground ms-auto">@{dev.id}</span>
        </button>
      ))}
    </div>
  );
}
