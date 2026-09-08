import { useMutation } from "@tanstack/react-query";
import toast from "../../../../../components/ui/Toast";
import type { User } from "../../../../../types/user";
import { api } from "../../../../../utils/api";
import { authStore } from "../../../../../utils/authStore";
import { updateProfile } from "../../../../_guest/-api/auth.api";

const uploadAvatar = async ({
  file,
  user,
}: {
  file: File | null;
  user: User | null;
}) => {
  if (!file) {
    const { data } = await updateProfile({
      profilePicture: "",
      bio: user?.bio,
      dateOfBirth: user?.dateOfBirth,
      fullName: user?.fullName,
      gender: user?.gender,
      phone: user?.phone ?? "",
    });
    return data;
  }

  type Res = { uploadUrl: string; fileKey: string; bucket: string };

  // Langkah 1: Minta Signed URL dari backend
  const { data: urlData } = await api.post<Res>("/api/v1/files/upload-url", {
    filename: file.name,
    mimeType: file.type,
    category: "PROFILE_PICTURE",
    visibility: "PUBLIC",
  });
  if (!urlData) throw new Error("Gagal mendapatkan URL unggah");

  const gcsResponse = await fetch(urlData.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!gcsResponse.ok) throw new Error("Gagal mengunggah ke penyimpanan awan");

  const { data } = await updateProfile({
    profilePicture: urlData.fileKey ?? undefined,
    bio: user?.bio,
    dateOfBirth: user?.dateOfBirth,
    fullName: user?.fullName,
    gender: user?.gender,
    phone: user?.phone ?? "",
  });

  return data;
};

export function useAvatarUploadMutation() {
  return useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (user, variables) => {
      if (user) authStore.set({ user });

      if (variables === null) toast.success("Foto profil berhasil dihapus");
      else toast.success("Foto profil berhasil diperbarui");
    },
    onError: (_, variables) => {
      if (variables === null) toast.error("Gagal menghapus foto profil");
      else toast.error("Gagal mengunggah foto profil");
    },
  });
}
