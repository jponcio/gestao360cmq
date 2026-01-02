
import { LayoutDashboard, Target, Map, BookOpen, Layers, Compass } from 'lucide-react';
import { DashboardData } from './types';

export const NAVIGATION = [
  { id: 'prefeito', name: 'Painel Macro', icon: LayoutDashboard },
  { id: 'projetos', name: 'Projetos', icon: Layers },
  { id: 'okr', name: 'OKR', icon: Target },
  { id: 'swot', name: 'Matriz SWOT', icon: Compass },
  { id: 'escuta', name: 'Território Vivo', icon: Map },
  { id: 'governanca', name: 'Manual', icon: BookOpen },
];

export const MOCK_DATA: DashboardData = {
  secretarias: [
    { id: 'S1', nome: 'Secretaria Especial de Governo', secretario: 'Vitor Azambuja', status: 'ok', resumo: 'Articulação e gestão estratégica.', metrics: [] },
    { id: 'S2', nome: 'Secretaria Municipal de Saúde', secretario: 'Daniel Mariano', status: 'ok', resumo: 'Gestão do SUS e saúde pública.', metrics: [] },
    { id: 'S3', nome: 'Secretaria de Educação e Esportes', secretario: 'Ana Carmelita', status: 'ok', resumo: 'Ensino municipal e fomento ao esporte.', metrics: [] },
    { id: 'S4', nome: 'Secretaria de Infraestrutura Urbana', secretario: 'Alex Petroman', status: 'ok', resumo: 'Obras urbanas e pavimentação.', metrics: [] },
    { id: 'S5', nome: 'Secretaria de Infraestrutura Rural', secretario: 'Sidinei Peglow', status: 'ok', resumo: 'Manutenção de estradas e pontes.', metrics: [] },
    { id: 'S6', nome: 'Secretaria de Administração', secretario: 'Aline Flores', status: 'ok', resumo: 'Gestão de RH e patrimônio.', metrics: [] },
    { id: 'S7', nome: 'Secretaria da Fazenda', secretario: 'Jane Leite', status: 'ok', resumo: 'Equilíbrio fiscal e arrecadação.', metrics: [] },
    { id: 'S8', nome: 'Secretaria de Desenvolvimento Rural', secretario: 'Rogerinho', status: 'ok', resumo: 'Apoio ao produtor rural.', metrics: [] },
    { id: 'S9', nome: 'Secretaria de Cultura, Turismo e Eventos', secretario: 'Eva Rosi', status: 'ok', resumo: 'Patrimônio histórico e calendário.', metrics: [] },
    { id: 'S10', nome: 'Secretaria de Habitação e Sustentabilidade', secretario: 'Gildo Silva', status: 'ok', resumo: 'Regularização e meio ambiente.', metrics: [] },
    { id: 'S11', nome: 'Secretaria de Desenvolvimento Econômico', secretario: 'Clayton Dworzecki', status: 'ok', resumo: 'Atração de empresas e MEIs.', metrics: [] },
    { id: 'S12', nome: 'Secretaria de Desenvolvimento Social', secretario: 'Fabiano Ribeiro', status: 'ok', resumo: 'Programas de assistência social.', metrics: [] },
    { id: 'S13', nome: 'Secretaria de Segurança e Mobilidade Urbana', secretario: 'Marcelo Ferreira', status: 'ok', resumo: 'Guarda municipal e trânsito.', metrics: [] },
    { id: 'S14', nome: 'Procuradoria Municipal', secretario: 'Cesar Augusto Weimer', status: 'ok', resumo: 'Assessoramento jurídico pleno.', metrics: [] },
  ],
  okrs: [],
  swot: {
    forcas: [],
    fraquezas: [],
    oportunidades: [],
    ameacas: []
  },
  kpis: [],
  projetosEstrategicos: [
    // Fixed: Added missing 'responsavel' property to satisfy the ProjetoEstrategico type requirement
    { id: 'P1', nome: 'Pavimentação de Acesso ao Distrito Industrial', eixo: 'Infraestrutura', responsavel: 'Alex Petroman', progresso: 65, status: 'Execução', fim: '2025-10-12', prioridade: 'Alta' },
    { id: 'P2', nome: 'Novo Posto de Saúde - Bairro Getúlio Vargas', eixo: 'Saúde', responsavel: 'Daniel Mariano', progresso: 30, status: 'Execução', fim: '2025-12-20', prioridade: 'Crítica' },
    { id: 'P3', nome: 'Digitalização de Processos Administrativos (Papel Zero)', eixo: 'Administração', responsavel: 'Aline Flores', progresso: 90, status: 'Tramitação', fim: '2025-06-30', prioridade: 'Média' },
    { id: 'P4', nome: 'Revitalização da Praça Zeca Netto', eixo: 'Cultura/Lazer', responsavel: 'Eva Rosi', progresso: 100, status: 'Concluído', fim: '2024-12-01', prioridade: 'Alta' },
    { id: 'P5', nome: 'Programa de Microcrédito Municipal', eixo: 'Desenvolvimento', responsavel: 'Clayton Dworzecki', progresso: 15, status: 'Risco', fim: '2025-08-15', prioridade: 'Alta' },
    { id: 'P6', nome: 'Ampliação da Iluminação de LED (Zona Rural)', eixo: 'Segurança', responsavel: 'Marcelo Ferreira', progresso: 45, status: 'Execução', fim: '2025-11-05', prioridade: 'Alta' }
  ],
  kanbanCards: [],
  entregas: [],
  prioridadesSemanais: [],
  financeiro: [],
  escuta: []
};
