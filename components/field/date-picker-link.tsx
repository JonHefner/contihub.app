"use client";

import { useRouter } from "next/navigation";

export function DatePickerLink({ defaultDate, fieldBase }: { defaultDate: string; fieldBase: string }) {
  const router = useRouter();

  return (
    <label className="mt-3 flex h-11 items-center justify-between gap-3 rounded-xl bg-field-surface px-3 text-sm field-shadow">
      <span className="shrink-0 font-medium text-field-ink">File another date</span>
      <input
        type="date"
        defaultValue={defaultDate}
        aria-label="Choose date for a new daily log"
        className="h-9 min-w-0 rounded-md bg-field-chip px-2 text-field-ink"
        onChange={(event) => {
          const value = event.target.value;
          if (value) {
            router.push(`${fieldBase}/log/${value}`);
          }
        }}
      />
    </label>
  );
}
