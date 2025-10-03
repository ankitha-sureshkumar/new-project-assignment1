module.exports = {
  apps: [
    {
      name: 'oggy-backend',
      script: './dist/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
    {
      name: 'oggy-frontend',
      script: 'serve',
      args: '-s ../frontend/build -l 3000',
      instances: 1,
      autorestart: true,
      watch: false,
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
