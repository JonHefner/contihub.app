"use client";

import { GROUND_OPTIONS, WEATHER_OPTIONS } from "@/lib/field/constants";
import { CloudRainIcon, SunIcon } from "@/components/field/icons";

function WeatherIcon({ value, className }: { value: string; className?: string }) {
  if (value === "Rain" || value === "Snow" || value === "Overcast" || value === "Fog") {
    return <CloudRainIcon className={className} />;
  }
  return <SunIcon className={className} />;
}

export function WeatherPicks({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-field-muted">
        {label}
      </label>
      <input type="hidden" name={name} value={value} />
      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
        {WEATHER_OPTIONS.map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-md px-1 py-2 text-center ${
                selected
                  ? "bg-field-primary text-field-primary-fg"
                  : "bg-field-surface-2 text-field-ink field-shadow"
              }`}
            >
              <WeatherIcon value={option} className="size-5" />
              <span className="text-[0.65rem] font-semibold leading-tight tracking-wide">{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function GroundPicks({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-field-muted">
        Ground
      </label>
      <input type="hidden" name="ground" value={value} />
      <div className="flex flex-wrap gap-1.5">
        {GROUND_OPTIONS.map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                selected
                  ? "bg-field-primary text-field-primary-fg"
                  : "bg-field-surface-2 text-field-ink field-shadow"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
