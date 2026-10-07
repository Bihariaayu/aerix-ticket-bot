module.exports = {
  apps: [
    {
      name: 'aerix-tickets',
      cwd: '/root/aerix-tickets',
      script: 'src/index.js',
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '500M',
      restart_delay: 4000,
      autorestart: true,
    },
  ],
};
