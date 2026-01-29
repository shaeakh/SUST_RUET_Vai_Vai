"use client"

import type { LanguageId, LanguageOption } from "@/types/code"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LANGUAGE_OPTIONS } from "@/lib/mock-data"

interface LanguageSelectorProps {
  value: LanguageId
  onValueChange: (value: LanguageId) => void
}

export function LanguageSelector({
  value,
  onValueChange,
}: LanguageSelectorProps) {
  return (
    <Select
      value={value}
      onValueChange={(newValue) => {
        if (newValue) {
          onValueChange(newValue as LanguageId)
        }
      }}
    >
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGE_OPTIONS.map((lang) => (
          <SelectItem key={lang.id} value={lang.id}>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
