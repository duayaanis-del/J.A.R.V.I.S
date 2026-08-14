import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1', // WebAuthn / Fingerprint requires 127.0.0.1 or localhost
    port: 5177,
  },
});