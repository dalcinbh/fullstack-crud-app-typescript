/**
 * Tailwind CSS configuration file defining the utility-first CSS framework settings.
 * Configures content scanning paths, theme customizations, and plugin integrations
 * for the project management application. Ensures optimal CSS generation with
 * automatic unused style purging and consistent design system implementation.
 */

/** TypeScript type annotation for enhanced IDE support and configuration validation */
/** @type {import('tailwindcss').Config} */
module.exports = {
  /**
   * Content scanning configuration for automatic CSS class detection.
   * Defines file paths where Tailwind should look for class usage to enable
   * tree-shaking and remove unused styles in production builds.
   */
  content: [
    /** Scans all JavaScript, TypeScript, and React files in the src directory */
    "./src/**/*.{js,jsx,ts,tsx}",
    /** Includes the main HTML template for class detection */
    "./public/index.html"
  ],
  
  /**
   * Theme configuration for design system customization and extensions.
   * Allows for custom color palettes, spacing, typography, and responsive breakpoints
   * while maintaining Tailwind's default utility classes.
   */
  theme: {
    /**
     * Theme extensions for adding custom design tokens without overriding defaults.
     * Enables project-specific customizations while preserving Tailwind's core utilities.
     */
    extend: {},
  },
  
  /**
   * Plugin configuration for extending Tailwind's functionality with additional utilities.
   * Allows integration of custom components, complex utilities, and third-party plugins
   * to enhance the framework's capabilities for specific project requirements.
   */
  plugins: [],
} 