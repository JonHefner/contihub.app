export function isSampleText(value: string) {
  return /\bsample\b/i.test(value);
}

export function SampleBadge({ text }: { text: string }) {
  if (!isSampleText(text)) {
    return null;
  }
  return (
    <span className="rounded-sm bg-gold/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold">
      SAMPLE
    </span>
  );
}
