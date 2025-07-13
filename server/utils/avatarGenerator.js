const generateAvatar = (username) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#F4D03F'
  ];
  
  const backgrounds = [
    '#FFE5E5', '#E5F9F6', '#E5F4FD', '#F0F8F0', '#FFF8E1',
    '#F3E5F5', '#E8F5E8', '#FEF9E7', '#F4F0F8', '#EBF3FD',
    '#FDF2E9', '#EAFAF1', '#FDEDEC', '#EBF3FD', '#FCF3CF'
  ];

  // Generate consistent color based on username
  const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorIndex = hash % colors.length;
  const backgroundIndex = hash % backgrounds.length;
  
  const initials = username.slice(0, 2).toUpperCase();
  
  // Create SVG avatar
  const svgAvatar = `
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="${backgrounds[backgroundIndex]}" stroke="${colors[colorIndex]}" stroke-width="2"/>
      <text x="20" y="25" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="${colors[colorIndex]}">${initials}</text>
    </svg>
  `;
  
  // Convert to data URL
  const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svgAvatar).toString('base64')}`;
  
  return dataUrl;
};

module.exports = {
  generateAvatar
};
