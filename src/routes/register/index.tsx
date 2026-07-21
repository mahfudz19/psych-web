import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/register/")({
  component: RegisterLanding,
});

function RegisterLanding() {
  return (
    <div className="w-full max-w-4xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-text-primary mb-4">
          Buat Akun Baru
        </h1>
        <p className="text-lg text-text-secondary">
          Bergabung dengan PsychAPI dan mulai kelola kebutuhan Anda
        </p>
      </div>

      {/* Pilihan Tipe Registrasi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Individual Account */}
        <Link
          to="./individual"
          className="bg-bg-paper border border-divider rounded-lg p-6 shadow-sm hover:shadow-md hover:border-primary-main transition-all group"
        >
          <div className="text-4xl mb-4">👤</div>
          <h2 className="text-xl font-semibold text-text-primary mb-2 group-hover:text-primary-main transition">
            Akun Individual
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            Untuk penggunaan pribadi dan kebutuhan personal
          </p>
          <ul className="text-sm text-text-secondary space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-success-main">✓</span>
              Akses ke semua fitur dasar
            </li>
            <li className="flex items-center gap-2">
              <span className="text-success-main">✓</span>
              Bisa gunakan kode referral
            </li>
            <li className="flex items-center gap-2">
              <span className="text-success-main">✓</span>
              Gratis selamanya
            </li>
          </ul>
        </Link>

        {/* Organization Account */}
        <Link
          to="./organization"
          className="bg-bg-paper border border-divider rounded-lg p-6 shadow-sm hover:shadow-md hover:border-primary-main transition-all group"
        >
          <div className="text-4xl mb-4">🏢</div>
          <h2 className="text-xl font-semibold text-text-primary mb-2 group-hover:text-primary-main transition">
            Organization Baru
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            Buat organization baru dan undang tim Anda
          </p>
          <ul className="text-sm text-text-secondary space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-success-main">✓</span>
              Kelola tim dan anggota
            </li>
            <li className="flex items-center gap-2">
              <span className="text-success-main">✓</span>
              Fitur kolaborasi lengkap
            </li>
            <li className="flex items-center gap-2">
              <span className="text-success-main">✓</span>
              Anda menjadi owner
            </li>
          </ul>
        </Link>

        {/* Join via Invitation */}
        <a
          href="/register/invite/your_token_here"
          className="bg-bg-paper border border-divider rounded-lg p-6 shadow-sm hover:shadow-md hover:border-primary-main transition-all group"
        >
          <div className="text-4xl mb-4">📬</div>
          <h2 className="text-xl font-semibold text-text-primary mb-2 group-hover:text-primary-main transition">
            Terima Undangan
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            Gunakan link undangan yang diberikan
          </p>
          <ul className="text-sm text-text-secondary space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-success-main">✓</span>
              Langsung join organization
            </li>
            <li className="flex items-center gap-2">
              <span className="text-success-main">✓</span>
              Role sudah ditentukan
            </li>
            <li className="flex items-center gap-2">
              <span className="text-success-main">✓</span>
              Proses cepat dan mudah
            </li>
          </ul>
        </a>
      </div>

      {/* Info Box */}
      <div className="mt-12 bg-info-light/10 border border-info-main/30 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="text-2xl">ℹ️</div>
          <div>
            <h3 className="font-semibold text-info-dark mb-2">
              Sudah punya akun?
            </h3>
            <p className="text-sm text-info-dark/80 mb-3">
              Jika Anda sudah memiliki akun tetapi lupa password, atau ingin
              masuk ke akun yang sudah ada, silakan gunakan halaman login.
            </p>
            <Link
              to="/login"
              className="inline-block bg-info-main text-white px-4 py-2 rounded text-sm font-medium hover:bg-info-dark transition"
            >
              Masuk ke Akun
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
