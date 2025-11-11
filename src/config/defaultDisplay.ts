/**
 * Default display configuration for all timer pages
 * This is a shared configuration used across all preset timers
 */

export type Display = {
  name: string;
  logo_image?: string | null;
  logo_size_percent?: number | null;
  logo_position?: string | null;
  timer_format?: string | null;
  timer_font_family?: string | null;
  timer_color?: string | null;
  time_of_day_color?: string | null;
  timer_text_style?: string | null;
  timer_size_percent?: number | null;
  timer_position?: 'center' | 'top' | 'bottom' | null;
  auto_hide_completed?: boolean;
  clock_format?: string | null;
  clock_font_family?: string | null;
  clock_color?: string | null;
  clock_visible?: boolean;
  message_font_family?: string | null;
  message_color?: string | null;
  title_display_location?: string | null;
  speaker_display_location?: string | null;
  next_cue_display_location?: string | null;
  header_font_family?: string | null;
  header_color?: string | null;
  footer_font_family?: string | null;
  footer_color?: string | null;
  theme_name?: string | null;
  text_style?: string | null;
  display_ratio?: string | null;
  background_type?: string | null;
  background_color?: string | null;
  background_image?: string | null;
  background_preset?: string | null;
  progress_style?: string | null;
  progress_color_main?: string | null;
  progress_color_secondary?: string | null;
  progress_color_tertiary?: string | null;
};

export const defaultDisplay: Display = {
  name: 'Standard Timer',

  // Timer styling
  timer_color: '#FFFFFF', // White text
  timer_font_family: 'Arial, sans-serif',
  timer_size_percent: 300, // 42rem
  timer_position: 'center',
  timer_format: 'mm:ss',
  timer_text_style: 'default',

  // Logo configuration
  logo_image: '/logo-dark-full.png', // VeroTime logo
  logo_size_percent: 500,
  logo_position: 'top_left',

  // Clock configuration
  clock_visible: true,
  clock_color: '#FFFFFF',
  clock_font_family: 'Arial, sans-serif',
  clock_format: 'hh:mm:ss',

  // Background
  background_type: 'color',
  background_color: '#1a1a1a', // Dark background

  // Progress bar styling
  progress_style: 'bottom_bar',
  progress_color_main: '#10B981', // Green
  progress_color_secondary: '#F59E0B', // Amber/Yellow
  progress_color_tertiary: '#EF4444', // Red

  // Header and footer
  header_font_family: 'Arial, sans-serif',
  header_color: '#FFFFFF',
  footer_font_family: 'Arial, sans-serif',
  footer_color: '#FFFFFF',

  // Messages
  message_font_family: 'Arial, sans-serif',
  message_color: '#FFFFFF',

  // Misc
  display_ratio: '16:9',
  text_style: 'default',
  auto_hide_completed: false,
};

/**
 * Get the default display configuration
 */
export const getDefaultDisplay = (): Display => {
  return { ...defaultDisplay };
};
