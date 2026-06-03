/**
 * ChatKroo design tokens.
 *
 * Single source of truth for color, radius, elevation, and the brand gradient.
 * The MUI theme (see ThemeContext) is built from these so the violet brand stays
 * consistent and intentional across light and dark modes instead of being
 * re-declared as ad-hoc inline gradients all over the app.
 */

// Brand — indigo/violet ramp (the established ChatKroo identity, harmonized).
export const brand = {
  50: "#eef1ff",
  100: "#e0e5ff",
  200: "#c6ceff",
  300: "#a3b0fc",
  400: "#7f8cf6",
  500: "#667eea",
  600: "#5566d6",
  700: "#4650b8",
  800: "#3a4494",
  900: "#333c76",
};

// Secondary accent — the violet end of the signature gradient.
export const accent = {
  300: "#b088cf",
  400: "#9568b8",
  500: "#764ba2",
  600: "#623d85",
  700: "#502f6e",
};

// Neutrals — a single cool-gray (zinc) scale; no warm/cool mixing.
export const neutral = {
  0: "#ffffff",
  50: "#f7f8fa",
  100: "#eef0f4",
  200: "#e2e5eb",
  300: "#cbd0da",
  400: "#9aa1b2",
  500: "#6b7280",
  600: "#4b5263",
  700: "#343a49",
  800: "#1e2230",
  850: "#171a26",
  900: "#11131d",
  950: "#0a0b12",
};

// Semantic colors (presence/status). Green stays reserved for "online".
export const semantic = {
  success: { light: "#10b981", dark: "#34d399" },
  warning: { light: "#f59e0b", dark: "#fbbf24" },
  error: { light: "#ef4444", dark: "#f87171" },
  info: { light: "#3b82f6", dark: "#60a5fa" },
};

// The signature ChatKroo gradient — defined once, referenced everywhere.
export const brandGradient = `linear-gradient(135deg, ${brand[500]} 0%, ${accent[500]} 100%)`;
export const brandGradientHover = `linear-gradient(135deg, ${brand[600]} 0%, ${accent[600]} 100%)`;

export const radii = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 };

// Brand-tinted elevation — never pure black shadows.
export const shadows = {
  brand: "0 8px 24px rgba(102, 126, 234, 0.28)",
  brandStrong: "0 12px 32px rgba(102, 126, 234, 0.40)",
  soft: "0 2px 8px rgba(17, 19, 29, 0.08)",
  card: "0 6px 24px rgba(17, 19, 29, 0.10)",
};

export const fontStack =
  'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
