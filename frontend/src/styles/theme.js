// EcoVehicle Theme - Light Green Theme with Blue Accents

export const theme = {
  colors: {
    // Primary colors
    primary: '#2E7D32', // Green
    primaryLight: '#4CAF50',
    primaryDark: '#1B5E20',
    
    // Secondary colors
    secondary: '#1976D2', // Blue
    secondaryLight: '#42A5F5',
    secondaryDark: '#0D47A1',
    
    // Status/Rating colors
    status: {
      veryLow: '#4CAF50',    // Green - Very Low
      low: '#8BC34A',        // Light Green - Low
      moderate: '#FFC107',   // Amber - Moderate
      high: '#FF9800',       // Orange - High
      veryHigh: '#F44336',   // Red - Very High
    },
    
    // Semantic colors
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    info: '#2196F3',
    
    // Neutral colors
    background: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceVariant: '#F5F5F5',
    outline: '#E0E0E0',
    outlineVariant: '#D0D0D0',
    
    // Text colors
    text: {
      primary: '#212121',
      secondary: '#757575',
      tertiary: '#9E9E9E',
      onPrimary: '#FFFFFF',
      onSecondary: '#FFFFFF',
    },
    
    // Special colors for vehicle animation
    vehicle: {
      accent: '#26A69A',
      highlight: '#FF6F00',
      shadow: 'rgba(0, 0, 0, 0.1)',
    }
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    round: '50%',
  },
  
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.12)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.1)',
    xl: '0 16px 24px rgba(0, 0, 0, 0.1)',
  },
  
  transitions: {
    fast: '150ms ease-in-out',
    base: '300ms ease-in-out',
    slow: '500ms ease-in-out',
  },
};

export const getRatingColor = (rating) => {
  const ratingMap = {
    'Very Low': theme.colors.status.veryLow,
    'Low': theme.colors.status.low,
    'Moderate': theme.colors.status.moderate,
    'High': theme.colors.status.high,
    'Very High': theme.colors.status.veryHigh,
  };
  return ratingMap[rating] || theme.colors.secondary;
};
