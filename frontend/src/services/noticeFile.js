const ALLOWED_EXTENSIONS = ["pdf", "png", "jpg", "jpeg"];
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
]);

export const MAX_NOTICE_BYTES = 10 * 1024 * 1024;

function extensionOf(name) {
  const parts = name.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() : "";
}

export function validateNoticeFile(file) {
  if (!file) {
    return { ok: false, message: "Choose a notice file to continue." };
  }

  const extension = extensionOf(file.name);
  const typeAllowed = ALLOWED_TYPES.has(file.type);
  const extensionAllowed = ALLOWED_EXTENSIONS.includes(extension);
  const typeMissing = !file.type || file.type === "application/octet-stream";

  if (!typeAllowed && !(typeMissing && extensionAllowed)) {
    return {
      ok: false,
      message: "Please choose a PDF, PNG, JPG, or JPEG file.",
    };
  }

  if (file.size === 0) {
    return {
      ok: false,
      message: "That file is empty. Choose a notice with content.",
    };
  }

  if (file.size > MAX_NOTICE_BYTES) {
    return {
      ok: false,
      message: "This file is larger than 10 MB. Choose a smaller notice.",
    };
  }

  return { ok: true };
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
  }
  const megabytes = bytes / (1024 * 1024);
  return `${megabytes.toFixed(megabytes >= 10 ? 0 : 1)} MB`;
}

export function isImageFile(file) {
  if (!file) return false;
  const ext = extensionOf(file.name);
  return file.type.startsWith("image/") || ["png", "jpg", "jpeg"].includes(ext);
}

export function isPdfFile(file) {
  if (!file) return false;
  const ext = extensionOf(file.name);
  return file.type === "application/pdf" || ext === "pdf";
}
