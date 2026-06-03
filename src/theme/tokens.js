/**
 * ChatKroo design tokens.
 *
 * Single source of truth for color, radius, elevation, and the brand gradient.
 * The MUI theme (see ThemeContext) is built from these. Dark-mode-first values
 * follow modern chat-UI research: dark-grey (not pure-black) surfaces, off-white
 * (not pure-white) text, a desaturated violet *action* color, and solid
 * (not gradient) message bubbles.
 */

// Brand — indigo/violet ramp. 400 is the desaturated dark-mode action color.
export const brand = {
  50: "#eef1ff",
  100: "#e0e5ff",
  200: "#c6ceff",
  300: "#a3b0fc",
  400: "#7c83ff", // dark-mode primary (approved accent)
  500: "#667eea", // light-mode primary (established brand)
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

// Neutrals — one cool-gray scale spanning light surfaces to dark canvas.
export const neutral = {
  0: "#ffffff",
  50: "#f6f7f9",
  100: "#eceef2", // dark-mode primary text
  200: "#e2e5eb",
  300: "#cbd0da",
  400: "#9aa0ad", // dark-mode secondary text
  500: "#6b7280",
  600: "#4b5263",
  700: "#343a49",
  800: "#20222b", // dark elevated surface / received bubble
  850: "#16171c", // dark paper
  900: "#0e0f13", // dark canvas / light-mode primary text
  950: "#0a0b0f",
};

// Semantic colors (presence/status). Green stays reserved for "online".
export const semantic = {
  success: { light: "#10b981", dark: "#34d399" },
  warning: { light: "#f59e0b", dark: "#fbbf24" },
  error: { light: "#ef4444", dark: "#f87171" },
  info: { light: "#3b82f6", dark: "#60a5fa" },
};

// Message bubble fills — solid, mode-aware. Sent uses the action color.
export const bubble = {
  sent: { dark: "#4f54cf", light: "#667eea" }, // white text on both
  received: { dark: "#20222b", light: "#f1f2f6" },
};

// The signature ChatKroo gradient — reserved for brand marks/logos only.
export const brandGradient = `linear-gradient(135deg, ${brand[500]} 0%, ${accent[500]} 100%)`;
export const brandGradientHover = `linear-gradient(135deg, ${brand[600]} 0%, ${accent[600]} 100%)`;

export const radii = { sm: 8, md: 12, lg: 16, xl: 24, bubble: 18, pill: 999 };

// Brand-tinted elevation — never pure black shadows.
export const shadows = {
  brand: "0 8px 24px rgba(102, 126, 234, 0.28)",
  brandStrong: "0 12px 32px rgba(102, 126, 234, 0.40)",
  soft: "0 2px 8px rgba(10, 11, 15, 0.10)",
  card: "0 6px 24px rgba(10, 11, 15, 0.14)",
  popup: "0 18px 48px rgba(0, 0, 0, 0.45)",
};

export const fontStack =
  '-apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const easing = "cubic-bezier(0.16, 1, 0.3, 1)";
