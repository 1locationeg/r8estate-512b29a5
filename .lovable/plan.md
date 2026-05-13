## Goal

Persist the user's cover crop / zoom / rotation / position so the cover renders identically after refresh, and re-opening "Edit cover" restores the same source image with all sliders/handles where the user left them — no need to re-upload the original.

## Current behavior (the gap)

`CoverCropperModal` bakes crop+zoom+rotation into a flat 1600×600 JPEG and uploads only that. The original image and the crop math are lost. So a follow-up edit forces the user to pick a new file from disk and start from `zoom=1, rotation=0, crop=center`.

## Plan

### 1. Schema (migration)

Add to `professional_pages`:
- `cover_source_url text` — the original (uncropped) upload, kept around for re-editing
- `cover_crop jsonb` — `{ x, y, zoom, rotation, areaPixels: { x, y, width, height } }`

`cover_url` continues to hold the rendered/baked 1600×600 used everywhere downstream (entity cards, OG previews, sharing) — so existing consumers don't change.

### 2. Upload flow

`useProfessionalPage.uploadCover` becomes two-step:
1. Upload the **original** file to `professional-covers/<uid>/source-<ts>.<ext>` → save URL to `cover_source_url`.
2. Upload the **cropped** render to `professional-covers/<uid>/cover-<ts>.jpg` → save URL to `cover_url`.
3. Save `cover_crop` JSON.

Add a second helper `saveCoverCrop({ croppedFile, crop })` for re-crop edits that don't change the source.

### 3. CoverCropperModal

- Accept either a `File` (new upload) **or** a `sourceUrl` (re-edit) plus optional `initialCrop`.
- Initialize `crop`, `zoom`, `rotation` from `initialCrop` when present (instead of always resetting).
- On confirm, return both the rendered `File` and the `{ x, y, zoom, rotation, areaPixels }` snapshot.

### 4. CoverEditor

- Two entry paths:
  - **Upload new** (file picker, today's flow) — uploads source + cropped + crop state.
  - **Re-edit existing** — opens the cropper directly against `cover_source_url` with `cover_crop` preloaded; saves new cropped + crop state, no source re-upload.
- Both surface from the same "Edit cover" pill: if `cover_source_url` exists, open the cropper immediately on a small menu ("Re-crop existing" / "Replace photo"); otherwise behave like today.

### 5. Display

`ProfessionalProfile` already uses `cover_url` for the rendered image — no change needed for visual consistency. Crop persistence is purely about the editor restoring state.

## Files touched

**New**
- `supabase/migrations/<ts>_professional_pages_cover_crop.sql`

**Edited**
- `src/hooks/useProfessionalPage.ts` — extend `ProfessionalPageData`, split `uploadCover` into source+cropped, add `saveCoverCrop`.
- `src/components/professional-edit/CoverCropperModal.tsx` — accept `sourceUrl` + `initialCrop`, return crop snapshot on confirm.
- `src/components/professional-edit/CoverEditor.tsx` — add re-edit path against existing `cover_source_url`.

## Caveats

- Old professionals (no `cover_source_url` yet) will still need to re-upload once to seed it; thereafter the crop persists.
- Source files are only read by the editor (not embedded in the page), so they don't impact load performance.
