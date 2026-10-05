export const Typography = {
  // Font sizes
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 30,
  xxxl: 40,

  // Line heights
  lineHeightSm: 18,
  lineHeightBase: 22,
  lineHeightMd: 26,
  lineHeightLg: 30,

  // Font weights (React Native uses string literals)
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
};

export const FontFamily = {
  // System default (will be overridden by Expo fonts)
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
};
