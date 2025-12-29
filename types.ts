
export type Status = 'ok' | 'atencao' | 'critico' | 'concluida' | 'andamento' | 'atrasada' | 'pendente' | 'recebido' | 'analise' | 'resolvido' | 'execucao' | 'cancelado';

export type EixoProjeto = 'Prefeitura' | 'Câmara' | 'Híbrido';
export type TipoProjeto = 'Estratégico' | 'Institucional' | 'Estrutural' | 'Jurídico' | 'Operacional' | 'Gestão';
export type StatusProjeto = 'Backlog' | 'Planejado' | 'Execução' | 'Tramitação' | 'Risco' | 'Concluído';
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
  atualizadoEm: string;
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
  bairro: string;
  cep: string;
  solicitante: string;
  status: 'recebido' | 'analise' | 'execucao' | 'resolvido';
  secretaria: string;
  coordenadas: { lat: number; lng: number }; 
  justificativa?: string;
}

export interface DashboardData {
  secretarias: Secretaria[];
  okrs: any[];
  kpis: any[];
  swot: any;
  projetosEstrategicos: any[];
  entregas: any[];
  escuta: EscutaCidada[];
  kanbanCards: KanbanCard[];
  financeiro: any[];
  prioridadesSemanais: any[];
}
