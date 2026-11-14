import { Link } from "@tanstack/react-router";

function ErrorCard({ title, message }: { title: string; message: string }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center space-y-4 rounded-3xl border border-error-main/20 bg-error-main/5 p-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-main/10 text-xl text-error-main">
        ⚠️
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-text-primary">{title}</h2>
        <p className="mx-auto max-w-md text-sm text-text-secondary">
          {message}
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          to="/test"
          className="rounded-xl bg-divider/20 px-5 py-2.5 text-xs font-bold text-text-secondary hover:bg-divider/40"
        >
          Kembali ke Katalog
        </Link>
      </div>
    </div>
  );
}

export default ErrorCard;
