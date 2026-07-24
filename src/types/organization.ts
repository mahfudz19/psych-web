/**
 * Tipe data untuk Organization Plan
 * Menentukan tier subscription organisasi
 */
export type OrganizationPlan = "free_trial" | "free" | "premium" | "enterprise";

/**
 * Interface untuk Organization Entity sesuai backend
 * Merepresentasikan struktur data organisasi dari database
 */
export interface Organization {
  /** Unique identifier untuk organisasi */
  id: string;

  /** Nama organisasi */
  name: string;

  /** Deskripsi organisasi (nullable) */
  description: string | null;

  /** Website organisasi (nullable) */
  website: string | null;

  /** URL logo organisasi (nullable) */
  logo: string | null;

  /** Alamat organisasi (nullable) */
  address: string | null;

  /** Nomor telepon organisasi (nullable) */
  phone: string | null;

  /** Email kontak organisasi (nullable) */
  email: string | null;

  /** ID user owner organisasi */
  ownerId: string;

  /** Plan subscription organisasi */
  plan: OrganizationPlan;

  /** Status aktif organisasi */
  status: boolean;

  /** Tanggal mulai trial (ISO 8601, nullable) */
  trialStartsAt: string | null;

  /** Tanggal berakhir trial (ISO 8601, nullable) */
  trialEndsAt: string | null;

  /** Jumlah maksimum seat (-1 untuk unlimited) */
  seats: number;

  /** Jumlah seat yang sudah digunakan */
  seatsUsed: number;

  /** Timestamp pembuatan organisasi */
  createdAt: string;

  /** Timestamp terakhir update */
  updatedAt: string;
}

/**
 * Interface untuk request membuat organisasi baru
 */
export interface CreateOrganizationRequest {
  /** Nama organisasi (required) */
  name: string;

  /** Deskripsi organisasi (optional) */
  description?: string;

  /** Website organisasi (optional) */
  website?: string;

  /** Nomor telepon organisasi (optional) */
  phone?: string;

  /** Email kontak organisasi (optional) */
  email?: string;

  /** Alamat organisasi (optional) */
  address?: string;
}

/**
 * Interface untuk request update organisasi
 * Semua field optional karena PATCH
 */
export interface UpdateOrganizationRequest {
  /** Nama organisasi (optional) */
  name?: string;

  /** Deskripsi organisasi (optional) */
  description?: string;

  /** Website organisasi (optional) */
  website?: string;

  /** Nomor telepon organisasi (optional) */
  phone?: string;

  /** Email kontak organisasi (optional) */
  email?: string;

  /** Alamat organisasi (optional) */
  address?: string;
}

/**
 * Interface untuk request delete organisasi
 * Memerlukan confirmation text
 */
export interface DeleteOrganizationRequest {
  /** Confirmation text untuk delete */
  confirmation: "DELETE_MY_ORGANIZATION";
}

/**
 * Interface untuk item organisasi di list response
 */
export interface OrganizationListItem {
  /** Unique identifier untuk organisasi */
  id: string;

  /** Nama organisasi */
  name: string;

  /** Deskripsi organisasi (nullable) */
  description: string | null;

  /** URL logo organisasi (nullable) */
  logo: string | null;

  /** ID user owner organisasi */
  ownerId: string;

  /** Plan subscription organisasi */
  plan: OrganizationPlan;

  /** Status aktif organisasi */
  status: boolean;

  /** Tanggal berakhir trial (ISO 8601, nullable) */
  trialEndsAt: string | null;

  /** Jumlah maksimum seat */
  seats: number;

  /** Jumlah seat yang sudah digunakan */
  seatsUsed: number;

  /** Role user saat ini dalam organisasi */
  role: string;

  /** Timestamp pembuatan organisasi */
  createdAt: string;
}

/**
 * Interface untuk response list organisasi
 */
export interface OrganizationListResponse {
  /** Array organisasi */
  organizations: OrganizationListItem[];

  /** Metadata pagination */
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Interface untuk response create organization
 * Mengembalikan organization dan user yang sudah diupdate
 */
export interface CreateOrganizationResponse {
  /** Data organisasi yang baru dibuat */
  organization: Organization;

  /** Data user yang sudah diupdate dengan organizationId */
  user: {
    id: string;
    organizationId: string;
    organizationRole: string;
    organizationName: string;
    roles: string[];
    updatedAt: string;
  };
}
