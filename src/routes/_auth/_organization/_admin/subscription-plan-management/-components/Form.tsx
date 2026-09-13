import type React from "react";
import {
  useCreateSubscriptionPlanMutation,
  useUpdateSubscriptionPlanMutation,
} from "../-api/subscriptionPlan.query";
import type {
  SubscriptionPlan,
  TargetAudience,
} from "../-api/subscriptionPlan.type";
import Button from "../../../../../../components/ui/Button";
import Input from "../../../../../../components/ui/Input";
import Label from "../../../../../../components/ui/Label";

interface Props {
  subscriptionPlan?: SubscriptionPlan;
  onSuccessCallback?: () => void;
  onCancel?: () => void;
}

function SubscriptionPlanForm({
  subscriptionPlan,
  onSuccessCallback,
  onCancel,
}: Props) {
  const isEdit = Boolean(subscriptionPlan);

  const createMutation = useCreateSubscriptionPlanMutation();
  const updateMutation = useUpdateSubscriptionPlanMutation();

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const maxSeatsVal = formData.get("maxSeats");

    const payload = {
      name: formData.get("name") as string,
      code: formData.get("code") as string,
      price: Number(formData.get("price")),
      durationDays: Number(formData.get("durationDays")),
      targetAudience: formData.get("targetAudience") as TargetAudience,
      maxSeats: maxSeatsVal ? Number(maxSeatsVal) : null,
    };

    if (isEdit && subscriptionPlan) {
      updateMutation.mutate(
        { id: subscriptionPlan.id, data: payload },
        { onSuccess: () => onSuccessCallback?.() },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => onSuccessCallback?.(),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      {/* NAME */}
      <div>
        <Label htmlFor="name" className="mb-1.5">
          Nama Paket <span className="text-error-main">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={subscriptionPlan?.name}
          placeholder="Contoh: Organization Pro"
          className="w-full"
        />
      </div>

      {/* CODE */}
      <div>
        <Label htmlFor="code" className="mb-1.5">
          Kode Unik <span className="text-error-main">*</span>
        </Label>
        <Input
          id="code"
          name="code"
          type="text"
          required
          defaultValue={subscriptionPlan?.code}
          placeholder="Contoh: ORG_PRO"
          disabled={isEdit}
          className="w-full uppercase"
        />
      </div>

      {/* PRICE & DURATION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price" className="mb-1.5">
            Harga (Rp) <span className="text-error-main">*</span>
          </Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="1000"
            required
            defaultValue={subscriptionPlan?.price}
            placeholder="Contoh: 150000"
            className="w-full"
          />
        </div>

        <div>
          <Label htmlFor="durationDays" className="mb-1.5">
            Durasi (Hari) <span className="text-error-main">*</span>
          </Label>
          <Input
            id="durationDays"
            name="durationDays"
            type="number"
            min="1"
            required
            defaultValue={subscriptionPlan?.durationDays}
            placeholder="Contoh: 30"
            className="w-full"
          />
        </div>
      </div>

      {/* TARGET AUDIENCE */}
      <div>
        <Label htmlFor="targetAudience" className="mb-1.5">
          Target Pengguna <span className="text-error-main">*</span>
        </Label>
        <select
          id="targetAudience"
          name="targetAudience"
          required
          defaultValue={subscriptionPlan?.targetAudience || ""}
          className="w-full rounded-2xl border border-divider bg-bg-default text-text-primary px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:border-primary-main focus:ring-primary-main/20 transition-all"
        >
          <option value="" disabled>
            -- Pilih Target --
          </option>
          <option value="USER">Individu (USER)</option>
          <option value="ORGANIZATION">Organisasi (ORGANIZATION)</option>
        </select>
      </div>

      {/* MAX SEATS */}
      <div>
        <Label htmlFor="maxSeats" className="mb-1.5">
          Maksimal Kursi{" "}
          <span className="text-text-secondary font-normal lowercase">
            (opsional / kosongkan jika unlimited)
          </span>
        </Label>
        <Input
          id="maxSeats"
          name="maxSeats"
          type="number"
          min="1"
          defaultValue={subscriptionPlan?.maxSeats ?? undefined}
          placeholder="Contoh: 50"
          className="w-full"
        />
      </div>

      {/* BUTTONS */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-divider">
        {onCancel && (
          <Button
            type="button"
            variant="outlined"
            onClick={onCancel}
            disabled={isLoading}
          >
            Batal
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Menyimpan..."
            : isEdit
              ? "Simpan Perubahan"
              : "Buat Paket Baru"}
        </Button>
      </div>
    </form>
  );
}

export default SubscriptionPlanForm;
