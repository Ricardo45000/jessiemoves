module.exports = {
    apps: [{
        name: "jessiemoves-api",
        script: "./server/server.js",
        env: {
            NODE_ENV: "production",
            PORT: 5000
        },
        env_production: {
            NODE_ENV: "production",
            PORT: 5000
        }
    }]
}
