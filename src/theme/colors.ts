// Paleta do tema claro. Contrastes (WCAG) conferidos com o script
// scripts/check-contrast.js; todos os pares de texto ficam >= 4.5:1.
export const colors = {
  background: '#F4F6FA',
  surface: '#FFFFFF',
  text: '#1A2433',
  textMuted: '#4A5568',
  textOnPrimary: '#FFFFFF',
  primary: '#1D4ED8',
  primarySoft: '#E3EBFF',
  border: '#CBD2DC',
  danger: '#B42318',
  dangerSoft: '#FDECEA',
  favorite: '#C2185B',
  success: '#146C34',
  successSoft: '#E5F4EA',
  star: '#A15C00',
  placeholder: '#E2E7EF',
  shadow: '#0B1A33',
} as const;

export type ColorName = keyof typeof colors;
