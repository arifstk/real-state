// lib/uploadImage.ts

import cloudinary from "@/lib/cloudinary";

export async function uploadImageToCloudinary(file: File, folder: string) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          transformation: [
            { width: 1200, crop: "limit" },
            { quality: "auto:good", fetch_format: "auto" },
          ],
        },
        (err: any, result: any) => {
          if (err) reject(err);
          else resolve({ url: result.secure_url, publicId: result.public_id });
        },
      )
      .end(buffer);
  });
}

export async function uploadMultipleImages(files: File[], folder: string) {
  const results = await Promise.all(
    files.map((file) => uploadImageToCloudinary(file, folder)),
  );
  return {
    urls: results.map((r) => r.url),
    publicIds: results.map((r) => r.publicId),
  };
}

export async function deleteCloudinaryImages(publicIds: string[] = []) {
  await Promise.all(
    publicIds.map((id) => cloudinary.uploader.destroy(id).catch(() => {})),
  );
}
