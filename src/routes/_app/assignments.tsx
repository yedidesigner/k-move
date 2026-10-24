import { createFileRoute } from "@tanstack/react-router";
import { FolderCollection } from "@/components/FolderCollection";

const DRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/18XvFZNIwIua9fNcXyOYiRIkI2SD3eDV3";

// Dedicated assignment folders verified in the course's Google Drive folder.
const ASSIGNMENT_FOLDERS = [
  {
    name: "강민주",
    url: "https://drive.google.com/drive/folders/15pDTL2AOKxT5ox0jwhVjELXXX7xs4VxK",
  },
  {
    name: "강유민",
    url: "https://drive.google.com/drive/folders/1k7kbm1Z_JEvulNaPRAU2N9Fo2kf3xLVK",
  },
  {
    name: "김다혜",
    url: "https://drive.google.com/drive/folders/1Wu-Ol-QUj5Uqr3-0QghisSTMZnGoM1dr",
  },
  {
    name: "김선미",
    url: "https://drive.google.com/drive/folders/1QPoJQIJ1p8uIZMRABklH9argqleATVOu",
  },
  {
    name: "김화민",
    url: "https://drive.google.com/drive/folders/1ubIsXE7gUOF9Br2TWdKgwRy_D1ca1GTq",
  },
  {
    name: "류영진",
    url: "https://drive.google.com/drive/folders/1aMQYe44beRsMMjN_2ghuQClchBHh-FTy",
  },
  {
    name: "오한별",
    url: "https://drive.google.com/drive/folders/13-BiQO6b27PhIagGr9gNeFFpSOZARkHg",
  },
  {
    name: "이익제",
    url: "https://drive.google.com/drive/folders/1Wy9woGNpKZkZCb5Q9YhuAqKfD3_Kqami",
  },
  {
    name: "이주희",
    url: "https://drive.google.com/drive/folders/1pqoJ0DmYkFC23HsLr_JW_Oc9EWmQi5kH",
  },
  {
    name: "이지원",
    url: "https://drive.google.com/drive/folders/1ZmobVXPLJobvaE-kBjHsd6d4bjFA-q8N",
  },
  {
    name: "임시윤",
    url: "https://drive.google.com/drive/folders/1nR6NByuBQLM8QSveeUzbL5ok31td7P5F",
  },
  {
    name: "정여진",
    url: "https://drive.google.com/drive/folders/1bhLZlLg-b_ZCL4of22s6pzgOxeFQVd1Y",
  },
  {
    name: "최지인",
    url: "https://drive.google.com/drive/folders/146rRpAXBjC5KRXubcILdS7mC4ro1TJv2",
  },
  {
    name: "최형주",
    url: "https://drive.google.com/drive/folders/10CHEEUhAuNy4c_HOsTx9VRnYfzkWPade",
  },
] as const;

export const Route = createFileRoute("/_app/assignments")({
  head: () => ({
    meta: [
      { title: "과제 | K-Move LMS" },
      { name: "description", content: "수강생별 Google Drive 과제 폴더" },
      { property: "og:title", content: "과제" },
      { property: "og:description", content: "수강생별 Google Drive 과제 폴더" },
    ],
  }),
  component: Assignments,
});

function Assignments() {
  return (
    <FolderCollection
      title="ASSIGNMENTS"
      rootFolderUrl={DRIVE_FOLDER_URL}
      folders={ASSIGNMENT_FOLDERS}
      tone="sky"
      listLabel="수강생 과제 폴더"
    />
  );
}
