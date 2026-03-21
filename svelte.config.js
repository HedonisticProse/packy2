import adapter from '@sveltejs/adapter-static';

const config = {
  kit: {
    adapter: adapter({
      pages: 'docs',
      assets: 'docs',
      fallback: 'index.html'
    }),
    paths: {
      base: '/packy2'
    }
  }
};

export default config;
