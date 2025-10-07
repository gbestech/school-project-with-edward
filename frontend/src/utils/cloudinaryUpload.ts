export const uploadToCloudinary = async (file: File): Promise<string> => {
  if (!file) throw new Error("No file selected");

  const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/djbz7wunu/image/upload";
  const UPLOAD_PRESET = "school_logo_preset"; // create this in Cloudinary dashboard

  const formData = new FormData();
  formData.append("folder", "school_logos");
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(CLOUDINARY_URL, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Cloudinary upload failed");
  }

  return data.secure_url; // ✅ This is the hosted image URL
};
