module.exports = {
  apps: [
    {
      name: 'alxolr-blog',
      script: 'index.js',
      watch: true,
      instance_var: '0',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
