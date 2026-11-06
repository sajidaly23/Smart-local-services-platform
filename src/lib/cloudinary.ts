import { v2 as cloudinary } from "cloudinary";

if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export interface UploadResult {
  url: string;
  publicId?: string;
}

export async function uploadMedia(
  fileBase64OrBuffer: string | Buffer,
  folder: string = "localconnect"
): Promise<UploadResult> {
  const isCloudinaryConfigured =
    Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
    Boolean(process.env.CLOUDINARY_API_KEY) &&
    Boolean(process.env.CLOUDINARY_API_SECRET);

  if (!isCloudinaryConfigured) {
    // Graceful fallback for local development & demonstration when Cloudinary credentials are not configured
    if (typeof fileBase64OrBuffer === "string" && fileBase64OrBuffer.startsWith("data:")) {
      return {
        url: fileBase64OrBuffer,
        publicId: `mock_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      };
    }

    const base64Data =
      typeof fileBase64OrBuffer === "string"
        ? fileBase64OrBuffer
        : fileBase64OrBuffer.toString("base64");
    return {
      url: `data:image/jpeg;base64,${base64Data}`,
      publicId: `mock_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    };
  }

  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: `localconnect/${folder}`,
      resource_type: "auto" as const,
    };

    if (typeof fileBase64OrBuffer === "string") {
      cloudinary.uploader.upload(fileBase64OrBuffer, uploadOptions, (err, res) => {
        if (err || !res) return reject(err || new Error("Cloudinary upload failed"));
        resolve({
          url: res.secure_url,
          publicId: res.public_id,
        });
      });
    } else {
      const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (err, res) => {
        if (err || !res) return reject(err || new Error("Cloudinary upload failed"));
        resolve({
          url: res.secure_url,
          publicId: res.public_id,
        });
      });
      uploadStream.end(fileBase64OrBuffer);
    }
  });
}

export default cloudinary;

