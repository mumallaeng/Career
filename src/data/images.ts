/**
 * Centralized image path management
 * All image paths should be defined here to avoid duplication
 */

export const imagePaths = {
  // Certificate images
  certificates: {
    computerSpecialist: '/images/cert-computer-specialist-front.jpg',
    pcTechnician: '/images/cert-pc-technician-front.jpg',
    networkAdministrator: '/images/cert-network-manager-front.jpg',
  },

  // Activity images (can be added as needed)
  activities: {
    // Add activity image paths here
  },
} as const;

export type ImagePaths = typeof imagePaths;
