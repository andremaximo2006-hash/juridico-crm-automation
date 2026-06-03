// Credenciais NÃO ficam aqui — defina DATABASE_URL e JWT_SECRET no ambiente do sistema
// ou num arquivo /root/.env.crm no servidor (veja ACESSO_INFRAESTRUTURA.md).
module.exports = {
  apps: [
    {
      name: "juridico-crm",
      script: "server.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
      },
    },
  ],
};
