// Helper to load image and convert to PNG data URL with high resolution
export const getLogoDataUrl = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const img = new Image();
    const urlObj = URL.createObjectURL(blob);

    return new Promise((resolve) => {
      img.onload = () => {
        // Scale up for better quality (no shrinking/blur)
        const scale = 4;
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.scale(scale, scale);
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        } else {
          resolve(null);
        }
        URL.revokeObjectURL(urlObj);
      };
      img.onerror = () => resolve(null);
      img.src = urlObj;
    });
  } catch (error) {
    console.error("Error loading logo:", error);
    return null;
  }
};
