import { useRef, useState } from 'react';
import { Camera, Loader2, Crop, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CoverCropperModal } from './CoverCropperModal';
import type { CoverCropState } from '@/hooks/useProfessionalPage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CoverEditorProps {
  onUpload: (
    croppedFile: File,
    opts: { sourceFile?: File | null; crop: CoverCropState },
  ) => Promise<void>;
  sourceUrl?: string | null;
  initialCrop?: CoverCropState | null;
}

export function CoverEditor({ onUpload, sourceUrl, initialCrop }: CoverEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<File | null>(null);
  const [editingExisting, setEditingExisting] = useState(false);
  const { t } = useTranslation();

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPending(file);
    setEditingExisting(false);
    e.target.value = '';
  };

  const confirmCrop = async (cropped: File, crop: CoverCropState) => {
    setBusy(true);
    try {
      await onUpload(cropped, {
        sourceFile: editingExisting ? null : pending,
        crop,
      });
      setPending(null);
      setEditingExisting(false);
    } finally {
      setBusy(false);
    }
  };

  const canReedit = !!sourceUrl;
  const open = !!pending || editingExisting;

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handle} />
      {canReedit ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              disabled={busy}
              className="absolute top-3 end-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md border border-border text-xs font-semibold text-foreground hover:bg-background transition-colors shadow-lg z-10 min-h-[36px]"
              title="Re-crop your saved cover, or upload a new one (1600 × 600 px, 8:3)"
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              {busy ? t('professional.profile.cover.uploading') : t('professional.profile.cover.edit')}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-50">
            <DropdownMenuItem onClick={() => setEditingExisting(true)} className="gap-2">
              <Crop className="w-4 h-4" /> Re-crop existing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => inputRef.current?.click()} className="gap-2">
              <Upload className="w-4 h-4" /> Replace photo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="absolute top-3 end-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md border border-border text-xs font-semibold text-foreground hover:bg-background transition-colors shadow-lg z-10 min-h-[36px]"
          title="Upload, crop, zoom, rotate and reposition your cover (1600 × 600 px, 8:3)"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
          {busy ? t('professional.profile.cover.uploading') : t('professional.profile.cover.edit')}
        </button>
      )}
      <CoverCropperModal
        open={open}
        file={pending}
        sourceUrl={editingExisting ? sourceUrl ?? null : null}
        initialCrop={initialCrop ?? null}
        busy={busy}
        onCancel={() => {
          setPending(null);
          setEditingExisting(false);
        }}
        onConfirm={confirmCrop}
      />
    </>
  );
}