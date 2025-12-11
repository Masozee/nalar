module.exports = {
  apps: [
    {
      name: 'nalar-frontend',
      // Use server.js if it exists (standalone mode), otherwise use next start
      script: require('fs').existsSync('./server.js') ? './server.js' : 'npm',
      args: require('fs').existsSync('./server.js') ? undefined : 'start',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
      error_file: '/dev/null',
      out_file: '/dev/null',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      watch: false,
    },
  ],
};
