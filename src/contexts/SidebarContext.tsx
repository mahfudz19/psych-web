import { createContext, useContext, useEffect, useState } from "react";

interface SidebarContextType {
  isMobileOpen: boolean; // Untuk slide-in di HP
  isMini: boolean; // Untuk mode menciut (minimize) di Desktop
  toggleMobile: () => void;
  toggleMini: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // 1. State Mobile (Tidak perlu disimpan di localStorage karena sifatnya sementara)
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // 2. State Desktop (Baca nilai awal dari localStorage, default: false)
  const [isMini, setIsMini] = useState<boolean>(() => {
    // Lazy initialization agar hanya dijalankan sekali saat render pertama
    const saved = localStorage.getItem("psych_sidebar_mini");
    return saved === "true";
  });

  // 3. Efek untuk menyinkronkan perubahan isMini ke localStorage
  useEffect(() => {
    localStorage.setItem("psych_sidebar_mini", String(isMini));
  }, [isMini]);

  const toggleMobile = () => setIsMobileOpen((prev) => !prev);
  const toggleMini = () => setIsMini((prev) => !prev);

  return (
    <SidebarContext.Provider
      value={{
        isMobileOpen,
        isMini,
        toggleMobile,
        toggleMini,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

// Custom Hook agar pemanggilan di komponen lebih rapi
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar harus digunakan di dalam SidebarProvider");
  }
  return context;
}
