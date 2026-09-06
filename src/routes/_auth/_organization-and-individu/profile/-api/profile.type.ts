export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: "male" | "female";
  profilePicture?: string;
}
