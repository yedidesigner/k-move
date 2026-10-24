import { createFileRoute } from "@tanstack/react-router";
import { FolderCollection } from "@/components/FolderCollection";

const DRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/1ylEME231wJeG9okmvJaPjKtGO_kccfAo";

// Folder names and destinations verified against the course's Google Drive folder.
const PORTFOLIO_FOLDERS = [
  {
    name: "강민주",
    url: "https://drive.google.com/drive/folders/1uIltriVH0Mold8YEIoG9pAnDGemphiw7",
  },
  {
    name: "강유민",
    url: "https://drive.google.com/drive/folders/1hSNqfJV2hnOK0V3TgsG8OWK8JLuxeQ1V",
  },
  {
    name: "김다혜",
    url: "https://drive.google.com/drive/folders/1c_oP7ogffUa2seOaBRXbMjPQ-j_j9oMN",
  },
  {
    name: "김선미",
    url: "https://drive.google.com/drive/folders/1kofukYo48gOmCSuXfekY0UjRZ8lmlKvO",
  },
  {
    name: "김화민",
    url: "https://drive.google.com/drive/folders/1OYeHNIvnmiYuy8jLaLSO4IbvBPA0rjqA",
  },
  {
    name: "류영진",
    url: "https://drive.google.com/drive/folders/1jzN0-MoUgK-yXkawKWSUka1W8oGPrUbL",
  },
  {
    name: "오한별",
    url: "https://drive.google.com/drive/folders/1T-piMLnWanag10eNjckoBV-pl7F9GWGE",
  },
  {
    name: "이익제",
    url: "https://drive.google.com/drive/folders/1tBlvGIex0LEATZSHdxcNpoum7GkQC1E3",
  },
  {
    name: "이주희",
    url: "https://drive.google.com/drive/folders/1W_b8GxAH5DnMw_hUPqHZlYctfa9J4pSX",
  },
  {
    name: "이지원",
    url: "https://drive.google.com/drive/folders/1QQr3DGBcrUSZbFXQb0jhVlsM_XSaUFBA",
  },
  {
    name: "임시윤",
    url: "https://drive.google.com/drive/folders/1CxbXVpFQ1hhoDze16_4YEGSsNujK3H-C",
  },
  {
    name: "정여진",
    url: "https://drive.google.com/drive/folders/16MJddJAQxgqDjRDHXRaTA4e8nsZ19_8Z",
  },
  {
    name: "최지인",
    url: "https://drive.google.com/drive/folders/1rtJ0ArnmyMukuEx_-slo0TKs16HAIiCU",
  },
  {
    name: "최형주",
    url: "https://drive.google.com/drive/folders/1B7MmexPLyCa5wXNrMFUacwztXe6ZsOAJ",
  },
] as const;

export const Route = createFileRoute("/_app/portfolio")({
  head: () => ({
    meta: [
      { title: "내 포트폴리오 | K-Move LMS" },
      { name: "description", content: "수강생별 Google Drive 포트폴리오 폴더" },
      { property: "og:title", content: "내 포트폴리오" },
      { property: "og:description", content: "수강생별 Google Drive 포트폴리오 폴더" },
    ],
  }),
  component: Portfolio,
});

function Portfolio() {
  return (
    <FolderCollection
      title="PORTFOLIO"
      rootFolderUrl={DRIVE_FOLDER_URL}
      folders={PORTFOLIO_FOLDERS}
      tone="yellow"
      listLabel="수강생 포트폴리오 폴더"
    />
  );
}
