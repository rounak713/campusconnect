import React, { useRef, useState } from 'react';
import { FileCheck2, ShieldCheck, Trash2, UploadCloud } from 'lucide-react';

const MAX_SIZE_MB = 5;
const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];

interface IdCardDropzoneProps {
  onUploaded: (fileName: string) => void;
  onSubmitted: () => void;
}

export const IdCardDropzone: React.FC<IdCardDropzoneProps> = ({ onUploaded, onSubmitted }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const accept = (picked: File | undefined) => {
    if (!picked) return;
    if (!ACCEPTED.includes(picked.type)) {
      setError('Upload a PNG, JPG, WEBP or PDF of your college ID');
      return;
    }
    if (picked.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_SIZE_MB} MB`);
      return;
    }
    setError('');
    setFile(picked);
    onUploaded(picked.name);
  };

  const submit = () => {
    if (!file) {
      setError('Attach your student ID card first');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitted();
    }, 1100);
  };

  return (
    <div className="space-y-4 animate-fade-up">
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => { e.preventDefault(); setIsDragging(false); accept(e.dataTransfer.files?.[0]); }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-3xl border-2 border-dashed px-5 py-8 text-center transition-all duration-200 ${
          isDragging
            ? 'border-[#8B5CF6] bg-[#8B5CF6]/10'
            : file
              ? 'border-[#10B981]/45 bg-[#10B981]/[0.07]'
              : 'border-white/15 bg-[#0E1528] hover:border-[#8B5CF6]/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          className="hidden"
          onChange={e => accept(e.target.files?.[0])}
        />
        {file ? (
          <div className="flex flex-col items-center gap-2">
            <FileCheck2 className="w-8 h-8 text-[#10B981]" strokeWidth={1.6} />
            <p className="text-sm font-semibold text-white truncate max-w-[220px]">{file.name}</p>
            <p className="text-[11px] text-slate-400">{(file.size / 1024).toFixed(0)} KB · ready to submit</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <UploadCloud className="w-8 h-8 text-[#8B5CF6]" strokeWidth={1.6} />
            <p className="text-sm font-semibold text-white">Drop your College ID card</p>
            <p className="text-[11px] text-slate-400">PNG, JPG or PDF · up to {MAX_SIZE_MB} MB</p>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-rose-400">{error}</p>}

      {file && (
        <button
          onClick={e => { e.stopPropagation(); setFile(null); }}
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-rose-400 transition-colors"
        >
          <Trash2 className="w-3 h-3" /> Remove file
        </button>
      )}

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Your ID is encrypted at rest, reviewed by moderators within 6 hours, and deleted right after approval.
        </p>
      </div>

      <button
        onClick={submit}
        disabled={isSubmitting}
        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(139,92,246,0.28)] transition-transform active:scale-[0.98] disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-white/25 border-t-white animate-spin" />
            Submitting for review…
          </>
        ) : (
          'Submit ID for verification'
        )}
      </button>
    </div>
  );
};
