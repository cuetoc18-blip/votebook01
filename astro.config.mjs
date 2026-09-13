import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

const enNetlify = process.env.NETLIFY === 'true' || !!process.env.CONTEXT;

export default defineConfig({
  output: 'server',
  adapter: enNetlify ? netlify() : undefined,
  server: { port: 4321 }
});
