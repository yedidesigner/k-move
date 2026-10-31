export const FEEDBACK_FILE_BUCKET = "kmove-feedback-files";
export const FEEDBACK_FILE_LIMIT = 10 * 1024 * 1024;
export const FEEDBACK_FILE_ACCEPT = ".pdf,.zip,.txt,.docx,.pptx,.xlsx,.psd,.ai,.fig";
export const FEEDBACK_IMAGE_BUCKET = "kmove-feedback-screenshots";
export const FEEDBACK_IMAGE_LIMIT = 10 * 1024 * 1024;
export const FEEDBACK_UPLOAD_ACCEPT = ".jpg,.jpeg,.png,.webp," + FEEDBACK_FILE_ACCEPT;

const IMAGE_TYPES: Record<string, { extension: string; mimeType: string }> = {
  jpg: { extension: "jpg", mimeType: "image/jpeg" },
  jpeg: { extension: "jpg", mimeType: "image/jpeg" },
  png: { extension: "png", mimeType: "image/png" },
  webp: { extension: "webp", mimeType: "image/webp" },
};

const TYPES: Record<string, { canonical: string; accepted: string[] }> = {
  pdf: { canonical: "application/pdf", accepted: ["application/pdf"] },
  zip: {
    canonical: "application/zip",
    accepted: ["application/zip", "application/x-zip-compressed"],
  },
  txt: { canonical: "text/plain", accepted: ["text/plain"] },
  docx: {
    canonical: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    accepted: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  },
  pptx: {
    canonical: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    accepted: ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
  },
  xlsx: {
    canonical: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    accepted: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  },
  psd: {
    canonical: "image/vnd.adobe.photoshop",
    accepted: ["image/vnd.adobe.photoshop", "image/psd", "application/photoshop"],
  },
  ai: {
    canonical: "application/postscript",
    accepted: ["application/postscript", "application/pdf", "application/illustrator"],
  },
  fig: { canonical: "application/octet-stream", accepted: ["application/octet-stream"] },
};

/** Extension allowlist plus MIME consistency, with browser-unknown MIME supported. */
export function validateFeedbackFile(file: Pick<File, "name" | "size" | "type">) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const entry = TYPES[extension];
  if (!entry)
    throw new Error("PDF, ZIP, TXT, DOCX, PPTX, XLSX, PSD, AI, FIG 파일을 선택해 주세요.");
  if (file.name.length > 240) throw new Error("파일명은 240자 이하로 줄여 주세요.");
  if (file.size <= 0) throw new Error("내용이 없는 파일은 업로드할 수 없습니다.");
  if (file.size > FEEDBACK_FILE_LIMIT)
    throw new Error("파일당 최대 크기는 10MB입니다. 더 큰 파일은 Drive 링크로 제출해 주세요.");
  const mime = file.type.toLowerCase();
  if (mime && mime !== "application/octet-stream" && !entry.accepted.includes(mime)) {
    throw new Error("파일 확장자와 형식이 일치하지 않습니다.");
  }
  return { extension, mimeType: entry.canonical };
}

/** One picker, with raster images kept in their existing annotated-image storage. */
export function validateFeedbackUpload(file: Pick<File, "name" | "size" | "type">): {
  kind: "image" | "file";
  extension: string;
  mimeType: string;
} {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const imageType = Object.hasOwn(IMAGE_TYPES, extension) ? IMAGE_TYPES[extension] : undefined;
  if (imageType) {
    if (file.name.length > 240) throw new Error("파일명은 240자 이하로 줄여 주세요.");
    if (file.size <= 0) throw new Error("내용이 없는 파일은 업로드할 수 없습니다.");
    if (file.size > FEEDBACK_IMAGE_LIMIT)
      throw new Error("이미지당 최대 크기는 10MB입니다. 더 큰 파일은 Drive 링크로 제출해 주세요.");
    const mime = file.type.toLowerCase();
    if (mime && mime !== "application/octet-stream" && mime !== imageType.mimeType)
      throw new Error("파일 확장자와 형식이 일치하지 않습니다.");
    return { kind: "image", ...imageType };
  }
  if (!Object.hasOwn(TYPES, extension))
    throw new Error(
      "JPG, JPEG, PNG, WebP, PDF, ZIP, TXT, DOCX, PPTX, XLSX, PSD, AI, FIG 파일을 선택해 주세요.",
    );
  return { kind: "file", ...validateFeedbackFile(file) };
}

export function normalizeFeedbackUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("https://로 시작하는 올바른 링크를 입력해 주세요.");
  }
  if (
    !["https:", "http:"].includes(url.protocol) ||
    !url.hostname ||
    url.username ||
    url.password
  ) {
    throw new Error("로그인 정보가 포함되지 않은 http 또는 https 링크만 등록할 수 있습니다.");
  }
  if (url.href.length > 2048) throw new Error("링크는 2,048자 이하로 입력해 주세요.");
  return url.href;
}

export function feedbackFileSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.ceil(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
