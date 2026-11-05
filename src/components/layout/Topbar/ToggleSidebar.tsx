import { useSidebar } from "../../../contexts/SidebarContext";
import IconButton from "../../ui/IconButton";

function ToggleSidebar() {
  const { toggleMobile } = useSidebar();

  return (
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
  );
}

export default ToggleSidebar;
