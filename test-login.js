#!/usr/bin/env node

/**
 * Script para testar login na VPS
 * Uso: node test-login.js [url] [email] [password]
 */

const https = require("https");
const http = require("http");

// Parâmetros
const baseUrl = process.argv[2] || "https://crm.gabriellenunes.com.br";
const email = process.argv[3] || "andre.maximo@gabriellenunes.com.br";
const password = process.argv[4] || "Teste@123";

console.log(`\n╔════════════════════════════════════════════════════════════╗`);
console.log(`║             🧪 TESTE DE LOGIN - CRM JURÍDICO               ║`);
console.log(`╚════════════════════════════════════════════════════════════╝\n`);

console.log(`📍 URL: ${baseUrl}`);
console.log(`👤 Email: ${email}`);
console.log(`🔐 Senha: ${password.substring(0, 4)}***\n`);

// Cores
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";

async function testLogin() {
  try {
    // 1. Teste de conectividade
    console.log(`${YELLOW}1. Testando conectividade...${RESET}`);
    const isOnline = await testConnectivity(baseUrl);

    if (!isOnline) {
      console.log(`${RED}❌ Servidor offline ou inacessível${RESET}\n`);
      return;
    }

    console.log(`${GREEN}✅ Servidor respondendo${RESET}\n`);

    // 2. Teste de login page
    console.log(`${YELLOW}2. Verificando página de login...${RESET}`);
    const loginPageOk = await testLoginPage(baseUrl);

    if (!loginPageOk) {
      console.log(`${RED}❌ Página de login não carrega corretamente${RESET}\n`);
      return;
    }

    console.log(`${GREEN}✅ Página de login renderizada${RESET}\n`);

    // 3. Teste de autenticação
    console.log(`${YELLOW}3. Testando autenticação...${RESET}`);
    const authOk = await testAuthentication(baseUrl, email, password);

    if (authOk) {
      console.log(`${GREEN}✅ Autenticação bem-sucedida${RESET}\n`);
      console.log(`${GREEN}╔════════════════════════════════════════════════════════════╗${RESET}`);
      console.log(`${GREEN}║  ✨ TUDO FUNCIONANDO! CRM JURÍDICO ONLINE E PRONTO!        ║${RESET}`);
      console.log(`${GREEN}╚════════════════════════════════════════════════════════════╝${RESET}\n`);
    } else {
      console.log(`${RED}❌ Autenticação falhou${RESET}`);
      console.log(`${YELLOW}   Possíveis causas:${RESET}`);
      console.log(`   • Credenciais inválidas`);
      console.log(`   • Banco de dados offline`);
      console.log(`   • API não respondendo\n`);
    }
  } catch (error) {
    console.log(`${RED}❌ Erro: ${error.message}${RESET}\n`);
  }
}

function testConnectivity(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === "https:" ? https : http;

    const req = client.get(url, { timeout: 5000 }, (res) => {
      resolve(res.statusCode < 500);
    });

    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });
}

function testLoginPage(baseUrl) {
  return new Promise((resolve) => {
    const urlObj = new URL(baseUrl + "/login");
    const client = urlObj.protocol === "https:" ? https : http;

    const req = client.get(urlObj, { timeout: 5000 }, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        // Verificar se contém elementos esperados
        const hasTitle = data.includes("CRM Jurídico");
        const hasForm = data.includes("Entrar") && data.includes("Senha");
        resolve(hasTitle && hasForm);
      });
    });

    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });
}

function testAuthentication(baseUrl, email, password) {
  return new Promise((resolve) => {
    const urlObj = new URL(baseUrl + "/api/auth/login");
    const client = urlObj.protocol === "https:" ? https : http;

    const postData = JSON.stringify({ email, password });

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
      timeout: 5000,
    };

    const req = client.request(urlObj, options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve(json.ok === true || res.statusCode === 200);
        } catch {
          resolve(res.statusCode === 200);
        }
      });
    });

    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// Executar
testLogin();
