import { useTranslation } from "react-i18next";

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    const checkbox = document.getElementById("lang-toggle") as HTMLInputElement;
    if (checkbox) checkbox.checked = false;
  };

  return (
    <div className="relative">
      <input type="checkbox" id="lang-toggle" className="peer hidden" />

      <label
        htmlFor="lang-toggle"
        className="fixed inset-0 z-40 hidden peer-checked:block"
        aria-hidden="true"
      ></label>

      <label
        htmlFor="lang-toggle"
        className="cursor-pointer relative z-30 flex items-center justify-center gap-1.5 p-2 rounded-xl text-sm font-bold text-text-secondary hover:bg-divider/20 hover:text-primary-main peer-checked:bg-divider/20 peer-checked:text-primary-main transition-all uppercase"
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
      </label>

      <div className="absolute right-0 mt-2 w-36 bg-bg-paper rounded-2xl shadow-xl border border-divider p-1.5 z-50 origin-top-right transition-all duration-200 ease-out scale-95 opacity-0 invisible peer-checked:scale-100 peer-checked:opacity-100 peer-checked:visible">
        <button
          onClick={() => changeLanguage("id")}
          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            i18n.language.startsWith("id")
              ? "text-primary-main bg-primary-main/10 font-bold"
              : "text-text-secondary hover:bg-divider/20 hover:text-text-primary"
          }`}
        >
          Indonesia
        </button>
        <button
          onClick={() => changeLanguage("en")}
          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            i18n.language.startsWith("en")
              ? "text-primary-main bg-primary-main/10 font-bold"
              : "text-text-secondary hover:bg-divider/20 hover:text-text-primary"
          }`}
        >
          English
        </button>
      </div>
    </div>
  );
}

export default LanguageSwitcher;
