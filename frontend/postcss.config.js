/**
 * PostCSS configuration file for CSS processing pipeline integration.
 * Configures essential plugins for Tailwind CSS compilation and browser compatibility.
 * Automatically processes CSS during development and build processes through Create React App.
 * Ensures consistent styling across different browsers with vendor prefixes and modern CSS features.
 */
module.exports = {
  plugins: {
    /**
     * Tailwind CSS plugin for processing utility-first CSS framework.
     * Transforms @tailwind directives into actual CSS utility classes and components.
     * Handles purging unused styles in production builds for optimal bundle size.
     */
    tailwindcss: {},
    
    /**
     * Autoprefixer plugin for automatic vendor prefix addition.
     * Adds necessary browser prefixes based on browserslist configuration.
     * Ensures CSS compatibility across different browsers and versions without manual prefixing.
     */
    autoprefixer: {},
  },
} 