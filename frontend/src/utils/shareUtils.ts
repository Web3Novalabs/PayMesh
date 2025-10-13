// Share utilities for PayMesh campaigns
export const generateShortId = (length: number = 8): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const createShareUrl = (originalId: string): string => {
  const timestamp = Date.now().toString(36);
  const shortId = generateShortId(6);
  const uniqueId = `${shortId}${timestamp}`;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  return `${baseUrl}/share/crowdfund/${uniqueId}/${originalId}`;
};

export const encodeShareId = (originalId: string): string => {
  const timestamp = Date.now().toString(36);
  const data = `${originalId}_${timestamp}`;
  return btoa(data);
};

export const decodeShareId = (shareId: string): string => {
  try {
    const decoded = atob(shareId);
    const [originalId] = decoded.split("_");
    return originalId;
  } catch (error) {
    console.error("Error decoding share ID:", error);
    return "";
  }
};

export const getShareText = (campaignTitle: string): string => {
  return `Check out this amazing crowdfunding campaign: ${campaignTitle}! Support the cause on PayMesh 🚀 #Crowdfunding #Starknet #PayMesh`;
};

export const getWhatsAppText = (
  campaignTitle: string,
  shareUrl: string
): string => {
  return `Check out this crowdfunding campaign: ${campaignTitle}! ${shareUrl}`;
};

export const getTwitterShareUrl = (text: string, url: string): string => {
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);
  return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
};

export const getWhatsAppShareUrl = (text: string): string => {
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/?text=${encodedText}`;
};

export const getTelegramShareUrl = (text: string, url: string): string => {
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);
  return `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
};

export const getLinkedInShareUrl = (
  url: string,
  title: string,
  summary: string
): string => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedSummary = encodeURIComponent(summary);
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedSummary}`;
};

export const getFacebookShareUrl = (url: string): string => {
  const encodedUrl = encodeURIComponent(url);
  return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
};
