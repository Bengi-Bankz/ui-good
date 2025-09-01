export function getUIScale(screenWidth: number): number {
  if (screenWidth >= 1400) return 1.0; // Desktop
  if (screenWidth >= 1100) return 0.85; // Laptop
  if (screenWidth >= 800) return 0.7; // Large Pop-out
  if (screenWidth >= 600) return 0.55; // Mobile Large
  if (screenWidth >= 450) return 0.4; // Mobile Medium
  if (screenWidth >= 350) return 0.25; // Mobile Small
  return 0.15; // Small Pop-out
}

export function isMobile(screenWidth: number): boolean {
  return screenWidth < 800;
}

// Add these helpers for portrait scaling
export function isMobilePortrait(
  screenWidth: number,
  screenHeight: number,
): boolean {
  return isMobile(screenWidth) && screenHeight > screenWidth;
}

export function getAdjustedScale(
  screenWidth: number,
  screenHeight: number,
): number {
  let scale = getUIScale(screenWidth);
  if (isMobilePortrait(screenWidth, screenHeight)) {
    scale *= 3; //
  }
  return scale;
}
