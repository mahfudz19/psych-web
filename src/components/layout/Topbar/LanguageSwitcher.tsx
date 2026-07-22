import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsLangOpen(false);
  };

  return (
    <div className="relative" ref={langRef}>
      <button
        onClick={() => setIsLangOpen(!isLangOpen)}
        className="flex items-center gap-1.5 p-2 rounded-lg text-sm font-bold text-text-secondary hover:bg-divider/20 hover:text-primary-main focus:outline-none transition-all uppercase"
        aria-label="Ganti Bahasa"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          />
        </svg>
        <span>{i18n.language.substring(0, 2)}</span>
      </button>

      {isLangOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-bg-paper rounded-xl shadow-lg border border-divider py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => changeLanguage("id")}
            className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${i18n.language.startsWith("id") ? "text-primary-main bg-primary-main/10 font-bold" : "text-text-secondary hover:bg-divider/20"}`}
          >
            Indonesia
          </button>
          <button
            onClick={() => changeLanguage("en")}
            className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${i18n.language.startsWith("en") ? "text-primary-main bg-primary-main/10 font-bold" : "text-text-secondary hover:bg-divider/20"}`}
          >
            English
          </button>
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;
