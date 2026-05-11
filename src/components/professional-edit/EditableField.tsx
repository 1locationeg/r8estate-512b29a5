import { useState, useRef, useEffect } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface EditableFieldProps {
  value: string;
  onSave: (next: string) => void | Promise<void>;
  multiline?: boolean;
  placeholder?: string;
  label?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps any text node and overlays a small pencil button (top-end) when
 * `EditableProvider` says we're the owner. Click → inline editor.
 */
export function EditableField({
  value,
  onSave,
  multiline,
  placeholder,
  label,
  children,
  className,
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(value);
      setTimeout(() => ref.current?.focus(), 0);
    }
  }, [editing, value]);

  const commit = async () => {
    await onSave(draft.trim());
    setEditing(false);
  };

  if (editing) {
    return (
      <div className={cn('space-y-2', className)}>
        {label && <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{label}</p>}
        {multiline ? (
          <Textarea
            ref={ref as React.RefObject<HTMLTextAreaElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            rows={5}
          />
        ) : (
          <Input
            ref={ref as React.RefObject<HTMLInputElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
          />
        )}
        <div className="flex gap-2">
          <Button size="sm" onClick={commit} className="gap-1 h-8">
            <Check className="w-3.5 h-3.5" /> Save
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="gap-1 h-8">
            <X className="w-3.5 h-3.5" /> Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('group relative inline-block', className)}>
      {children}
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="absolute -top-2 -end-7 inline-flex items-center justify-center w-6 h-6 rounded-full bg-[hsl(var(--professionals))] text-[hsl(var(--professionals-foreground))] shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        title={label ? `Edit ${label.toLowerCase()}` : 'Edit'}
      >
        <Pencil className="w-3 h-3" />
      </button>
    </div>
  );
}