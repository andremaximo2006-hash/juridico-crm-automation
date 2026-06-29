/**
 * 🎨 TIPOS DE CONFIGURAÇÃO - Módulo Operacional
 * Customização visual completa do Kanban
 */

export interface CoresColunas {
  novo: string;
  triagem: string;
  andamento: string;
  concluido: string;
}

export interface CoresAreas {
  previdenciario: string;
  trabalhista: string;
  civil: string;
  familia: string;
  tributario: string;
}

export interface CoresPrioridade {
  baixa: string;
  normal: string;
  alta: string;
  urgente: string;
}

export interface LabelsColunas {
  novo: string;
  triagem: string;
  andamento: string;
  concluido: string;
}

export interface ConfiguradorLayout {
  tema: 'light' | 'dark' | 'auto';
  tamanhoCard: 'small' | 'medium' | 'large';
  mostrarAvatar: boolean;
  mostrarProcesso: boolean;
  mostrarDPP: boolean;
  mostrarAlertas: boolean;
  mostrarObservacoes: boolean;
}

export interface ConfiguradorColunas {
  novoVisivel: boolean;
  triageVisivel: boolean;
  andamentoVisivel: boolean;
  concluidoVisivel: boolean;
}

export interface ConfiguradorFiltros {
  areaPadrao?: string;
  naturezaPadrao?: 'LEAD' | 'ORGÂNICO';
  responsavelPadrao?: string;
}

export interface ConfiguradorOperacional {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  // Cores
  corPrevidenciario: string;
  corTrabalhista: string;
  corCivil: string;
  corFamilia: string;
  corTributario: string;

  corNovoColuna: string;
  corTriagemColuna: string;
  corAndamentoColuna: string;
  corConcluidoColuna: string;

  // Labels
  labelNovo: string;
  labelTriagem: string;
  labelAndamento: string;
  labelConcluido: string;

  // Prioridades
  corBaixa: string;
  corNormal: string;
  corAlta: string;
  corUrgente: string;

  // Layout
  tema: 'light' | 'dark' | 'auto';
  tamanhoCard: 'small' | 'medium' | 'large';
  mostrarAvatar: boolean;
  mostrarProcesso: boolean;
  mostrarDPP: boolean;
  mostrarAlertas: boolean;
  mostrarObservacoes: boolean;

  // Visibilidade de colunas
  colunaNovoVisivel: boolean;
  colunaTriagemVisivel: boolean;
  colunaAndamentoVisivel: boolean;
  colunaConcluidoVisivel: boolean;

  // Filtros
  filtroAreaPadrao?: string;
  filtroNaturezaPadrao?: string;
  filtroResponsavelPadrao?: string;

  // Limites
  registrosPorPagina: number;
  autoRefreshStats: number;
  mostrarStatsPorColuna: boolean;

  // Validações
  requererMotivoMovimento: boolean;
  bloqueioAutomatico: boolean;
  notificacoes: boolean;
}

