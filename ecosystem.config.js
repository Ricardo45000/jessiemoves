module.exports = {
    apps: [{
        name: "jessiemoves-backend",
        script: "./server/server.js",
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        log_date_format: "YYYY-MM-DD HH:mm:ss",
        error_file: "./logs/pm2-error.log",
        out_file: "./logs/pm2-out.log",
        merge_logs: true,
        env: {
            NODE_ENV: "development",
            PORT: 5001
        },
        env_production: {
            NODE_ENV: "production",
            PORT: 5000
        }
    }]
}
