/**
 * Shrinks an attached photo before it is stored.
 *
 * Attached photos are thumbnails, not originals: they are displayed at 34–72px
 * and they have to survive being base64'd into a backup file, where they cost
 * ~33% more than on disk. A modern phone photo is 3–5 MB, so storing originals
 * would make a year of food photos a backup nobody can email.
 *
 * 480px longest edge at JPEG 0.7 is the same downsample the iOS app used.
 */

const MAX_EDGE = 480;
const QUALITY = 0.7;

export async function downsizeImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", QUALITY),
    );
    // If the browser refuses to encode, the original is still better than
    // silently dropping the photo the user just picked.
    return blob ?? file;
  } finally {
    bitmap.close();
  }
}
