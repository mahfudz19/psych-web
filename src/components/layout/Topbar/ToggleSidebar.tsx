import { useSidebar } from "../../../contexts/SidebarContext";
import IconButton from "../../ui/IconButton";

function ToggleSidebar() {
  const { toggleMobile, toggleMini, isMini } = useSidebar();

  return (
    <>
      <IconButton
        onClick={toggleMobile}
        variant="text"
        size="sm"
        className="lg:hidden flex"
        aria-label="Buka Menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </IconButton>

      <IconButton
        onClick={toggleMini}
        variant="text"
        size="sm"
        className="hidden lg:flex"
        aria-label={isMini ? "Perbesar Menu" : "Perkecil Menu"}
      >
        {isMini ? (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        )}
      </IconButton>
    </>
  );
}

export default ToggleSidebar;
