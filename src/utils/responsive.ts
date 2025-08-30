/**
 * Responsive design utilities for AI Website Builder
 * Supports screen sizes from 4.7" (iPhone SE) to large desktop displays
 */

import React from 'react';

// Screen size definitions based on physical dimensions and common devices
export const BREAKPOINTS = {
  // Mobile devices (4.7" to 6.7")
  'xs': 320,   // 4.7" iPhone SE (portrait)
  'sm': 375,   // 5.4" iPhone 12 Mini (portrait) 
  'md': 414,   // 6.1" iPhone 12/13/14 (portrait)
  'lg': 428,   // 6.7" iPhone 12/13/14 Pro Max (portrait)
  
  // Large mobile/small tablet (landscape mobile, small tablets)
  'xl': 768,   // 7.9" iPad Mini, large mobile landscape
  
  // Tablet sizes
  '2xl': 820,  // 10.9" iPad Air (portrait)
  '3xl': 1024, // 12.9" iPad Pro (portrait), general tablet landscape
  
  // Desktop and laptop sizes
  '4xl': 1280, // Small laptops, large tablets landscape
  '5xl': 1440, // Standard desktop monitors
  '6xl': 1920, // Full HD displays
  '7xl': 2560, // 2K displays
  '8xl': 3840, // 4K displays
} as const;

// Device-specific breakpoints with physical screen information
export const DEVICE_BREAKPOINTS = {
  mobile: {
    small: { width: 320, height: 568, name: 'iPhone SE 4.7"' },
    medium: { width: 375, height: 667, name: 'iPhone 8 4.7"' },
    large: { width: 414, height: 896, name: 'iPhone 11 Pro 5.8"' },
    extraLarge: { width: 428, height: 926, name: 'iPhone 14 Pro Max 6.7"' },
  },
  tablet: {
    small: { width: 768, height: 1024, name: 'iPad Mini 7.9"' },
    medium: { width: 820, height: 1180, name: 'iPad Air 10.9"' },
    large: { width: 1024, height: 1366, name: 'iPad Pro 12.9"' },
  },
  desktop: {
    small: { width: 1280, height: 720, name: '13" MacBook' },
    medium: { width: 1440, height: 900, name: '15" MacBook' },
    large: { width: 1920, height: 1080, name: '21.5" iMac' },
    extraLarge: { width: 2560, height: 1440, name: '27" iMac' },
    ultraWide: { width: 3440, height: 1440, name: '34" Ultrawide' },
    fourK: { width: 3840, height: 2160, name: '4K Display' },
  },
} as const;

// Responsive font sizes based on screen size
export const FONT_SCALES = {
  xs: {
    text: { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24 },
    heading: { sm: 16, base: 18, lg: 20, xl: 24, '2xl': 28, '3xl': 32 },
  },
  sm: {
    text: { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24 },
    heading: { sm: 18, base: 20, lg: 24, xl: 28, '2xl': 32, '3xl': 36 },
  },
  md: {
    text: { xs: 14, sm: 16, base: 18, lg: 20, xl: 24, '2xl': 28 },
    heading: { sm: 20, base: 24, lg: 28, xl: 32, '2xl': 36, '3xl': 42 },
  },
  lg: {
    text: { xs: 14, sm: 16, base: 18, lg: 20, xl: 24, '2xl': 28 },
    heading: { sm: 24, base: 28, lg: 32, xl: 36, '2xl': 42, '3xl': 48 },
  },
  xl: {
    text: { xs: 16, sm: 18, base: 20, lg: 24, xl: 28, '2xl': 32 },
    heading: { sm: 28, base: 32, lg: 36, xl: 42, '2xl': 48, '3xl': 56 },
  },
  '2xl': {
    text: { xs: 16, sm: 18, base: 20, lg: 24, xl: 28, '2xl': 32 },
    heading: { sm: 32, base: 36, lg: 42, xl: 48, '2xl': 56, '3xl': 64 },
  },
} as const;

// Spacing scales for different screen sizes
export const SPACING_SCALES = {
  xs: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24 },
  sm: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32 },
  md: { xs: 6, sm: 12, md: 16, lg: 24, xl: 32, '2xl': 40 },
  lg: { xs: 8, sm: 16, md: 24, lg: 32, xl: 40, '2xl': 48 },
  xl: { xs: 12, sm: 20, md: 32, lg: 48, xl: 64, '2xl': 80 },
  '2xl': { xs: 16, sm: 24, md: 40, lg: 64, xl: 80, '2xl': 96 },
} as const;

