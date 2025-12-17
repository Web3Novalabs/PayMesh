// Admin address constant
export const ADMIN_ADDRESS =
  "0x07f41EEB3F8691F20a86A414b5670862a8c470ECE32d018e5c2fb1038F1bF836";

// Helper function to check if an address is the admin
export const isAdmin = (address: string | undefined): boolean => {
  if (!address) return false;
  // Normalize both addresses to lowercase for comparison
  return address.toLowerCase() === ADMIN_ADDRESS.toLowerCase();
};
