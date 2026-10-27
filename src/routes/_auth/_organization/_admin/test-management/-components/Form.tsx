import React, { useState } from "react";
import Button from "../../../../../../components/ui/Button";
import Input from "../../../../../../components/ui/Input";
import Label from "../../../../../../components/ui/Label";
import Select from "../../../../../../components/ui/Select";
import Tabs from "../../../../../../components/ui/Tabs";
import Tab from "../../../../../../components/ui/Tabs/Tab";
import TabContent from "../../../../../../components/ui/Tabs/TabContent";

import type {
  ItemOrderPolicy,
  PausePolicy,
  ResultAccessLevel,
  ResultViewType,
  ScoringMode,
  TestCategory,
  TestDefinition,
  TestPurpose,
  TestStatus,
} from "../-api/test-definitions.type";
import {
  useCreateTestDefinition,
  useUpdateTestDefinition,
} from "../-api/test-definitions.query";
import Textarea from "../../../../../../components/ui/Textarea";
import Checkbox from "../../../../../../components/ui/Checkbox";

interface Props {
  testDefinition?: TestDefinition;
  onSuccessCallback?: () => void;
  onCancel?: () => void;
}

function TestDefinitionForm({
  testDefinition,
  onCancel,
  onSuccessCallback,
}: Props) {
  const isEdit = Boolean(testDefinition);
  const [activeTab, setActiveTab] = useState<string>("katalog");

  const createMutation = useCreateTestDefinition();
  const updateMutation = useUpdateTestDefinition();
  const isLoading = false;

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const payload = {
      code: formData.get("code") as string,
      name: formData.get("name") as string,
      shortName: formData.get("shortName") as string,
      category: formData.get("category") as TestCategory,
      description: formData.get("description") as string,
      instructions: formData.get("instructions") as string,
      purposes: formData.getAll("purposes") as TestPurpose[],
      version: formData.get("version") as string,
      status: formData.get("status") as TestStatus,
      scoringMode: formData.get("scoringMode") as ScoringMode,
      scorerKey: formData.get("scorerKey") as string,
      resultViewType: formData.get("resultViewType") as ResultViewType,
      totalItems: Number(formData.get("totalItems") || 0),
      estimatedMinutes: Number(formData.get("estimatedMinutes") || 0),
      pausePolicy: formData.get("pausePolicy") as PausePolicy,
      disconnectGraceSeconds: Number(
        formData.get("disconnectGraceSeconds") || 120,
      ),
      itemOrderPolicy: formData.get("itemOrderPolicy") as ItemOrderPolicy,
      language: formData.get("language") as string,
      requiredFeature: formData.get("requiredFeature") as string,
      resultAccessLevel: formData.get("resultAccessLevel") as ResultAccessLevel,
    };

    if (isEdit && testDefinition?.id)
      updateMutation.mutate(
        { id: testDefinition?.id, payload },
        { onSuccess: onSuccessCallback },
      );
    else createMutation.mutate(payload, { onSuccess: onSuccessCallback });
  };

  const purposes = testDefinition?.purposes || ["SELF_DISCOVERY"];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* HEADER TABS */}
      <div className="px-4 pt-4 pb-2 border-b border-divider">
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tab value="katalog" label="Katalog Dasar" />
          <Tab value="pengerjaan" label="Pengaturan Pengerjaan" />
          <Tab value="hasil" label="Scoring & Akses" />
        </Tabs>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        {/* TAB 1: KATALOG (Informasi Dasar) */}
        <TabContent value="katalog" activeValue={activeTab} keepMounted>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="code"
                  required
                  tooltip="Kode unik tetap untuk keperluan aplikasi, URL, dan hak akses. Contoh: BIG_FIVE"
                >
                  Kode Tes
                </Label>
                <Input
                  id="code"
                  name="code"
                  type="text"
                  required
                  defaultValue={testDefinition?.code}
                  placeholder="Contoh: BIG_FIVE"
                  disabled={isEdit}
                  className="w-full uppercase"
                />
              </div>
              <div>
                <Label
                  htmlFor="version"
                  required
                  tooltip="Versi iterasi alat tes (dicatat di riwayat attempt). Contoh: 1.0.0"
                >
                  Versi
                </Label>
                <Input
                  id="version"
                  name="version"
                  type="text"
                  required
                  defaultValue={testDefinition?.version || "1.0.0"}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="name"
                  required
                  tooltip="Nama lengkap tes yang akan terlihat di laporan dan rincian."
                >
                  Nama Lengkap Tes
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  defaultValue={testDefinition?.name}
                  placeholder="Contoh: Big Five Personality"
                  className="w-full"
                />
              </div>
              <div>
                <Label
                  htmlFor="shortName"
                  required
                  tooltip="Singkatan nama tes untuk tampilan UI yang lebih ringkas/sempit seperti Kartu Tes."
                >
                  Nama Singkat (UI)
                </Label>
                <Input
                  id="shortName"
                  name="shortName"
                  type="text"
                  required
                  defaultValue={testDefinition?.shortName}
                  placeholder="Contoh: Big Five"
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="category"
                  required
                  tooltip="Pengelompokan jenis psikotes (Kemampuan, Kepribadian, Minat, dll)."
                >
                  Kategori
                </Label>
                <Select
                  id="category"
                  name="category"
                  required
                  defaultValue={testDefinition?.category || ""}
                  className="w-full"
                >
                  <option value="" disabled>
                    -- Pilih Kategori --
                  </option>
                  <option value="ABILITY">Kemampuan (ABILITY)</option>
                  <option value="PERSONALITY_SCALE">
                    Kepribadian Skala (PERSONALITY_SCALE)
                  </option>
                  <option value="PERSONALITY_FORCED_CHOICE">
                    Kepribadian Pilihan Paksa (PERSONALITY_FORCED_CHOICE)
                  </option>
                  <option value="INTEREST">Minat (INTEREST)</option>
                  <option value="SPEED_ENDURANCE">
                    Kecepatan & Ketelitian (SPEED_ENDURANCE)
                  </option>
                  <option value="PROJECTIVE">Proyektif (PROJECTIVE)</option>
                  <option value="MANAGEMENT">Manajemen (MANAGEMENT)</option>
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="status"
                  required
                  tooltip="Status rilis alat tes. Pilih ACTIVE agar tes bisa digunakan oleh sistem."
                >
                  Status
                </Label>
                <Select
                  id="status"
                  name="status"
                  required
                  disabled
                  defaultValue={testDefinition?.status || "DRAFT"}
                  className="w-full"
                >
                  <option value="DRAFT">DRAFT</option>
                </Select>
              </div>
            </div>

            <div>
              <Label
                htmlFor="description"
                tooltip="Penjelasan singkat tentang apa yang diukur oleh tes ini untuk ditampilkan pada daftar eksplorasi."
              >
                Deskripsi Katalog
              </Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={testDefinition?.description}
                rows={3}
                className="w-full"
              />
            </div>

            <div>
              <Label
                htmlFor="instructions"
                tooltip="Panduan yang akan dibaca oleh user sebelum mereka menekan tombol 'Mulai Tes'."
              >
                Instruksi Umum
              </Label>
              <Textarea
                id="instructions"
                name="instructions"
                defaultValue={testDefinition?.instructions}
                rows={3}
                className="w-full"
              />
            </div>

            <div>
              <Label tooltip="Tujuan dari tes ini untuk pemfilteran ketersediaan pada dashboard (Bisa lebih dari satu).">
                Tujuan Penggunaan
              </Label>
              <div className="flex items-center gap-4">
                <Checkbox
                  sizes="lg"
                  value="SELF_DISCOVERY"
                  defaultChecked={purposes.includes("SELF_DISCOVERY")}
                  label="Self Discovery"
                />
                <Checkbox
                  sizes="lg"
                  value="RECRUITMENT"
                  defaultChecked={purposes.includes("RECRUITMENT")}
                  label="Recruitment"
                />
              </div>
            </div>
          </div>
        </TabContent>

        {/* TAB 2: PENGERJAAN */}
        <TabContent value="pengerjaan" activeValue={activeTab} keepMounted>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label
                  htmlFor="totalItems"
                  tooltip="Jumlah total soal untuk keperluan validasi kelengkapan data."
                >
                  Total Soal
                </Label>
                <Input
                  id="totalItems"
                  name="totalItems"
                  type="number"
                  min="0"
                  defaultValue={testDefinition?.totalItems || 0}
                  className="w-full"
                />
              </div>
              <div>
                <Label
                  htmlFor="estimatedMinutes"
                  tooltip="Estimasi waktu rata-rata yang diperlukan peserta untuk menyelesaikan."
                >
                  Estimasi (Menit)
                </Label>
                <Input
                  id="estimatedMinutes"
                  name="estimatedMinutes"
                  type="number"
                  min="0"
                  defaultValue={testDefinition?.estimatedMinutes || 0}
                  className="w-full"
                />
              </div>
              <div>
                <Label
                  htmlFor="disconnectGraceSeconds"
                  tooltip="Waktu tenggang (Grace Period) saat koneksi pengguna terputus agar tes belum tertutup."
                >
                  Toleransi Putus (Detik)
                </Label>
                <Input
                  id="disconnectGraceSeconds"
                  name="disconnectGraceSeconds"
                  type="number"
                  min="0"
                  defaultValue={testDefinition?.disconnectGraceSeconds ?? 120}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="pausePolicy"
                  tooltip="Apakah pengguna diperbolehkan melakukan pause selama waktu pengerjaan berjalan."
                >
                  Kebijakan Jeda
                </Label>
                <Select
                  id="pausePolicy"
                  name="pausePolicy"
                  defaultValue={testDefinition?.pausePolicy || "FREE"}
                  className="w-full rounded-2xl border border-divider text-text-primary px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-primary-main focus:ring-primary-main/20"
                >
                  <option value="FREE">Bebas (FREE)</option>
                  <option value="BETWEEN_SECTIONS_ONLY">
                    Antar Bagian Saja (BETWEEN_SECTIONS_ONLY)
                  </option>
                  <option value="NONE">Tidak Boleh Jeda (NONE)</option>
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="itemOrderPolicy"
                  tooltip="Menentukan apakah urutan soal akan diacak (RANDOMIZED) atau tetap (FIXED) per pengguna."
                >
                  Urutan Soal
                </Label>
                <Select
                  id="itemOrderPolicy"
                  name="itemOrderPolicy"
                  defaultValue={testDefinition?.itemOrderPolicy || "FIXED"}
                  className="w-full rounded-2xl border border-divider text-text-primary px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-primary-main focus:ring-primary-main/20"
                >
                  <option value="FIXED">Tetap (FIXED)</option>
                  <option value="RANDOMIZED">Acak (RANDOMIZED)</option>
                </Select>
              </div>
            </div>
          </div>
        </TabContent>

        {/* TAB 3: HASIL & SCORING */}
        <TabContent value="hasil" activeValue={activeTab} keepMounted>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="scoringMode"
                  tooltip="Cara skor dihitung (Otomatis oleh sistem, Manual oleh psikolog seperti tes Wartegg, atau Hybrid)."
                >
                  Mode Scoring
                </Label>
                <Select
                  id="scoringMode"
                  name="scoringMode"
                  defaultValue={testDefinition?.scoringMode || "AUTO"}
                  className="w-full rounded-2xl border border-divider text-text-primary px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-primary-main focus:ring-primary-main/20"
                >
                  <option value="AUTO">Otomatis (AUTO)</option>
                  <option value="MANUAL">Manual (MANUAL)</option>
                  <option value="HYBRID">Hybrid (HYBRID)</option>
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="scorerKey"
                  tooltip="Nama kelas/fungsi engine scorer di dalam server (Misal: BIG_FIVE_V1)."
                >
                  Scorer Key (Kode Sistem)
                </Label>
                <Input
                  id="scorerKey"
                  name="scorerKey"
                  type="text"
                  defaultValue={testDefinition?.scorerKey}
                  placeholder="Contoh: BIG_FIVE_V1"
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label
                  htmlFor="resultViewType"
                  tooltip="Bentuk grafik utama yang disajikan dalam report hasil (Radar, Bar, dll)."
                >
                  Tipe Visual Hasil
                </Label>
                <Select
                  id="resultViewType"
                  name="resultViewType"
                  defaultValue={testDefinition?.resultViewType || "PROFILE"}
                  className="w-full rounded-2xl border border-divider text-text-primary px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-primary-main focus:ring-primary-main/20"
                >
                  <option value="RADAR">Radar (RADAR)</option>
                  <option value="BAR">Bar Chart (BAR)</option>
                  <option value="PROFILE">Profil Garis (PROFILE)</option>
                  <option value="TYPE_CARD">Kartu Tipe (TYPE_CARD)</option>
                  <option value="IQ_CARD">Kartu IQ (IQ_CARD)</option>
                  <option value="NARRATIVE_ONLY">
                    Narasi Saja (NARRATIVE_ONLY)
                  </option>
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="resultAccessLevel"
                  tooltip="Jika RESTRICTED, hasil akan ditahan sampai disetujui / dinilai oleh Psikolog."
                >
                  Akses Hasil
                </Label>
                <Select
                  id="resultAccessLevel"
                  name="resultAccessLevel"
                  defaultValue={testDefinition?.resultAccessLevel || "STANDARD"}
                  className="w-full rounded-2xl border border-divider text-text-primary px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-primary-main focus:ring-primary-main/20"
                >
                  <option value="STANDARD">Standar (STANDARD)</option>
                  <option value="RESTRICTED">
                    Terbatas/Perlu Review (RESTRICTED)
                  </option>
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="requiredFeature"
                  tooltip="Key langganan/subscription yang diperlukan organisasi untuk mengakses tes ini."
                >
                  Syarat Feature Code
                </Label>
                <Input
                  id="requiredFeature"
                  name="requiredFeature"
                  type="text"
                  defaultValue={testDefinition?.requiredFeature}
                  placeholder="Contoh: test.big_five"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </TabContent>
      </div>

      {/* FOOTER BUTTONS */}
      <div className="flex items-center justify-end gap-3 p-4 border-t border-divider">
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
              : "Buat Test Definition"}
        </Button>
      </div>
    </form>
  );
}

export default TestDefinitionForm;
