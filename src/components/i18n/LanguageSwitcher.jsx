import React from "react";
import { useI18n } from "./I18nContext";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function LanguageSwitcher() {
  const { lang, setLang, currentLang, LANGUAGES } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2 text-gray-400 hover:text-white px-3 border border-[var(--border-dim)] rounded-xl"
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="text-sm">{currentLang?.flag}</span>
          <span className="text-xs hidden sm:block">{currentLang?.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto w-48">
        {LANGUAGES.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => setLang(l.code)}
            className={`flex items-center gap-2 ${lang === l.code ? "bg-violet-500/10 text-violet-400" : ""}`}
          >
            <span>{l.flag}</span>
            <span className="text-sm">{l.name}</span>
            {lang === l.code && <span className="ml-auto text-violet-400 text-xs">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}