import {
  Calendar,
  Eye,
  Globe,
  Mail,
  MapPin,
  Phone,
  Users,
  X,
} from "lucide-react";
import Dialog from "../../../../../../components/ui/Dialog";
import IconButton from "../../../../../../components/ui/IconButton";
import { useOrganizationQuery } from "../../../-api/organization.query";

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border border-divider bg-divider/5">
      <div className="p-2 rounded-lg bg-primary-main/10 text-primary-main shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-text-secondary">{label}</p>
        <p className="text-sm font-medium text-text-primary truncate">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

function ContentDetail({ id }: { id: string }) {
  const { data, isLoading } = useOrganizationQuery(id);
  const org = data?.data;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <span className="w-8 h-8 border-4 border-primary-main border-t-transparent rounded-full animate-spin"></span>
        <span className="text-sm text-text-secondary animate-pulse">
          Memuat detail pengguna...
        </span>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="text-center py-10 text-text-secondary">
        Pengguna tidak ditemukan.
      </div>
    );
  }
  return (
    <div className="mt-4 flex flex-col gap-6">
      {/* Header Profile */}
      <div className="flex items-center gap-4 p-4 rounded-2xl border border-divider bg-divider/10">
        {org.logo ? (
          <img
            src={org.logo}
            alt={org.name}
            className="w-14 h-14 rounded-xl object-cover shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-primary-main/10 text-primary-main font-bold text-xl flex items-center justify-center shrink-0">
            {org.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-text-primary truncate">
            {org.name}
          </h3>
          <p className="text-xs text-text-secondary truncate">
            {org.description || "Tidak ada deskripsi"}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span
            className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${org.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {org.status ? "Aktif" : "Nonaktif"}
          </span>
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 uppercase">
            {org.plan}
          </span>
        </div>
      </div>

      {/* Grid Informasi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoItem icon={Mail} label="Email" value={org.email} />
        <InfoItem icon={Phone} label="Telepon" value={org.phone} />
        <InfoItem
          icon={Globe}
          label="Website"
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
        <InfoItem icon={MapPin} label="Alamat" value={org.address} />
        <InfoItem
          icon={Users}
          label="Kapasitas Seats"
          value={`${org.seatsUsed} / ${org.seats} Terpakai`}
        />
        <InfoItem
          icon={Calendar}
          label="Tanggal Dibuat"
          value={new Date(org.createdAt).toLocaleDateString("id-ID")}
        />
      </div>

      {/* Daftar Anggota */}
      {org.members && org.members.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
            Daftar Anggota ({org.members.length})
          </h4>
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
            {org.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-divider bg-bg-paper text-xs"
              >
                <div className="min-w-0">
                  <p className="font-medium text-text-primary truncate">
                    {member.fullName}
                  </p>
                  <p className="text-text-secondary truncate">{member.email}</p>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-primary-main/10 text-primary-main shrink-0">
                  {member.organizationRole}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailOrganization({ id }: { id: string }) {
  return (
    <Dialog
      className="text-left p-0 overflow-hidden sm:max-w-lg"
      isDynamic={true}
      trigger={(openDialog) => (
        <IconButton variant="text" size="sm" onClick={openDialog}>
          <Eye size={16} />
        </IconButton>
      )}
    >
      {(close) => (
        <div className="flex flex-col max-h-[85vh]">
          {/* Header Dialog (Sticky) */}
          <div className="sticky top-0 z-10 px-6 py-4 border-b border-divider bg-bg-paper flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                Detail Organisasi
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Melihat informasi lengkap.
              </p>
            </div>
            <IconButton
              tabIndex={-1}
              onClick={() => close()}
              variant="text"
              color="error"
              size="sm"
              className="shrink-0 bg-error-main/10"
            >
              <X size={18} />
            </IconButton>
          </div>

          {/* Konten Scrollable */}
          <div className="px-6 pb-6 overflow-y-auto">
            <ContentDetail id={id} />
          </div>
        </div>
      )}
    </Dialog>
  );
}

export default DetailOrganization;
