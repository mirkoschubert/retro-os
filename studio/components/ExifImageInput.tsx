import { useEffect, useRef, useCallback } from 'react';
import { useDocumentOperation, useFormValue } from 'sanity';
import type { ImageInputProps } from 'sanity';
import exifr from 'exifr';

function formatShutter(v: number): string {
  if (v >= 1) return `${v}s`;
  return `1/${Math.round(1 / v)}`;
}

function formatAperture(v: number): string {
  return `f/${v.toFixed(1).replace(/\.0$/, '')}`;
}

function formatExifDate(v: unknown): string {
  const d = v instanceof Date ? v : new Date(v as string);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

export function ExifImageInput(props: ImageInputProps) {
  const { renderDefault } = props;
  const containerRef = useRef<HTMLDivElement>(null);

  const rawId = useFormValue(['_id']) as string | undefined;
  const docType = useFormValue(['_type']) as string | undefined;
  // Strip draft prefix so useDocumentOperation works on both new and published docs
  const docId = rawId?.replace(/^drafts\./, '') ?? '';
  const { patch } = useDocumentOperation(docId, docType ?? 'photo');

  const handleFile = useCallback(async (file: File) => {
    try {
      const raw = await exifr.parse(file, {
        pick: ['Make', 'Model', 'LensModel', 'ISO', 'ExposureTime', 'FNumber', 'DateTimeOriginal'],
      }) as Record<string, unknown> | null;

      if (!raw) return;

      const updates: Record<string, unknown> = {};
      const camera = [raw.Make, raw.Model].filter(Boolean).join(' ').trim();
      if (camera) updates.camera = camera;
      if (raw.LensModel) updates.lens = String(raw.LensModel);
      if (raw.ISO != null) updates.iso = Number(raw.ISO);
      if (raw.ExposureTime != null) updates.shutter = formatShutter(raw.ExposureTime as number);
      if (raw.FNumber != null) updates.aperture = formatAperture(raw.FNumber as number);
      if (raw.DateTimeOriginal) updates.date = formatExifDate(raw.DateTimeOriginal);

      if (Object.keys(updates).length > 0) {
        patch.execute([{ set: updates }]);
        console.log('[ExifImageInput] EXIF written:', updates);
      }
    } catch (err) {
      console.error('[ExifImageInput] EXIF parse error:', err);
    }
  }, [patch]);

  // Intercept file selection from Sanity's own upload input
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function onCapture(e: Event) {
      const input = e.target as HTMLInputElement;
      if (input.tagName !== 'INPUT' || input.type !== 'file') return;
      const file = input.files?.[0];
      if (file) handleFile(file);
    }

    container.addEventListener('change', onCapture, { capture: true });
    return () => container.removeEventListener('change', onCapture, { capture: true });
  }, [handleFile]);

  return (
    <div ref={containerRef}>
      {renderDefault(props)}
    </div>
  );
}
