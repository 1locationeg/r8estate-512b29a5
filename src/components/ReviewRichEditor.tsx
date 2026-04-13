import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  ImageIcon,
  Upload,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ReviewRichEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

const ToolbarButton = ({
  active,
  onClick,
  children,
  title,
  disabled,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title: string;
  disabled?: boolean;
}) => (
  <button
    type="button"
    title={title}
    disabled={disabled}
    onClick={onClick}
    className={cn(
      "p-1.5 rounded-md transition-colors",
      active
        ? "bg-primary/15 text-primary"
        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      disabled && "opacity-40 pointer-events-none"
    )}
  >
    {children}
  </button>
);

export const ReviewRichEditor = ({
  content,
  onChange,
  placeholder = "Share your experience…",
  rows = 4,
  className,
}: ReviewRichEditorProps) => {
  const { user } = useAuth();
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        code: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-2 cursor-pointer",
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto my-2",
        },
      }),
      Placeholder.configure({ placeholder: placeholder || "I worked with this company on... / The best part was... / I wish I had known..." }),
    ],
    content: content || "",
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none focus:outline-none",
          "min-h-[calc(var(--row-count)*1.5rem+1rem)]",
          "[&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_img]:rounded-lg [&_img]:max-h-48"
        ),
        style: `--row-count:${rows}` as any,
      },
    },
  });

  // Sync external content changes (e.g. AI enhance sets content)
  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    // Only update if content truly changed from outside
    if (content !== currentHtml && content !== "<p></p>") {
      // If content is plain text (no HTML tags), wrap it
      const isPlainText = !/<[a-z][\s\S]*>/i.test(content);
      editor.commands.setContent(isPlainText ? `<p>${content}</p>` : content);
    }
  }, [content, editor]);

  const addLink = useCallback(() => {
    if (!editor || !linkUrl.trim()) return;
    const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
    setLinkUrl("");
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  const removeLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
  }, [editor]);

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!editor) return;
      if (!file.type.startsWith("image/")) return;
      if (file.size > 5 * 1024 * 1024) return; // 5MB limit

      setIsUploading(true);
      try {
        // Upload to storage if user is authenticated
        if (user) {
          const filePath = `review-images/${user.id}/${Date.now()}-${file.name}`;
          const { error } = await supabase.storage
            .from("review-attachments")
            .upload(filePath, file);
          if (!error) {
            const { data: urlData } = supabase.storage
              .from("review-attachments")
              .getPublicUrl(filePath);
            editor.chain().focus().setImage({ src: urlData.publicUrl }).run();
          }
        } else {
          // For guests, use object URL (temporary)
          const objectUrl = URL.createObjectURL(file);
          editor.chain().focus().setImage({ src: objectUrl }).run();
        }
      } catch (err) {
        console.error("Image upload failed:", err);
      } finally {
        setIsUploading(false);
      }
    },
    [editor, user]
  );

  const handleImageInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleImageUpload(file);
      e.target.value = "";
    },
    [handleImageUpload]
  );

  const addImageFromUrl = useCallback(() => {
    if (!editor) return;
    const url = prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div
      className={cn(
        "rounded-md border border-primary/30 focus-within:border-primary transition-colors bg-background",
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border/50 flex-wrap">
        <ToolbarButton
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="Bullet List"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="Numbered List"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolbarButton>

        <div className="w-px h-4 bg-border mx-1" />

        {/* Link */}
        <ToolbarButton
          title={editor.isActive("link") ? "Remove link" : "Add link"}
          active={editor.isActive("link")}
          onClick={() => {
            if (editor.isActive("link")) {
              removeLink();
            } else {
              setShowLinkInput(!showLinkInput);
              setTimeout(() => linkInputRef.current?.focus(), 100);
            }
          }}
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </ToolbarButton>

        {/* Image upload */}
        <ToolbarButton
          title="Upload image"
          onClick={() => imgInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ImageIcon className="w-3.5 h-3.5" />
          )}
        </ToolbarButton>

        <input
          ref={imgInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageInputChange}
        />
      </div>

      {/* Link input bar */}
      {showLinkInput && (
        <div className="flex items-center gap-2 px-2 py-1.5 border-b border-border/50 bg-secondary/30">
          <LinkIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <input
            ref={linkInputRef}
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addLink();
              }
              if (e.key === "Escape") setShowLinkInput(false);
            }}
            placeholder="https://example.com"
            className="flex-1 text-xs bg-transparent outline-none placeholder:text-muted-foreground/60"
          />
          <button
            type="button"
            onClick={addLink}
            disabled={!linkUrl.trim()}
            className="text-xs font-medium text-primary disabled:opacity-40"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setShowLinkInput(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Editor content */}
      <div className="px-3 py-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

// Helper: extract plain text from HTML for content checks
export const getPlainTextFromHtml = (html: string): string => {
  if (typeof document === "undefined") return html;
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
};
