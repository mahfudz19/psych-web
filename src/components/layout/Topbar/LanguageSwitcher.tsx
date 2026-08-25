import { useTranslation } from "react-i18next";
import Popover from "../../ui/Popover";

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <Popover
      trigger={
        <div className="flex items-center justify-center gap-1.5 p-2 rounded-2xl text-sm font-bold text-text-secondary hover:bg-divider/20 hover:text-primary-main transition-all uppercase">
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
        </div>
      }
    >
      {(close) => (
        <>
          <button
            onClick={() => {
              i18n.changeLanguage("id");
              close();
            }}
            className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-colors ${i18n.language.startsWith("id") ? "text-primary-main bg-primary-main/10 font-bold" : "text-text-secondary hover:bg-divider/20 hover:text-text-primary"}`}
          >
            Indonesia
          </button>
          <button
            onClick={() => {
              i18n.changeLanguage("en");
              close();
            }}
            className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-colors ${i18n.language.startsWith("en") ? "text-primary-main bg-primary-main/10 font-bold" : "text-text-secondary hover:bg-divider/20 hover:text-text-primary"}`}
          >
            English
          </button>
        </>
      )}
    </Popover>
  );
}

export default LanguageSwitcher;
