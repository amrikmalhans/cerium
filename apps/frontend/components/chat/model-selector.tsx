"use client";

import { Select } from "@/components/ui/select";

const OPENAI_MODELS = [
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-4", label: "GPT-4" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
];

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-48"
    >
      {OPENAI_MODELS.map((model) => (
        <option key={model.value} value={model.value}>
          {model.label}
        </option>
      ))}
    </Select>
  );
}

