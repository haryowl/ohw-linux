module.exports = {
  apps: [
    {
      name: 'galileosky-backend',
      script: './backend/src/server.js',
      cwd: './backend',
      env: {
        NODE_ENV: 'production',
        PORT: '3001',
        HTTP_PORT: '3001',
        WS_PORT: '3001',
        TCP_PORT: '3003'
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      instances: 1,
      exec_mode: 'fork'
    },
    {
      name: 'galileosky-frontend',
      script: './frontend/start-server.js',
      cwd: './frontend',
      env: {
        NODE_ENV: 'production',
        REACT_APP_API_URL: 'http://localhost:3001',
        REACT_APP_WS_URL: 'ws://localhost:3001/ws'
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      instances: 1,
      exec_mode: 'fork'
    },
    {
      name: 'galileosky-mobile-frontend',
      script: './mobile-frontend/start-server.js',
      cwd: './mobile-frontend',
      env: {
        NODE_ENV: 'production',
        REACT_APP_API_URL: 'http://localhost:3001',
        REACT_APP_WS_URL: 'ws://localhost:3001/ws'
      },
      error_file: './logs/mobile-frontend-error.log',
      out_file: './logs/mobile-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}; 