import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// vite.config.js
export default {
  // ... existing config
  server: {
    host: true, // listen on all addresses (needed on some hosts)
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    hmr: {
      host: process.env.HOSTNAME || 'ai-lost-and-found-1.onrender.com',
    },
    allowedHosts: ['ai-lost-and-found-1.onrender.com'] // add your render url
  }
}

