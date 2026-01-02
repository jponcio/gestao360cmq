
export type Status = 'ok' | 'atencao' | 'critico' | 'concluida' | 'andamento' | 'atrasada' | 'pendente' | 'recebido' | 'analise' | 'resolvido' | 'execucao' | 'cancelado';

export type EixoProjeto = 'Saúde' | 'Infraestrutura' | 'Educação' | 'Segurança' | 'Desenvolvimento' | 'Administração' | 'Cultura/Lazer';
export type TipoProjeto = 'Estratégico' | 'Institucional' | 'Estrutural' | 'Jurídico' | 'Operacional' | 'Gestão';
export type StatusProjeto = 'Backlog' | 'Planejado' | 'Execução' | 'Tramitação' | 'Risco' | 'Concluído' | 'Depende de' | 'Aguardando parecer' | 'Parado' | 'Rejeitado';
export type TramitacaoStatus = 'Articulação' | 'Análise Jurídica' | 'Votação' | 'Aprovado' | 'Sancionado';

export type KanbanStatus = 'Backlog' | 'Em Andamento' | 'Depende de' | 'Em Atenção' | 'Parado' | 'Concluído' | 'Arquivado';
export type DependenciaTipo = 'Outra Secretaria' | 'Orçamento' | 'Jurídico' | 'Câmara' | 'Prefeito' | 'Fornecedor Externo' | 'Outro';

export interface Responsavel {
  nome: string;
  secretaria: string;
}

export interface Metric {
  label: string;
  value: string;
}

export interface Secretaria {
  id: string;
  nome: string;
  secretario: string;
  status: 'ok' | 'atencao' | 'critico';
  resumo: string;
  metrics: Metric[];
  alerta?: string;
}

export interface KanbanCard {
  id: string;
  titulo: string;
  secretariaId: string;
  dono: string;
  status: KanbanStatus;
  criadoEm: string;
  updatedAt: string;
  tipo: TipoProjeto;
  tags: string[];
  justificativa?: string;
  dependenciaDe?: string;
  dependenciaTipo?: DependenciaTipo;
}

export interface EscutaCidada {
  id: string;
  data: string;
  tema: string;
  descricao: string;
  rua: string;
  nro: string;
  bairro: string;
  cep: string;
  solicitante: string;
  telefone: string;
  status: 'Cadastrada' | 'Em andamento' | 'Depende de' | 'Aguardando parecer técnico' | 'Resolvida' | 'Parado' | 'Concluída';
  secretaria: string;
  coordenadas: { lat: number; lng: number }; 
  justificativa?: string;
  updatedAt?: string;
}

export interface ProjetoEstrategico {
  id: string;
  nome: string;
  eixo: string;
  responsavel: string;
  progresso: number;
  status: StatusProjeto;
  fim: string;
  prioridade: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  arquivado?: boolean;
  subItens?: { id: string, texto: string, concluido: boolean }[];
}

export interface KeyResult {
  id: string;
  texto: string;
  concluida: boolean;
}

export interface OKR {
  id: string;
  objetivo: string;
  status: 'Planejado' | 'Em andamento' | 'Concluído' | 'Atrasado';
  subEstrategias: KeyResult[];
}

export interface SWOTMatrix {
  id: string;
  titulo: string;
  data: any;
  arquivada: boolean;
  criadaEm: string;
}

export interface DashboardData {
  secretarias: Secretaria[];
  okrs: OKR[];
  kpis: any[];
  swot: any;
  projetosEstrategicos: ProjetoEstrategico[];
  entregas: any[];
  escuta: EscutaCidada[];
  kanbanCards: KanbanCard[];
  financeiro: any[];
  prioridadesSemanais: any[];
}
