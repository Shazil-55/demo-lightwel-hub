export const setFontSize = () => {
  const baseFontSize = 62.5;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // Calculate scale factor based on 1080p baseline
  let scaleFactor = Math.min(screenWidth / 1920, screenHeight / 1080);

  if (screenHeight > screenWidth) {
    scaleFactor = Math.min(screenHeight / 1920, screenWidth / 1080);
  }

  document.documentElement.style.fontSize = `${baseFontSize * scaleFactor}%`;
};