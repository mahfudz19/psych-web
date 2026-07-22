import { useSidebar } from "../../../contexts/SidebarContext";

function ToggleSidebar() {
  const { toggleMobile, toggleMini, isMini } = useSidebar();

  return (
    <>
      <button
        onClick={toggleMobile}
        className="lg:hidden p-2 flex items-center justify-center rounded-2xl text-text-secondary hover:bg-divider/20 hover:text-primary-main focus:outline-none transition-all"
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
      </button>

      <button
        onClick={toggleMini}
        className="hidden lg:flex p-2 items-center justify-center rounded-2xl text-text-secondary hover:bg-divider/20 hover:text-primary-main focus:outline-none transition-all"
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
      </button>
    </>
  );
}

export default ToggleSidebar;
