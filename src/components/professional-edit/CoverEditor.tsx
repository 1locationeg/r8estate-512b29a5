import { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CoverCropperModal } from './CoverCropperModal';

interface CoverEditorProps {
  onUpload: (file: File) => Promise<void>;
}

export function CoverEditor({ onUpload }: CoverEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<File | null>(null);
  const { t } = useTranslation();

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPending(file);
    e.target.value = '';
  };

  const confirmCrop = async (cropped: File) => {
    setBusy(true);
    try {
      await onUpload(cropped);
      setPending(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handle} />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="absolute top-3 end-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md border border-border text-xs font-semibold text-foreground hover:bg-background transition-colors shadow-lg z-10 min-h-[36px]"
      >
        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
        {busy ? t('professional.profile.cover.uploading') : t('professional.profile.cover.edit')}
      </button>
      <CoverCropperModal
        open={!!pending}
        file={pending}
        busy={busy}
        onCancel={() => setPending(null)}
        onConfirm={confirmCrop}
      />
    </>
  );
}