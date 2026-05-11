import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { CustomSection } from '@/hooks/useProfessionalPage';

interface CustomSectionsProps {
  sections: CustomSection[];
  isOwner: boolean;
  onUpsert: (s: CustomSection) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

export function CustomSections({ sections, isOwner, onUpsert, onRemove }: CustomSectionsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CustomSection | null>(null);

  const startNew = () => {
    const s: CustomSection = {
      id: crypto.randomUUID(),
      title: '',
      body: '',
      order: sections.length,
    };
    setDraft(s);
    setEditingId(s.id);
  };

  const startEdit = (s: CustomSection) => {
    setDraft({ ...s });
    setEditingId(s.id);
  };

  const cancel = () => {
    setDraft(null);
    setEditingId(null);
  };

  const commit = async () => {
    if (!draft) return;
    if (!draft.title.trim()) return;
    await onUpsert(draft);
    cancel();
  };

  // Render the draft section in-place (either new at end, or replacing existing)
  const list = (() => {
    if (!draft) return sections;
    if (sections.some((s) => s.id === draft.id)) {
      return sections.map((s) => (s.id === draft.id ? draft : s));
    }
    return [...sections, draft];
  })();

  return (
    <>
      {list.map((s) => {
        const isEditing = editingId === s.id;
        return (
          <section
            key={s.id}
            className="bg-card border border-border rounded-xl p-5 relative"
          >
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[hsl(var(--professionals))]" />
                  <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                    Custom section
                  </span>
                </div>
                <Input
                  value={draft?.title ?? ''}
                  onChange={(e) => draft && setDraft({ ...draft, title: e.target.value })}
                  placeholder="Section title (e.g. Awards, Press, Video tour)"
                  className="font-bold"
                />
                <Textarea
                  value={draft?.body ?? ''}
                  onChange={(e) => draft && setDraft({ ...draft, body: e.target.value })}
                  placeholder="Tell buyers what makes this special…"
                  rows={6}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={commit} disabled={!draft?.title.trim()} className="gap-1 h-8">
                    <Check className="w-3.5 h-3.5" /> Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancel} className="gap-1 h-8">
                    <X className="w-3.5 h-3.5" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">{s.title}</h2>
                  {isOwner && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEdit(s)}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Edit section"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onRemove(s.id)}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete section"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{s.body}</p>
              </>
            )}
          </section>
        );
      })}

      {isOwner && !editingId && (
        <button
          onClick={startNew}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed border-border hover:border-[hsl(var(--professionals)/0.5)] hover:bg-[hsl(var(--professionals)/0.04)] transition-colors text-sm font-semibold text-muted-foreground hover:text-[hsl(var(--professionals))]"
        >
          <Plus className="w-4 h-4" /> Add a section
        </button>
      )}
    </>
  );
}