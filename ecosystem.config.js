module.exports = {
  apps: [
    {
      name: 'matchnow-admin-web',
      script: 'node_modules/.bin/http-server',
      args: 'dist -p 3000 -c-1 --cors',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};