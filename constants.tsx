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
  projetosEstrategicos: [],
  kanbanCards: [],
  entregas: [],
  prioridadesSemanais: [],
  financeiro: [],
  escuta: []
};