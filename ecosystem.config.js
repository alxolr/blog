'use strict';

module.exports = {
  apps: [
    {
      name: 'blog',
      script: './index.js',
      watch: true,
      env: {
        PORT: 8080,
        NODE_ENV: 'development',
        NODE_APP_INSTANCE: 'development'
      },
      env_production: {
        PORT: 8080,
        NODE_ENV: 'production',
        NODE_APP_INSTANCE: 'production'
      }
    }
  ]
};
