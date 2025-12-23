import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    strictPort: false, // 🔥 boş portu kendisi bulsun
    open: 'chrome', // Chrome'u varsayılan tarayıcı olarak aç
  },
});
