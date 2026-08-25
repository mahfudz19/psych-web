import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { authStore } from "../../../../utils/authStore";
import {
  ShieldAlert,
  Building2,
  Users,
  Activity,
  CreditCard,
  ClipboardList,
  User as UserIcon,
} from "lucide-react";
import ModalInvite from "../members/-components/ModalInvite";

export const Route = createFileRoute("/_auth/_organization/dashboard/")({
  component: DashboardOverview,
});

function StatCard({
  title,
  value,
  subtitle,
  icon,
  colorClass,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  colorClass: string;
}) {
  return (
    <div className="bg-bg-paper border border-divider rounded-3xl p-6 shadow-sm flex items-start gap-4 transition-all hover:shadow-md">
      <div className={`p-4 rounded-2xl ${colorClass} shrink-0`}>{icon}</div>
      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-1">
          {title}
        </p>
        <h4 className="text-3xl font-extrabold text-text-primary mb-1">
          {value}
        </h4>
        {subtitle && (
          <p className="text-xs font-medium text-text-secondary">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function DashboardOverview() {
  const { t } = useTranslation();

  // 1. Ambil data user dari memory state (sangat cepat, tanpa loading)
  const { user } = authStore.get();

  // 2. DERIVED STATE: Deteksi Role secara presisi
  const isSuperAdmin = user?.roles?.includes("SUPERADMIN") ?? false;
  const isOwner = user?.organizationRole === "owner";
  const isAdmin = user?.organizationRole === "admin";
  const isMember =
    user?.organizationRole === "member" ||
    (!isOwner && !isAdmin && !isSuperAdmin);

  // Menentukan label role untuk UI
  const getRoleLabel = () => {
    if (isSuperAdmin) return "System Administrator";
    if (isOwner) return "Organization Owner";
    if (isAdmin) return "Organization Admin";
    return "Member";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-bg-paper p-8 rounded-4xl border border-divider shadow-sm relative overflow-hidden">
        {/* Aksen Visual */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-main/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold text-text-primary tracking-tight mb-2">
            {t("dashboard.welcome", "Selamat datang kembali,")}{" "}
            {user?.fullName?.split(" ")[0]}!
          </h2>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider bg-divider/20 text-text-secondary">
              <Building2 className="w-3.5 h-3.5" />
              {user?.organizationName || "Personal Workspace"}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider bg-primary-main/10 text-primary-main">
              {getRoleLabel()}
            </span>
          </div>
        </div>

        {/* Action Button Global (Menyesuaikan Role) */}
        <div className="relative z-10 flex shrink-0">
          {isSuperAdmin ? (
            <button className="px-6 py-3 bg-error-main text-white rounded-2xl text-sm font-bold shadow-md shadow-error-main/20 hover:bg-error-dark transition-all flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> System Settings
            </button>
          ) : isOwner || isAdmin ? (
            <ModalInvite />
          ) : (
            <Link
              to="/test"
              className="px-6 py-3 bg-primary-main text-primary-contrast rounded-2xl text-sm font-bold shadow-md shadow-primary-main/20 hover:bg-primary-dark transition-all flex items-center gap-2"
            >
              <ClipboardList className="w-4 h-4" /> Take a Test
            </Link>
          )}
        </div>
      </div>

      {/* ==========================================
          KONTEN KHUSUS: SUPERADMIN
          ========================================== */}
      {isSuperAdmin && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-error-main" /> System Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Organizations"
              value="142"
              subtitle="+12 this month"
              icon={<Building2 className="w-6 h-6" />}
              colorClass="bg-info-main/10 text-info-main"
            />
            <StatCard
              title="Active Users"
              value="8,439"
              subtitle="System wide usage"
              icon={<Activity className="w-6 h-6" />}
              colorClass="bg-success-main/10 text-success-main"
            />
            <StatCard
              title="System Health"
              value="99.9%"
              subtitle="All services operational"
              icon={<ShieldAlert className="w-6 h-6" />}
              colorClass="bg-primary-main/10 text-primary-main"
            />
          </div>
        </div>
      )}

      {/* ==========================================
          KONTEN KHUSUS: OWNER & ADMIN
          ========================================== */}
      {(isOwner || isAdmin) && !isSuperAdmin && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary-main" /> Organization
            Stats
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Team Members"
              value="24"
              subtitle="Active accounts"
              icon={<Users className="w-6 h-6" />}
              colorClass="bg-primary-main/10 text-primary-main"
            />
            <StatCard
              title="Completed Tests"
              value="156"
              subtitle="Across all members"
              icon={<ClipboardList className="w-6 h-6" />}
              colorClass="bg-secondary-main/10 text-secondary-main"
            />

            {/* Hanya Owner yang melihat urusan Billing */}
            {isOwner ? (
              <StatCard
                title="Current Plan"
                value="Pro"
                subtitle="Renews in 14 days"
                icon={<CreditCard className="w-6 h-6" />}
                colorClass="bg-warning-main/10 text-warning-main"
              />
            ) : (
              <StatCard
                title="Pending Invites"
                value="3"
                subtitle="Awaiting response"
                icon={<UserIcon className="w-6 h-6" />}
                colorClass="bg-info-main/10 text-info-main"
              />
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          KONTEN KHUSUS: MEMBER
          ========================================== */}
      {isMember && !isSuperAdmin && !isOwner && !isAdmin && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <UserIcon className="w-6 h-6 text-secondary-main" /> My Activities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard
              title="My Tests"
              value="5"
              subtitle="Completed assessments"
              icon={<ClipboardList className="w-6 h-6" />}
              colorClass="bg-secondary-main/10 text-secondary-main"
            />
            <StatCard
              title="Recent Score"
              value="85/100"
              subtitle="Analytical Reasoning"
              icon={<Activity className="w-6 h-6" />}
              colorClass="bg-success-main/10 text-success-main"
            />
          </div>
        </div>
      )}
    </div>
  );
}
