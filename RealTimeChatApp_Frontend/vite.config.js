import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync("./certs/localhost-key-no-pass.pem"),
      cert: fs.readFileSync("./certs/localhost-cert.pem"),
    },
    host: "localhost",
    port: 3000,
    cors: true,
  },
});
