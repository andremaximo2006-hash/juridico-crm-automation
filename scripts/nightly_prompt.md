Você é o Claude Code executando a sessão noturna automática do projeto CRM Jurídico.

PROJETO: /Users/andreluis/juridico-crm-automation
STACK: Next.js 16 App Router, Prisma 7, PostgreSQL, Tailwind CSS 4, TypeScript

VPS:
- IP: 2.25.128.221, usuário: root, senha: @Advprev@2026
- App em: /var/www/juridico-crm
- SSH helper: printf '%s' '@Advprev@2026' > /tmp/sshpw && SSHPASS=$(cat /tmp/sshpw) sshpass -e ssh -o StrictHostKeyChecking=no root@2.25.128.221
- Deploy: npm run build && cp -r .next/static .next/standalone/.next/static && cp -r public .next/standalone/public && rsync -avz --delete --exclude='.env' --exclude='node_modules' --exclude='ecosystem.config.js' -e "sshpass -p '@Advprev@2026' ssh -o StrictHostKeyChecking=no" .next/standalone/ root@2.25.128.221:/var/www/juridico-crm/ && SSHPASS=$(cat /tmp/sshpw) sshpass -e ssh -o StrictHostKeyChecking=no root@2.25.128.221 "pm2 restart juridico-crm --update-env"

TAREFA DESTA NOITE:
1. Leia o arquivo /Users/andreluis/juridico-crm-automation/PLANO_MELHORIAS.md
2. Identifique a primeira noite com status "⏳ Pendente"
3. Implemente TODOS os itens listados para aquela noite, conforme o detalhamento no arquivo
4. Após implementar, faça build e deploy completo
5. Verifique se o deploy funcionou: curl -s -o /dev/null -w "%{http_code}" https://crm.gabriellenunes.com.br/ (deve retornar 307)
6. Atualize PLANO_MELHORIAS.md: mude status da noite para "✅ Concluída — DD/MM/YYYY"
7. Atualize RELATORIO_NOTURNO.md com: data, itens implementados, arquivos alterados, status do deploy
8. Atualize ACESSO_INFRAESTRUTURA.md se houver mudanças de infraestrutura
9. Faça git add -A && git commit -m "feat: [descrição das melhorias implementadas] - sessão noturna YYYY-MM-DD" (use a data de hoje)
10. Atualize ClickUp: crie tarefas com status "complete" na lista id=901714025345 para cada item implementado

REGRAS IMPORTANTES:
- Economize tokens: não explique, apenas implemente
- Não quebre funcionalidades existentes — sempre teste após cada alteração
- Se um item falhar após 2 tentativas, pule e documente no relatório
- Mantenha consistência com o design atual (Tailwind, slate palette, lucide-react)
- Padrão de autenticação: use getSession() e verifique em toda nova rota de API
- Concluir antes das 7h da manhã
