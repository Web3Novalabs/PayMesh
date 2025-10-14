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

// Generate a deterministic short ID from a pool ID
export const generateShortIdFromPoolId = (
  poolId: string | undefined
): string => {
  // Handle undefined/null/empty values - generate a random ID as fallback
  if (
    poolId === undefined ||
    poolId === null ||
    poolId === "" ||
    poolId === "undefined" ||
    poolId === "null" ||
    String(poolId).includes("undefined")
  ) {
    return generateShortId(8);
  }

  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  // Create a better hash with more variety
  let hash1 = 0;
  let hash2 = 0;

  for (let i = 0; i < poolId.length; i++) {
    const char = poolId.charCodeAt(i);
    hash1 = (hash1 << 5) - hash1 + char;
    hash1 = hash1 & hash1; // Convert to 32bit integer
    hash2 = hash2 * 31 + char;
    hash2 = hash2 & hash2;
  }

  // Use both hashes to generate more variety
  let result = "";
  let h1 = Math.abs(hash1);
  let h2 = Math.abs(hash2);

  for (let i = 0; i < 8; i++) {
    // Alternate between the two hashes and add position-based variation
    const combinedHash = (h1 + h2 + i * 17) % chars.length;
    const charAtIndex = chars[combinedHash];

    // Safety check: ensure we have a valid character
    if (charAtIndex === undefined || charAtIndex === null) {
      result += chars[0]; // Fallback to first character
    } else {
      result += charAtIndex;
    }

    // Rotate the hashes
    h1 = (h1 >>> 1) ^ (h1 << 3);
    h2 = (h2 >>> 2) ^ (h2 << 2);
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
