/**
 * Course roster in the instructor-provided order.
 * Folder names, parents, and URLs verified in Google Drive on 2026-11-01 (Asia/Seoul).
 * Keep assignment and portfolio destinations together when adding a student.
 * These links preserve Drive permissions; an LMS account does not grant Drive access.
 */
export const ASSIGNMENT_ROOT_FOLDER_URL =
  "https://drive.google.com/drive/folders/18XvFZNIwIua9fNcXyOYiRIkI2SD3eDV3";
export const PORTFOLIO_ROOT_FOLDER_URL =
  "https://drive.google.com/drive/folders/1ylEME231wJeG9okmvJaPjKtGO_kccfAo";

export const STUDENT_ROSTER = [
  {
    name: "강민주",
    assignmentFolderUrl: "https://drive.google.com/drive/folders/15pDTL2AOKxT5ox0jwhVjELXXX7xs4VxK",
    portfolioFolderUrl: "https://drive.google.com/drive/folders/1uIltriVH0Mold8YEIoG9pAnDGemphiw7",
  },
  {
    name: "강유민",
    assignmentFolderUrl: "https://drive.google.com/drive/folders/1k7kbm1Z_JEvulNaPRAU2N9Fo2kf3xLVK",
    portfolioFolderUrl: "https://drive.google.com/drive/folders/1hSNqfJV2hnOK0V3TgsG8OWK8JLuxeQ1V",
  },
  {
    name: "김다혜",
    assignmentFolderUrl: "https://drive.google.com/drive/folders/1Wu-Ol-QUj5Uqr3-0QghisSTMZnGoM1dr",
    portfolioFolderUrl: "https://drive.google.com/drive/folders/1c_oP7ogffUa2seOaBRXbMjPQ-j_j9oMN",
  },
  {
    name: "김선미",
    assignmentFolderUrl: "https://drive.google.com/drive/folders/1QPoJQIJ1p8uIZMRABklH9argqleATVOu",
    portfolioFolderUrl: "https://drive.google.com/drive/folders/1kofukYo48gOmCSuXfekY0UjRZ8lmlKvO",
  },
  {
    name: "김재은",
    assignmentFolderUrl: "https://drive.google.com/drive/folders/1F9EUzBjHxESVDOP_wdLsWN8EqCOeTkhF",
    portfolioFolderUrl: "https://drive.google.com/drive/folders/1v_z1FXGbG63qe-exLS208xkuJvXOFtmw",
  },
  {
    name: "김화민",
    assignmentFolderUrl: "https://drive.google.com/drive/folders/1ubIsXE7gUOF9Br2TWdKgwRy_D1ca1GTq",
    portfolioFolderUrl: "https://drive.google.com/drive/folders/1OYeHNIvnmiYuy8jLaLSO4IbvBPA0rjqA",
  },
  {
    name: "류영진",
    assignmentFolderUrl: "https://drive.google.com/drive/folders/1aMQYe44beRsMMjN_2ghuQClchBHh-FTy",
    portfolioFolderUrl: "https://drive.google.com/drive/folders/1jzN0-MoUgK-yXkawKWSUka1W8oGPrUbL",
  },
  {
    name: "오한별",
    assignmentFolderUrl: "https://drive.google.com/drive/folders/13-BiQO6b27PhIagGr9gNeFFpSOZARkHg",
    portfolioFolderUrl: "https://drive.google.com/drive/folders/1T-piMLnWanag10eNjckoBV-pl7F9GWGE",
  },
  {
    name: "이익제",
    assignmentFolderUrl: "https://drive.google.com/drive/folders/1Wy9woGNpKZkZCb5Q9YhuAqKfD3_Kqami",
    portfolioFolderUrl: "https://drive.google.com/drive/folders/1tBlvGIex0LEATZSHdxcNpoum7GkQC1E3",
  },
  {
    name: "이주희",
    assignmentFolderUrl: "https://drive.google.com/drive/folders/1pqoJ0DmYkFC23HsLr_JW_Oc9EWmQi5kH",
    portfolioFolderUrl: "https://drive.google.com/drive/folders/1W_b8GxAH5DnMw_hUPqHZlYctfa9J4pSX",
  },
  {
    name: "이지원",
    assignmentFolderUrl: "https://drive.google.com/drive/folders/1ZmobVXPLJobvaE-kBjHsd6d4bjFA-q8N",
    portfolioFolderUrl: "https://drive.google.com/drive/folders/1QQr3DGBcrUSZbFXQb0jhVlsM_XSaUFBA",
  },
  {
    name: "임시윤",
    assignmentFolderUrl: "https://drive.google.com/drive/folders/1nR6NByuBQLM8QSveeUzbL5ok31td7P5F",
    portfolioFolderUrl: "https://drive.google.com/drive/folders/1CxbXVpFQ1hhoDze16_4YEGSsNujK3H-C",
  },
  {
    name: "정여진",
    assignmentFolderUrl: "https://drive.google.com/drive/folders/1bhLZlLg-b_ZCL4of22s6pzgOxeFQVd1Y",
    portfolioFolderUrl: "https://drive.google.com/drive/folders/16MJddJAQxgqDjRDHXRaTA4e8nsZ19_8Z",
  },
  {
    name: "최지인",
    assignmentFolderUrl: "https://drive.google.com/drive/folders/146rRpAXBjC5KRXubcILdS7mC4ro1TJv2",
    portfolioFolderUrl: "https://drive.google.com/drive/folders/1rtJ0ArnmyMukuEx_-slo0TKs16HAIiCU",
  },
  {
    name: "최형주",
    assignmentFolderUrl: "https://drive.google.com/drive/folders/10CHEEUhAuNy4c_HOsTx9VRnYfzkWPade",
    portfolioFolderUrl: "https://drive.google.com/drive/folders/1B7MmexPLyCa5wXNrMFUacwztXe6ZsOAJ",
  },
] as const;

export const STUDENT_NAMES = STUDENT_ROSTER.map(({ name }) => name);

export const ASSIGNMENT_FOLDERS = STUDENT_ROSTER.map(({ name, assignmentFolderUrl }) => ({
  name,
  url: assignmentFolderUrl,
}));

export const PORTFOLIO_FOLDERS = STUDENT_ROSTER.map(({ name, portfolioFolderUrl }) => ({
  name,
  url: portfolioFolderUrl,
}));
