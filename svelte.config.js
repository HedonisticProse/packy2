import adapter from '@sveltejs/adapter-static';

const dev = process.argv.includes('dev');

export default {
  kit: {
    adapter: adapter({
      pages: 'docs',
      assets: 'docs',
      fallback: '404.html'
    }),
    paths: {
      base: dev ? '' : '/packy2'
    },
    prerender: {
      handleHttpError: 'ignore'
    }
  }
};