// Component size presets for different screen sizes
export const COMPONENT_SIZES = {
  button: {
    xs: { width: 80, height: 32, padding: 'px-2 py-1', text: 'text-sm' },
    sm: { width: 100, height: 36, padding: 'px-3 py-2', text: 'text-sm' },
    md: { width: 120, height: 40, padding: 'px-4 py-2', text: 'text-base' },
    lg: { width: 140, height: 44, padding: 'px-5 py-2', text: 'text-base' },
    xl: { width: 160, height: 48, padding: 'px-6 py-3', text: 'text-lg' },
  },
  input: {
    xs: { width: 200, height: 32, padding: 'px-2 py-1', text: 'text-sm' },
    sm: { width: 240, height: 36, padding: 'px-3 py-2', text: 'text-sm' },
    md: { width: 280, height: 40, padding: 'px-3 py-2', text: 'text-base' },
    lg: { width: 320, height: 44, padding: 'px-4 py-2', text: 'text-base' },
    xl: { width: 360, height: 48, padding: 'px-4 py-3', text: 'text-lg' },
  },
  card: {
    xs: { width: 280, height: 160, padding: 'p-3' },
    sm: { width: 320, height: 180, padding: 'p-4' },
    md: { width: 360, height: 200, padding: 'p-4' },
    lg: { width: 400, height: 220, padding: 'p-6' },
    xl: { width: 440, height: 240, padding: 'p-6' },
  },
  container: {
    xs: { width: 300, height: 120, padding: 'p-2' },
    sm: { width: 340, height: 140, padding: 'p-3' },
    md: { width: 380, height: 160, padding: 'p-4' },
    lg: { width: 420, height: 180, padding: 'p-4' },
    xl: { width: 480, height: 200, padding: 'p-6' },
  },
} as const;

// Get current screen size category
export function getScreenSize(width: number): keyof typeof BREAKPOINTS {
  if (width < BREAKPOINTS.sm) return 'xs';
  if (width < BREAKPOINTS.md) return 'sm';
  if (width < BREAKPOINTS.lg) return 'md';
  if (width < BREAKPOINTS.xl) return 'lg';
  if (width < BREAKPOINTS['2xl']) return 'xl';
  if (width < BREAKPOINTS['3xl']) return '2xl';
  if (width < BREAKPOINTS['4xl']) return '3xl';
  if (width < BREAKPOINTS['5xl']) return '4xl';
  if (width < BREAKPOINTS['6xl']) return '5xl';
  if (width < BREAKPOINTS['7xl']) return '6xl';
  if (width < BREAKPOINTS['8xl']) return '7xl';
  return '8xl';
}

// Get responsive component dimensions
export function getResponsiveSize(
  componentType: keyof typeof COMPONENT_SIZES,
  screenSize: keyof typeof BREAKPOINTS
) {
  const sizes = COMPONENT_SIZES[componentType];
  if (!sizes) return { width: 200, height: 40 };
  
  // Map screen breakpoints to component size keys
  const sizeMap: Record<keyof typeof BREAKPOINTS, keyof typeof sizes> = {
    'xs': 'xs',
    'sm': 'xs',
    'md': 'sm', 
    'lg': 'sm',
    'xl': 'md',
    '2xl': 'md',
    '3xl': 'lg',
    '4xl': 'lg',
    '5xl': 'xl',
    '6xl': 'xl',
    '7xl': 'xl',
    '8xl': 'xl',
  };
  
  const sizeKey = sizeMap[screenSize];
  return sizes[sizeKey] || sizes.md;
}

// Generate responsive Tailwind classes
export function getResponsiveClasses(base: string, responsive: Record<string, string>) {
  let classes = base;
  
  Object.entries(responsive).forEach(([breakpoint, className]) => {
    if (breakpoint === 'default') {
      classes = `${className} ${classes}`;
    } else {
      classes += ` ${breakpoint}:${className}`;
    }
  });
  
  return classes;
}

// Touch-friendly sizing for mobile devices
export function getTouchFriendlySize(componentType: string, isMobile: boolean) {
  if (!isMobile) return {};
  
  const touchTargets = {
    button: { minWidth: 44, minHeight: 44 }, // Apple HIG minimum
    input: { minHeight: 44 },
    card: { minHeight: 60 },
    container: { minHeight: 60 },
  };
  
  return touchTargets[componentType as keyof typeof touchTargets] || {};
}

// Get optimal layout for screen size
export function getOptimalLayout(screenSize: keyof typeof BREAKPOINTS) {
  if (['xs', 'sm', 'md', 'lg'].includes(screenSize)) {
    return {
      columns: 1,
      maxWidth: '100%',
      padding: 'px-4',
      gap: 'gap-4',
      layout: 'mobile'
    };
  }
  
  if (['xl', '2xl'].includes(screenSize)) {
    return {
      columns: 2,
      maxWidth: 'max-w-4xl',
      padding: 'px-6',
      gap: 'gap-6',
      layout: 'tablet'
    };
  }
  
  return {
    columns: 3,
    maxWidth: 'max-w-7xl',
    padding: 'px-8',
    gap: 'gap-8',
    layout: 'desktop'
  };
}

// Generate media queries for custom CSS
export function generateMediaQueries() {
  return Object.entries(BREAKPOINTS).map(([key, value]) => ({
    name: key,
    query: `@media (min-width: ${value}px)`,
    minWidth: value,
  }));
}

// Detect if device is touch-enabled
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Get device pixel ratio for high-DPI displays
export function getDevicePixelRatio(): number {
  if (typeof window === 'undefined') return 1;
  return window.devicePixelRatio || 1;
}

