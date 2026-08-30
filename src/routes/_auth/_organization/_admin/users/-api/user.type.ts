export interface Users {
  id: string;
  email: string;
  fullName: string;
  profilePicture: string | null;
  phone: string | null;
  bio: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  roles: ("USER" | "ORGANIZATION" | "SUPERADMIN")[];
  organizationId: string | null;
  organizationRole: string;
  organizationName: string;
  subscriptionTier: string;
  subscriptionExpiry: number | null;
  referralCode: string;
  totalReferrals: number;
  successfulReferrals: number;
  ReferralEarnings: number;
  inviteCode: string | null;
  invitationStatus: string | null;
  invitationRole: string | null;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING" | "DELETED";
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
  accountType: "INDIVIDUAL" | "ORGANIZATION";
}
