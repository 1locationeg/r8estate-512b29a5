import { useCallback, useEffect, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { useTranslation } from 'react-i18next';
import { Loader2, ZoomIn, ZoomOut, RotateCw, Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

/**
 * Renders a crop / zoom / rotate editor for the Trust Page cover image.
 * Output is forced to the hero aspect ratio (16:6) at 1600×600 px so the
 * upload stays sharp without bloating storage.
 */
export const COVER_OUTPUT_W = 1600;
export const COVER_OUTPUT_H = 600;
const ASPECT = COVER_OUTPUT_W / COVER_OUTPUT_H;

interface CoverCropperModalProps {
  open: boolean;
  file: File | null;
  busy: boolean;
  onCancel: () => void;
  onConfirm: (file: File) => Promise<void> | void;
}

export function CoverCropperModal({ open, file, busy, onCancel, onConfirm }: CoverCropperModalProps) {
  const { t } = useTranslation();
  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pixels, setPixels] = useState<Area | null>(null);

  useEffect(() => {
    if (!file) {
      setSrc(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setSrc(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onComplete = useCallback((_: Area, areaPixels: Area) => setPixels(areaPixels), []);

  const handleConfirm = async () => {
    if (!src || !pixels) return;
    const blob = await renderCroppedImage(src, pixels, rotation);
    if (!blob) return;
    const out = new File([blob], `cover-${Date.now()}.jpg`, { type: 'image/jpeg' });
    await onConfirm(out);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !busy && onCancel()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="px-4 md:px-6 pt-4 pb-2">
          <DialogTitle className="text-base font-bold">
            {t('professional.profile.cover.editor_title')}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            {t('professional.profile.cover.recommended', { w: COVER_OUTPUT_W, h: COVER_OUTPUT_H })}
          </p>
        </DialogHeader>

        <div className="relative w-full h-[40vh] sm:h-[50vh] bg-muted">
          {src && (
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={ASPECT}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onComplete}
              showGrid
              objectFit="contain"
            />
          )}
        </div>

        <div className="px-4 md:px-6 py-3 space-y-3 border-t border-border bg-card">
          <div className="flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-muted-foreground shrink-0" />
            <Slider
              value={[zoom]}
              min={1}
              max={4}
              step={0.05}
              onValueChange={(v) => setZoom(v[0])}
              aria-label={t('professional.profile.cover.zoom')}
              className="flex-1"
            />
            <ZoomIn className="w-4 h-4 text-muted-foreground shrink-0" />
            <button
              type="button"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="ms-1 inline-flex items-center justify-center w-9 h-9 rounded-full border border-border hover:bg-muted transition-colors"
              aria-label={t('professional.profile.cover.rotate')}
              title={t('professional.profile.cover.rotate')}
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={onCancel} disabled={busy} className="gap-1">
              <X className="w-4 h-4" /> {t('professional.profile.cover.cancel')}
            </Button>
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={busy || !pixels}
              className="gap-1 bg-[hsl(var(--professionals))] hover:bg-[hsl(var(--professionals)/0.9)] text-[hsl(var(--professionals-foreground))]"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {busy ? t('professional.profile.cover.uploading') : t('professional.profile.cover.apply')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function renderCroppedImage(src: string, area: Area, rotation: number): Promise<Blob | null> {
  const img = await loadImage(src);
  const rad = (rotation * Math.PI) / 180;

  // Bounding box of the rotated image (used to position the source draw)
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));
  const bBoxW = img.width * cos + img.height * sin;
  const bBoxH = img.width * sin + img.height * cos;

  // 1) Draw the rotated source onto an intermediate canvas.
  const tmp = document.createElement('canvas');
  tmp.width = bBoxW;
  tmp.height = bBoxH;
  const tctx = tmp.getContext('2d');
  if (!tctx) return null;
  tctx.translate(bBoxW / 2, bBoxH / 2);
  tctx.rotate(rad);
  tctx.drawImage(img, -img.width / 2, -img.height / 2);

  // 2) Slice the crop area then resize down to the canonical cover size.
  const out = document.createElement('canvas');
  out.width = COVER_OUTPUT_W;
  out.height = COVER_OUTPUT_H;
  const octx = out.getContext('2d');
  if (!octx) return null;
  octx.drawImage(
    tmp,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    COVER_OUTPUT_W,
    COVER_OUTPUT_H,
  );

  return new Promise((resolve) => out.toBlob((b) => resolve(b), 'image/jpeg', 0.9));
}