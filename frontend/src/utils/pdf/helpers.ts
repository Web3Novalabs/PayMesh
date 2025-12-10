export const getLogoDataUrl = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    // Create an image element to load the SVG
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        } else {
          resolve(null);
        }
      };
      img.onerror = () => {
        console.error("Failed to load PDF logo image");
        resolve(null);
      };
      img.src = URL.createObjectURL(blob);
    });
  } catch (error) {
    console.error("Error fetching PDF logo:", error);
    return null;
  }
};
