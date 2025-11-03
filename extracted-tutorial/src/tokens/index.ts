import tokens from "../../design-tokens.json"

export const colors = {
  primary: tokens.color.primary.value,
  secondary: tokens.color.secondary.value,
  accent: tokens.color.accent.value,
  success: tokens.color.success.value,
  warning: tokens.color.warning.value,
  error: tokens.color.error.value,
  background: {
    primary: tokens.color.background.primary.value,
    secondary: tokens.color.background.secondary.value,
    tertiary: tokens.color.background.tertiary.value,
  },
  surface: {
    primary: tokens.color.surface.primary.value,
    secondary: tokens.color.surface.secondary.value,
    elevated: tokens.color.surface.elevated.value,
  },
  text: {
    primary: tokens.color.text.primary.value,
    secondary: tokens.color.text.secondary.value,
    tertiary: tokens.color.text.tertiary.value,
    inverse: tokens.color.text.inverse.value,
  },
  border: {
    primary: tokens.color.border.primary.value,
    secondary: tokens.color.border.secondary.value,
    focus: tokens.color.border.focus.value,
  },
}

export const spacing = {
  xs: tokens.spacing.xs.value,
  sm: tokens.spacing.sm.value,
  md: tokens.spacing.md.value,
  lg: tokens.spacing.lg.value,
  xl: tokens.spacing.xl.value,
  "2xl": tokens.spacing["2xl"].value,
  "3xl": tokens.spacing["3xl"].value,
}

export const typography = {
  fontSize: {
    xs: tokens.typography.fontSize.xs.value,
    sm: tokens.typography.fontSize.sm.value,
    base: tokens.typography.fontSize.base.value,
    lg: tokens.typography.fontSize.lg.value,
    xl: tokens.typography.fontSize.xl.value,
    "2xl": tokens.typography.fontSize["2xl"].value,
    "3xl": tokens.typography.fontSize["3xl"].value,
    "4xl": tokens.typography.fontSize["4xl"].value,
    "5xl": tokens.typography.fontSize["5xl"].value,
  },
  fontWeight: {
    regular: tokens.typography.fontWeight.regular.value,
    medium: tokens.typography.fontWeight.medium.value,
    semibold: tokens.typography.fontWeight.semibold.value,
    bold: tokens.typography.fontWeight.bold.value,
  },
  lineHeight: {
    tight: tokens.typography.lineHeight.tight.value,
    normal: tokens.typography.lineHeight.normal.value,
    relaxed: tokens.typography.lineHeight.relaxed.value,
  },
}

export const borderRadius = {
  sm: tokens.borderRadius.sm.value,
  md: tokens.borderRadius.md.value,
  lg: tokens.borderRadius.lg.value,
  xl: tokens.borderRadius.xl.value,
  full: tokens.borderRadius.full.value,
}

export const shadow = tokens.shadow

export const breakpoints = {
  mobile: tokens.breakpoints.mobile.value,
  tablet: tokens.breakpoints.tablet.value,
  desktop: tokens.breakpoints.desktop.value,
  wide: tokens.breakpoints.wide.value,
}
