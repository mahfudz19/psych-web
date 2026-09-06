import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "../../../../../components/ui/Toast";
import { updateProfile } from "../../../../_guest/-api/auth.api";
import type { UpdateProfileRequest } from "./profile.type";
import { authStore } from "../../../../../utils/authStore";

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfile(data),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      if (data) authStore.set({ user: data });
      toast.success("Profil berhasil diperbarui");
    },
    onError: () => {
      toast.error("Gagal memperbarui profil");
    },
  });
}
