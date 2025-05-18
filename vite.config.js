import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  define: {
    global: {},
  },
});



// // vite.config.js
// import { defineConfig } from 'vite';
// import path from 'path';

// export default defineConfig({
//   resolve: {
//     alias: {
//       'stream-chat': path.resolve(__dirname, 'node_modules/stream-chat/dist/esm/index.js'),
//     },
//   },
// });