// Calculate optimal image sizes for responsive images
export function getResponsiveImageSizes(screenSize: keyof typeof BREAKPOINTS) {
  const baseSize = BREAKPOINTS[screenSize];
  const pixelRatio = getDevicePixelRatio();
  
  return {
    thumbnail: Math.round(baseSize * 0.1 * pixelRatio),
    small: Math.round(baseSize * 0.3 * pixelRatio),
    medium: Math.round(baseSize * 0.5 * pixelRatio),
    large: Math.round(baseSize * 0.8 * pixelRatio),
    full: Math.round(baseSize * pixelRatio),
  };
}

// Get responsive grid configuration
export function getResponsiveGrid(screenSize: keyof typeof BREAKPOINTS) {
  const gridConfigs = {
    'xs': { cols: 1, gap: 2, padding: 4 },
    'sm': { cols: 1, gap: 3, padding: 4 },
    'md': { cols: 2, gap: 4, padding: 6 },
    'lg': { cols: 2, gap: 4, padding: 6 },
    'xl': { cols: 3, gap: 6, padding: 8 },
    '2xl': { cols: 3, gap: 6, padding: 8 },
    '3xl': { cols: 4, gap: 8, padding: 12 },
    '4xl': { cols: 4, gap: 8, padding: 12 },
    '5xl': { cols: 5, gap: 10, padding: 16 },
    '6xl': { cols: 6, gap: 12, padding: 20 },
    '7xl': { cols: 6, gap: 12, padding: 24 },
    '8xl': { cols: 8, gap: 16, padding: 32 },
  };
  
  return gridConfigs[screenSize];
}

// Generate Tailwind responsive classes
export function generateResponsiveClasses(
  property: string, 
  values: Partial<Record<keyof typeof BREAKPOINTS, string>>
): string {
  const classes: string[] = [];
  
  Object.entries(values).forEach(([breakpoint, value]) => {
    if (breakpoint === 'xs') {
      classes.push(`${property}-${value}`);
    } else {
      classes.push(`${breakpoint}:${property}-${value}`);
    }
  });
  
  return classes.join(' ');
}

// Responsive container classes for different screen sizes
export const RESPONSIVE_CONTAINERS = {
  'full-width': 'w-full',
  'mobile-first': 'w-full max-w-sm mx-auto sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-4xl',
  'content-width': 'w-full max-w-3xl mx-auto',
  'wide-content': 'w-full max-w-5xl mx-auto',
  'extra-wide': 'w-full max-w-7xl mx-auto',
  'ultra-wide': 'w-full max-w-screen-2xl mx-auto',
} as const;

// Responsive padding and margin utilities
export const RESPONSIVE_SPACING = {
  'tight': 'p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8',
  'normal': 'p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16',
  'loose': 'p-6 sm:p-8 md:p-12 lg:p-16 xl:p-24',
  'extra-loose': 'p-8 sm:p-12 md:p-16 lg:p-24 xl:p-32',
} as const;

// Get optimal text size for screen size
export function getOptimalTextSize(screenSize: keyof typeof BREAKPOINTS, textType: 'body' | 'heading' | 'caption') {
  const sizeMap = {
    body: {
      'xs': 'text-sm',
      'sm': 'text-sm', 
      'md': 'text-base',
      'lg': 'text-base',
      'xl': 'text-lg',
      '2xl': 'text-lg',
      '3xl': 'text-xl',
      '4xl': 'text-xl',
      '5xl': 'text-xl',
      '6xl': 'text-2xl',
      '7xl': 'text-2xl',
      '8xl': 'text-3xl',
    },
    heading: {
      'xs': 'text-xl',
      'sm': 'text-xl',
      'md': 'text-2xl',
      'lg': 'text-2xl',
      'xl': 'text-3xl',
      '2xl': 'text-3xl',
      '3xl': 'text-4xl',
      '4xl': 'text-4xl',
      '5xl': 'text-5xl',
      '6xl': 'text-6xl',
      '7xl': 'text-6xl',
      '8xl': 'text-7xl',
    },
    caption: {
      'xs': 'text-xs',
      'sm': 'text-xs',
      'md': 'text-sm',
      'lg': 'text-sm',
      'xl': 'text-base',
      '2xl': 'text-base',
      '3xl': 'text-lg',
      '4xl': 'text-lg',
      '5xl': 'text-lg',
      '6xl': 'text-xl',
      '7xl': 'text-xl',
      '8xl': 'text-2xl',
    },
  };
  
  return sizeMap[textType][screenSize];
}

// Hook to detect current screen size
export function useScreenSize(): keyof typeof BREAKPOINTS {
  const [screenSize, setScreenSize] = React.useState<keyof typeof BREAKPOINTS>(() => {
    if (typeof window === 'undefined') return 'lg';
    return getScreenSize(window.innerWidth);
  });
  
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setScreenSize(getScreenSize(window.innerWidth));
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return screenSize;
}
