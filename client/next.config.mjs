/** @type {import('next').NextConfig} */
const nextConfig = {

  
    webpack(config, { dev }) {
      // Add fallbacks for Node.js core modules
      config.resolve.fallback = {
        fs: false, 
        path: false,
        os: false,
      };
      
      // Disable cache in development to avoid write permission issues
      if (dev) {
        config.cache = false;
      }
      
      // For ag-grid modules, just ensure the modules are resolved without require.resolve
      config.resolve.alias = {
        ...config.resolve.alias,
      };
      
      return config;
    },
  };
  
  export default nextConfig;