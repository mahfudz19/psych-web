import { useTranslation } from "react-i18next";
import Menu from "../../../components/ui/Menu";
import Button from "../../ui/Button";
import MenuItem from "../../ui/Menu/MenuItem";
import Skeleton from "../../ui/Skeleton";

const LANGUAGES = [
  { code: "id", label: "Indonesia", flag: "🇮🇩" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const activeLang =
    LANGUAGES.find((lang) => i18n.language.startsWith(lang.code)) ||
    LANGUAGES[0];

  return (
    <Menu
      position="bottom-right"
      skeleton={
        <Skeleton height={46.28} className="w-16 sm:w-16" variant="rounded" />
      }
      widthClass="w-44"
      trigger={
        <Button
          size="sm"
          variant="text"
          startIcon={
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
          }
          className="text-sm"
        >
          <span>{activeLang.code}</span>
        </Button>
      }
    >
      {(close) => (
        <div className="flex flex-col gap-1 p-1">
          {LANGUAGES.map((lang) => {
            const isActive = i18n.language.startsWith(lang.code);

            return (
              <MenuItem
                key={lang.code}
                iconStart={
                  <span className="text-xl leading-none">{lang.flag}</span>
                }
                iconEnd={
                  isActive ? (
                    <svg
                      className="w-4 h-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : undefined
                }
                onClick={() => {
                  i18n.changeLanguage(lang.code);
                  close();
                }}
                active={isActive}
              >
                {lang.label}
              </MenuItem>
            );
          })}
        </div>
      )}
    </Menu>
  );
}

export default LanguageSwitcher;
