/**
 * PM2 — processo do NakaTenis na VPS.
 * Uso: pm2 start ecosystem.config.cjs && pm2 save && pm2 startup
 */
module.exports = {
  apps: [
    {
      name: "nakatenis",
      cwd: "/var/www/nakatenis",
      // `next start` (e não .next/standalone/server.js) porque o standalone
      // não copia public/ nem .next/static — ver deploy/README.md.
      script: "node_modules/next/dist/bin/next",
      args: "start --port 3000",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "127.0.0.1",
      },
      error_file: "/var/log/pm2/nakatenis-error.log",
      out_file: "/var/log/pm2/nakatenis-out.log",
      merge_logs: true,
      time: true,
    },
  ],
};
