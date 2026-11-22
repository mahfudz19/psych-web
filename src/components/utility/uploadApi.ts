import { api } from "../../utils/api";

type Res = { uploadUrl: string; fileKey: string; bucket: string };

type CATEGORY_PATH =
  "PROFILE_PICTURE" | "DOCUMENT" | "ORGANIZATION_LOGO" | "TEST_ASSETS";

async function uploadApi(file: File, category: CATEGORY_PATH) {
  const { data: urlData } = await api.post<Res>("/api/v1/files/upload-url", {
    filename: file.name,
    mimeType: file.type,
    category: category,
    visibility: "PUBLIC",
  });
  if (!urlData) throw new Error("Gagal mendapatkan URL unggah");

  const gcsResponse = await fetch(urlData.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!gcsResponse.ok) throw new Error("Gagal mengunggah ke penyimpanan awan");

  return urlData;
}

export { uploadApi };
