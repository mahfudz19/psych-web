import { useMutation } from "@tanstack/react-query";
import { api } from "../../../../../utils/api";
import { authStore } from "../../../../../utils/authStore";
import toast from "../../../../../components/ui/Toast";
import { updateProfile } from "../../../../_guest/-api/auth.api";

// ponytail: single-file upload only, add progress tracking when needed

const uploadAvatar = async (file: File) => {
  type Res = { uploadUrl: string; fileKey: string; bucket: string };

  // Langkah 1: Minta Signed URL dari backend
  const { data: urlData } = await api.post<Res>("/api/v1/files/upload-url", {
    filename: file.name,
    mimeType: file.type,
    category: "PROFILE_PICTURE",
    visibility: "PUBLIC",
  });
  if (!urlData) throw new Error("Gagal mendapatkan URL unggah");
  // Langkah 2: Upload ke GCS — fetch MURNI, tanpa Bearer token!
  const gcsResponse = await fetch(urlData.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!gcsResponse.ok) throw new Error("Gagal mengunggah ke penyimpanan awan");

  // Langkah 3: Update profil dengan URL permanen
  const { data: user } = await updateProfile({
    profilePicture: urlData.fileKey ?? undefined,
  });

  return user;
};

export function useAvatarUploadMutation() {
  return useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (user) => {
      if (user) authStore.set({ user });
      toast.success("Foto profil berhasil diperbarui");
    },
    onError: () => toast.error("Gagal mengunggah foto profil"),
  });
}
