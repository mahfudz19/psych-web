import { Calendar, Globe, Mail, MapPin, Phone, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useOrganizationQuery } from "../../-api/organization.query";
import { useAuthStore } from "../../../../../utils/authStore";
import LeaveOrganization from "./LeaveOrganization";

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl border border-divider bg-bg-paper">
      <div className="p-2.5 rounded-xl bg-primary-main/10 text-primary-main shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-text-secondary font-medium">{label}</p>
        <p className="text-sm font-semibold text-text-primary truncate mt-0.5">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

function OrganizationInfoPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  if (!user?.organizationId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-text-secondary">
        <span className="w-8 h-8 border-4 border-primary-main border-t-transparent rounded-full animate-spin" />
        <span className="text-sm animate-pulse">{t("common.processing")}</span>
      </div>
    );
  }

  const { data: response, isLoading } = useOrganizationQuery(
    user?.organizationId,
  );
  const org = response?.data;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-text-secondary">
        <span className="w-8 h-8 border-4 border-primary-main border-t-transparent rounded-full animate-spin" />
        <span className="text-sm animate-pulse">{t("common.processing")}</span>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="p-8 text-center text-text-secondary bg-bg-paper rounded-3xl border border-divider">
        Data organisasi tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl border border-divider bg-bg-paper shadow-sm">
        <div className="flex items-center gap-4">
          {org.logo ? (
            <img
              src={org.logo}
              alt={org.name}
              className="w-16 h-16 rounded-2xl object-cover border border-divider"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-primary-main/10 text-primary-main font-bold text-2xl flex items-center justify-center border border-primary-main/20 shrink-0">
              {org.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-text-primary">
                {org.name}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${org.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
              >
                {org.status ? "Aktif" : "Nonaktif"}
              </span>
            </div>
            <p className="text-sm text-text-secondary mt-1">
              {org.description || "Tidak ada deskripsi organisasi."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <span className="px-3 py-2.5 rounded-xl text-xs font-bold uppercase bg-primary-main/10 text-primary-main border border-primary-main/20">
            {org.plan} Plan
          </span>
          <LeaveOrganization orgId={org.id} />
        </div>
      </div>

      {/* 2. Ringkasan Informasi Utama */}
      <div>
        <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-3">
          Informasi Umum
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoCard icon={Mail} label="Email Resmi" value={org.email} />
          <InfoCard icon={Phone} label="Nomor Telepon" value={org.phone} />
          <InfoCard
            icon={Globe}
            label="Situs Web"
            value={
              org.website ? (
                <a
                  href={org.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary-main underline"
                >
                  {org.website}
                </a>
              ) : (
                "-"
              )
            }
          />
          <InfoCard
            icon={Users}
            label="Kapasitas Seats"
            value={`${org.seatsUsed} / ${org.seats} Terpakai`}
          />
        </div>
      </div>

      {/* 3. Detail Alamat & Daftar Anggota */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
            Detail Tambahan
          </h2>
          <div className="flex flex-col gap-3 p-5 rounded-3xl border border-divider bg-bg-paper">
            <InfoCard
              icon={MapPin}
              label="Alamat Organisasi"
              value={org.address}
            />
            <InfoCard
              icon={Calendar}
              label="Tanggal Terdaftar"
              value={new Date(org.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            />
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
            Daftar Anggota ({org.members?.length || 0})
          </h2>
          <div className="p-5 rounded-3xl border border-divider bg-bg-paper flex flex-col gap-3">
            {!org.members || org.members.length === 0 ? (
              <p className="text-xs text-text-secondary py-4 text-center">
                Belum ada data anggota.
              </p>
            ) : (
              <div className="divide-y divide-divider">
                {org.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {member.profilePicture ? (
                        <img
                          src={member.profilePicture}
                          alt={member.fullName}
                          className="w-9 h-9 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-primary-main/10 text-primary-main font-bold text-xs flex items-center justify-center shrink-0">
                          {member.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {member.fullName}
                        </p>
                        <p className="text-xs text-text-secondary truncate">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary-main/10 text-primary-main">
                        {member.organizationRole}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${member.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                      >
                        {member.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrganizationInfoPage;
