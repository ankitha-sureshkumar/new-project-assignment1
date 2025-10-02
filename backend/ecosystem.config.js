module.exports = {
  apps: [
    {
      name: 'oggy-backend',
      script: './dist/server.js', // Path to your compiled server file
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        // IMPORTANT: Your production environment variables like MONGODB_URI, JWT_SECRET, etc.,
        // should be managed on the EC2 server itself, for example, in a .env file.
      },
    },
  ],
};