// Preset (Tema salvo)
export interface PresetConfigurador {
  id: string;
  nome: string;
  descricao?: string;
  isPublico: boolean;
  criadoPor: string;
  configuracao: Omit<ConfiguradorOperacional, 'id' | 'usuarioId' | 'createdAt' | 'updatedAt'>;
  usosCount: number;
  ultimoUsoEm?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Histórico de mudanças
export interface HistoricoConfigurador {
  id: string;
  configuradorId: string;
  usuarioId: string;
  acao: 'alterou_cores' | 'renomeou_coluna' | 'aplicou_preset' | 'exportou' | 'importou' | 'restaurou_padrao';
  campoAlterado?: string;
  valorAnterior?: string;
  valorNovo?: string;
  descricao?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// Atalho de teclado
export interface TeclaPersonalizada {
  id: string;
  usuarioId: string;
  acao: string;
  teclaCombo: string; // "Ctrl+S", "Cmd+E", etc
  descricao?: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Presets padrões
export const PRESETS_PADROES: Record<string, Omit<PresetConfigurador, 'id' | 'createdAt' | 'updatedAt'>> = {
  temalaro: {
    nome: '☀️ Tema Claro',
    descricao: 'Interface clara e limpa com cores vibrantes',
    isPublico: true,
    criadoPor: 'sistema',
    usosCount: 0,
    configuracao: {
      corPrevidenciario: '#3B82F6',
      corTrabalhista: '#10B981',
      corCivil: '#F59E0B',
      corFamilia: '#EC4899',
      corTributario: '#8B5CF6',
      corNovoColuna: '#6B7280',
      corTriagemColuna: '#3B82F6',
      corAndamentoColuna: '#F59E0B',
      corConcluidoColuna: '#10B981',
      labelNovo: 'Novo',
      labelTriagem: 'Triagem',
      labelAndamento: 'Andamento',
      labelConcluido: 'Concluído',
      corBaixa: '#10B981',
      corNormal: '#3B82F6',
      corAlta: '#F59E0B',
      corUrgente: '#EF4444',
      tema: 'light',
      tamanhoCard: 'medium',
      mostrarAvatar: true,
      mostrarProcesso: true,
      mostrarDPP: true,
      mostrarAlertas: true,
      mostrarObservacoes: true,
      colunaNovoVisivel: true,
      colunaTriagemVisivel: true,
      colunaAndamentoVisivel: true,
      colunaConcluidoVisivel: true,
      registrosPorPagina: 50,
      autoRefreshStats: 30,
      mostrarStatsPorColuna: true,
      requererMotivoMovimento: false,
      bloqueioAutomatico: true,
      notificacoes: true,
    },
  },
  temaescuro: {
    nome: '🌙 Tema Escuro',
    descricao: 'Interface escura para trabalhar à noite',
    isPublico: true,
    criadoPor: 'sistema',
    usosCount: 0,
    configuracao: {
      corPrevidenciario: '#60A5FA',
      corTrabalhista: '#34D399',
      corCivil: '#FBBF24',
      corFamilia: '#F472B6',
      corTributario: '#A78BFA',
      corNovoColuna: '#9CA3AF',
      corTriagemColuna: '#60A5FA',
      corAndamentoColuna: '#FBBF24',
      corConcluidoColuna: '#34D399',
      labelNovo: 'Novo',
      labelTriagem: 'Triagem',
      labelAndamento: 'Andamento',
      labelConcluido: 'Concluído',
      corBaixa: '#34D399',
      corNormal: '#60A5FA',
      corAlta: '#FBBF24',
      corUrgente: '#F87171',
      tema: 'dark',
      tamanhoCard: 'medium',
      mostrarAvatar: true,
      mostrarProcesso: true,
      mostrarDPP: true,
      mostrarAlertas: true,
      mostrarObservacoes: true,
      colunaNovoVisivel: true,
      colunaTriagemVisivel: true,
      colunaAndamentoVisivel: true,
      colunaConcluidoVisivel: true,
      registrosPorPagina: 50,
      autoRefreshStats: 30,
      mostrarStatsPorColuna: true,
      requererMotivoMovimento: false,
      bloqueioAutomatico: true,
      notificacoes: true,
    },
  },
  temacompacto: {
    nome: '📱 Tema Compacto',
    descricao: 'Cards pequenos para visualizar mais fichas',
    isPublico: true,
    criadoPor: 'sistema',
    usosCount: 0,
    configuracao: {
      corPrevidenciario: '#3B82F6',
      corTrabalhista: '#10B981',
      corCivil: '#F59E0B',
      corFamilia: '#EC4899',
      corTributario: '#8B5CF6',
      corNovoColuna: '#6B7280',
      corTriagemColuna: '#3B82F6',
      corAndamentoColuna: '#F59E0B',
      corConcluidoColuna: '#10B981',
      labelNovo: 'Novo',
      labelTriagem: 'Triagem',
      labelAndamento: 'Andamento',
      labelConcluido: 'Concluído',
      corBaixa: '#10B981',
      corNormal: '#3B82F6',
      corAlta: '#F59E0B',
      corUrgente: '#EF4444',
      tema: 'light',
      tamanhoCard: 'small',
      mostrarAvatar: false,
      mostrarProcesso: false,
      mostrarDPP: true,
      mostrarAlertas: true,
      mostrarObservacoes: false,
      colunaNovoVisivel: true,
      colunaTriagemVisivel: true,
      colunaAndamentoVisivel: true,
      colunaConcluidoVisivel: true,
      registrosPorPagina: 100,
      autoRefreshStats: 60,
      mostrarStatsPorColuna: false,
      requererMotivoMovimento: false,
      bloqueioAutomatico: true,
      notificacoes: false,
    },
  },
};

// Atalhos padrões
export const ATALHOS_PADRAO: Record<string, string> = {
  'salvar_config': 'Ctrl+S',
  'exportar': 'Ctrl+E',
  'importar': 'Ctrl+I',
  'restaurar_padrao': 'Ctrl+R',
  'abrir_filtros': 'Ctrl+F',
  'nova_ficha': 'Ctrl+N',
  'busca': 'Ctrl+/',
};

// Valores padrão
export const CONFIGURACAO_PADRAO: Omit<ConfiguradorOperacional, 'id' | 'usuarioId' | 'createdAt' | 'updatedAt'> = {
  corPrevidenciario: '#3B82F6',
  corTrabalhista: '#10B981',
  corCivil: '#F59E0B',
  corFamilia: '#EC4899',
  corTributario: '#8B5CF6',

  corNovoColuna: '#6B7280',
  corTriagemColuna: '#3B82F6',
  corAndamentoColuna: '#F59E0B',
  corConcluidoColuna: '#10B981',

  labelNovo: 'Novo',
  labelTriagem: 'Triagem',
  labelAndamento: 'Andamento',
  labelConcluido: 'Concluído',

  corBaixa: '#10B981',
  corNormal: '#3B82F6',
  corAlta: '#F59E0B',
  corUrgente: '#EF4444',

  tema: 'light',
  tamanhoCard: 'medium',
  mostrarAvatar: true,
  mostrarProcesso: true,
  mostrarDPP: true,
  mostrarAlertas: true,
  mostrarObservacoes: true,

  colunaNovoVisivel: true,
  colunaTriagemVisivel: true,
  colunaAndamentoVisivel: true,
  colunaConcluidoVisivel: true,

  filtroAreaPadrao: undefined,
  filtroNaturezaPadrao: undefined,
  filtroResponsavelPadrao: undefined,

  registrosPorPagina: 50,
  autoRefreshStats: 30,
  mostrarStatsPorColuna: true,

  requererMotivoMovimento: false,
  bloqueioAutomatico: true,
  notificacoes: true,
};

// Função para validar cor hex
export function validarCoreHex(cor: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(cor);
}

// Função para aplicar configuração
export function aplicarConfiguracao(config: ConfiguradorOperacional): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Cores das áreas
  root.style.setProperty('--cor-previdenciario', config.corPrevidenciario);
  root.style.setProperty('--cor-trabalhista', config.corTrabalhista);
  root.style.setProperty('--cor-civil', config.corCivil);
  root.style.setProperty('--cor-familia', config.corFamilia);
  root.style.setProperty('--cor-tributario', config.corTributario);

  // Cores das colunas
  root.style.setProperty('--cor-novo', config.corNovoColuna);
  root.style.setProperty('--cor-triagem', config.corTriagemColuna);
  root.style.setProperty('--cor-andamento', config.corAndamentoColuna);
  root.style.setProperty('--cor-concluido', config.corConcluidoColuna);

  // Cores de prioridade
  root.style.setProperty('--cor-baixa', config.corBaixa);
  root.style.setProperty('--cor-normal', config.corNormal);
  root.style.setProperty('--cor-alta', config.corAlta);
  root.style.setProperty('--cor-urgente', config.corUrgente);

  // Tema
  if (config.tema === 'dark') {
    root.classList.add('dark');
  } else if (config.tema === 'light') {
    root.classList.remove('dark');
  }
}
