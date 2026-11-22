import { useMutation } from "@tanstack/react-query";
import toast from "../../../../../components/ui/Toast";
import { uploadApi } from "../../../../../components/utility/uploadApi";
import type { User } from "../../../../../types/user";
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

  const urlData = await uploadApi(file);

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
