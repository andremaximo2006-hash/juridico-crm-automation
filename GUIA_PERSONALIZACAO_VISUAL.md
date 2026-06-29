# 🎨 Guia de Personalização Visual - Módulo Operacional

**Data:** 2026-06-04  
**Versão:** 1.0  
**Status:** ✅ **IMPLEMENTADO**

---

## 📋 Visão Geral

O módulo Operacional agora possui um **Sistema Completo de Personalização Visual** que permite customizar:

- ✨ **Cores** (áreas, colunas, prioridades)
- 📐 **Layout** (tema, tamanho de cards, visibilidade de elementos)
- 📋 **Colunas** (nomes e visibilidade)
- 🔍 **Filtros e Comportamento** (padrões, auto-refresh, notificações)

---

## 🚀 Como Acessar

### Via Interface
1. Abra: **https://crm.gabriellenunes.com.br/operacional**
2. Clique no botão **⚙️ Configurações** (no canto superior direito)
3. Você será levado para: **/operacional/configuracoes**

---

## 🎯 Funcionalidades Principais

### 1️⃣ ABA: CORES 🎨

**O que pode customizar:**

#### Cores das Áreas
- 🟦 **Previdenciário** (padrão: #3B82F6 - Azul)
- 🟩 **Trabalhista** (padrão: #10B981 - Verde)
- 🟨 **Civil** (padrão: #F59E0B - Âmbar)
- 🟥 **Família** (padrão: #EC4899 - Rosa)
- 🟪 **Tributário** (padrão: #8B5CF6 - Roxo)

#### Cores das Colunas Kanban
- **Novo** (padrão: Cinza #6B7280)
- **Triagem** (padrão: Azul #3B82F6)
- **Andamento** (padrão: Âmbar #F59E0B)
- **Concluído** (padrão: Verde #10B981)

#### Cores de Prioridade
- **Baixa** (padrão: Verde #10B981)
- **Normal** (padrão: Azul #3B82F6)
- **Alta** (padrão: Âmbar #F59E0B)
- **Urgente** (padrão: Vermelho #EF4444)

**Como usar:**
1. Abra o color picker clicando no quadrado de cor
2. Escolha uma cor do paleta ou digite o código hex
3. A mudança aparece no preview à direita

---

### 2️⃣ ABA: LAYOUT 📐

**Tema:**
- ☀️ **Claro** - Interface com fundo branco
- 🌙 **Escuro** - Interface com fundo escuro
- 🔄 **Automático** - Segue preferência do SO

**Tamanho do Card:**
- 📱 **Pequeno** - Informações mínimas, mais cards visíveis
- 📋 **Médio** *(padrão)* - Balanço entre informação e espaço
- 📄 **Grande** - Mais detalhes por card

**Visibilidade de Elementos:**
- ✅ Mostrar Avatar do Responsável
- ✅ Mostrar Número do Processo
- ✅ Mostrar DPP (Salário Maternidade)
- ✅ Mostrar Alertas
- ✅ Mostrar Observações (truncadas)

---

### 3️⃣ ABA: COLUNAS 📋

**Personalizar Nomes:**
- Renomear as 4 colunas do Kanban
- Exemplos:
  - "Novo" → "Por Revisar"
  - "Triagem" → "Em Análise"
  - "Andamento" → "Em Progresso"
  - "Concluído" → "Finalizado"

**Visibilidade de Colunas:**
- Mostrar/Ocultar cada coluna individualmente
- Útil para focar em determinadas etapas do processo

---

### 4️⃣ ABA: FILTROS 🔍

**Paginação:**
- Registros por página (10-200, padrão: 50)
- Mais registros = menos paginação, mais uso de memória

**Auto-refresh Stats:**
- Intervalo de atualização das estatísticas (10-300 segundos)
- Padrão: 30 segundos
- Use 10s para monitoramento em tempo real, 60s+ para economia de recursos

**Comportamento:**
- 🔒 Ativar Bloqueio Automático (impede movimentos inválidos)
- 🔔 Ativar Notificações (alertas de eventos)
- 📊 Mostrar Stats por Coluna (exibe total em cada coluna)

---

## 📱 Preview em Tempo Real

À direita da tela, há uma **área de preview** que mostra:
- 📌 Exemplo de 2 cards com suas customizações
- 🎨 As colunas com os novos nomes e cores
- 🎛️ Informações do tema e tamanho selecionado

As mudanças aparecem **instantaneamente** no preview conforme você ajusta.

---

## 💾 Salvando as Configurações

1. Após fazer as customizações desejadas
2. Clique em **💾 Salvar Configurações** (botão azul)
3. Aguarde a mensagem de sucesso ✅
4. As configurações são salvas no banco de dados
5. As mudanças aplicam-se a **todos os usuários**

---

## 🔄 Restaurando Padrões

Se desejar voltar às configurações padrão:
1. Clique em **🔄 Restaurar Padrão** (botão cinza)
2. Todas as customizações serão redefinidas
3. Clique em **Salvar** para confirmar

---

## 📐 Arquitetura Técnica

### Banco de Dados
```sql
CREATE TABLE configurador_operacional (
  id TEXT PRIMARY KEY,
  
  -- Cores das Áreas (5)
  corPrevidenciario, corTrabalhista, corCivil, corFamilia, corTributario
  
  -- Cores das Colunas (4)
  corNovoColuna, corTriagemColuna, corAndamentoColuna, corConcluidoColuna
  
  -- Labels das Colunas (4)
  labelNovo, labelTriagem, labelAndamento, labelConcluido
  
  -- Cores de Prioridade (4)
  corBaixa, corNormal, corAlta, corUrgente
  
  -- Layout & Tema
  tema, tamanhoCard, mostrarAvatar, mostrarProcesso, ...
  
  -- Colunas Visíveis (4)
  colunaNovoVisivel, colunaTriagemVisivel, ...
  
  -- Filtros & Comportamento
  registrosPorPagina, autoRefreshStats, notificacoes, ...
)
```

### API Endpoints
```bash
# GET - Obter configuração atual
GET /api/configurador

# PUT - Salvar configurações
PUT /api/configurador
Content-Type: application/json
Body: { ...config }
```

### Componentes React
```
├── ConfiguradorPainel.tsx     # Componente principal
├── ColorPicker.tsx            # Seletor de cores
├── PreviewCard.tsx            # Preview visual
└── página: /operacional/configuracoes/page.tsx
```

### Types
```typescript
// src/types/configurador.ts
interface ConfiguradorOperacional {
  // 50+ propriedades de customização
  corPrevidenciario: string;
  tema: 'light' | 'dark' | 'auto';
  tamanhoCard: 'small' | 'medium' | 'large';
  // ...
}
```

---

## 🎯 Casos de Uso

### Cenário 1: Identidade Visual da Empresa
```
Customizar cores para match com a identidade da marca:
- Previdenciário → cor principal da marca
- Trabalhista → cor secundária
- etc.
```

### Cenário 2: Otimização por Equipe
```
Diferentes equipes têm diferentes necessidades:
- Equipe A: Tema escuro, cards pequenos (mais fichas visíveis)
- Equipe B: Tema claro, cards grandes (mais informações)
```

### Cenário 3: Acessibilidade
```
Usuários com daltonismo podem customizar:
- Substituir verde/vermelho por azul/amarelo
- Aumentar contraste
```

### Cenário 4: Fluxo Customizado
```
Renomear colunas conforme processo interno:
- "Novo" → "Atribuído"
- "Triagem" → "Validação"
- "Andamento" → "Em Execução"
- "Concluído" → "Faturado"
```

---

## 📚 Integração com Outros Módulos

A configuração é **global e compartilhada**, afetando:
- ✅ Página de Kanban (/operacional)
- ✅ Cards das fichas
- ✅ Filtros e buscas
- ✅ Stats bar
- ✅ Todos os usuários da plataforma

---

## 🔐 Permissões

- **Quem pode acessar as configurações:**
  - Usuários com role `admin` ✅
  - Usuários com role `financeiro` ✅ (em breve)
  - Usuários padrão ❌ (bloqueado)

---

## 🚀 Próximas Melhorias

Funcionalidades planejadas:
- [ ] Salvar múltiplos **presets** de configuração
- [ ] Exportar/Importar configurações como JSON
- [ ] Configurações por usuário (não global)
- [ ] Atalhos de teclado personalizáveis
- [ ] Histórico de alterações
- [ ] Temas pré-configurados (Material, Tailwind, etc)

---

## ❓ FAQ

### P: As configurações são salvas por usuário?
**R:** Não, as configurações são **globais**. Todas afetam todos os usuários. Isso pode ser customizado no futuro para por-usuário.

### P: Qual é o formato das cores?
**R:** Hexadecimal (ex: #3B82F6, #FF0000). Também aceita # com 3 dígitos (#F00).

### P: Há limite de quantas vezes posso salvar?
**R:** Não, salve quantas vezes quiser. As mudanças são instantâneas.

### P: Como afeta o desempenho?
**R:** Negligível. As cores são aplicadas via CSS variables. Nenhum impacto de desempenho.

### P: Posso usar cores RGB ou HSL?
**R:** Atualmente apenas Hex. RGB/HSL podem ser adicionados no futuro.

---

## 📞 Suporte

Se tiver dúvidas ou encontrar problemas:
1. Verifique que está usando as cores no formato correto (Hex)
2. Tente **Restaurar Padrão** e salvar novamente
3. Limpe o cache do navegador (Ctrl+Shift+Delete)
4. Contacte o admin do sistema

---

**Aproveite a personalização!** 🎨✨

