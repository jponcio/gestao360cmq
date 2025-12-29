
import { LayoutDashboard, Target, FolderKanban, CheckSquare, Map, BookOpen } from 'lucide-react';
import { DashboardData } from './types';

export const NAVIGATION = [
  { id: 'prefeito', name: 'Painel Macro', icon: LayoutDashboard },
  { id: 'estrategia', name: 'OKRs & SWOT', icon: Target },
  { id: 'escuta', name: 'Território Vivo', icon: Map },
  { id: 'governanca', name: 'Manual', icon: BookOpen },
];

export const MOCK_DATA: DashboardData = {
  secretarias: [
    { id: 'S1', nome: 'Secretaria Especial de Governo', secretario: 'Vitor Azambuja', status: 'ok', resumo: 'Articulação e gestão estratégica.', metrics: [{label: 'Demandas Câmara', value: '12'}, {label: 'Projetos', value: '08'}] },
    { id: 'S2', nome: 'Secretaria Municipal de Saúde', secretario: 'Daniel Mariano', status: 'atencao', resumo: 'Gestão do SUS e saúde pública.', metrics: [{label: 'Fila ESF', value: '88'}, {label: 'Vacinação', value: '94%'}] },
    { id: 'S3', nome: 'Secretaria de Educação e Esportes', secretario: 'Ana Carmelita', status: 'ok', resumo: 'Ensino municipal e fomento ao esporte.', metrics: [{label: 'Alunos', value: '5.200'}, {label: 'Escolas', value: '24'}] },
    { id: 'S4', nome: 'Secretaria de Infraestrutura Urbana', secretario: 'Alex Petroman', status: 'ok', resumo: 'Obras urbanas e pavimentação.', metrics: [{label: 'Obras Ativas', value: '14'}, {label: 'Recapeamento', value: '12km'}] },
    { id: 'S5', nome: 'Secretaria de Infraestrutura Rural', secretario: 'Sidinei Peglow', status: 'ok', resumo: 'Manutenção de estradas e pontes.', metrics: [{label: 'Estradas OK', value: '78%'}, {label: 'Frentes', value: '05'}] },
    { id: 'S6', nome: 'Secretaria de Administração', secretario: 'Aline Flores', status: 'ok', resumo: 'Gestão de RH e patrimônio.', metrics: [{label: 'Processos', value: '142'}, {label: 'RH Digital', value: '85%'}] },
    { id: 'S7', nome: 'Secretaria da Fazenda', secretario: 'Jane Leite', status: 'ok', resumo: 'Equilíbrio fiscal e arrecadação.', metrics: [{label: 'Arrecadação', value: '102%'}, {label: 'Superávit', value: 'R$ 2.4M'}] },
    { id: 'S8', nome: 'Secretaria de Desenvolvimento Rural', secretario: 'Rogerinho', status: 'ok', resumo: 'Apoio ao produtor rural.', metrics: [{label: 'Patrulha Agr.', value: '09'}, {label: 'Assistidos', value: '210'}] },
    { id: 'S9', nome: 'Secretaria de Cultura, Turismo e Eventos', secretario: 'Eva Rosi', status: 'ok', resumo: 'Patrimônio histórico e calendário.', metrics: [{label: 'Turistas/mês', value: '1.2k'}, {label: 'Eventos', value: '03'}] },
    { id: 'S10', nome: 'Secretaria de Habitação e Sustentabilidade', secretario: 'Gildo Silva', status: 'atencao', resumo: 'Regularização e meio ambiente.', metrics: [{label: 'Títulos', value: '42'}, {label: 'Licenças', value: '18'}] },
    { id: 'S11', nome: 'Secretaria de Desenvolvimento Econômico', secretario: 'Clayton Dworzecki', status: 'ok', resumo: 'Atração de empresas e MEIs.', metrics: [{label: 'Novas Empresas', value: '15'}, {label: 'MEIs', value: '122'}] },
    { id: 'S12', nome: 'Secretaria de Desenvolvimento Social', secretario: 'Fabiano Ribeiro', status: 'ok', resumo: 'Programas de assistência social.', metrics: [{label: 'Atendimentos', value: '640'}, {label: 'CRAS', value: '04'}] },
    { id: 'S13', nome: 'Secretaria de Segurança e Mobilidade Urbana', secretario: 'Marcelo Ferreira', status: 'ok', resumo: 'Guarda municipal e trânsito.', metrics: [{label: 'Vigilância', value: '82%'}, {label: 'Ocorrências', value: '12'}] },
    { id: 'S14', nome: 'Procuradoria Municipal', secretario: 'Cesar Augusto Weimer', status: 'ok', resumo: 'Assessoramento jurídico pleno.', metrics: [{label: 'Pareceres', value: '245'}, {label: 'Ações', value: '18'}] },
  ],
  okrs: [
    {
      id: 'OKR1',
      objetivo: 'Digitalização Total da Fazenda Municipal',
      krs: [
        { id: 'KR1', text: 'Portal do Contribuinte 2.0', status: 50, milestones: [] },
        { id: 'KR2', text: 'Redução de Papel em 50%', status: 10, milestones: [] }
      ]
    }
  ],
  swot: {
    forcas: [{ id: 'F1', text: 'Equilíbrio das contas públicas', resp: 'Fazenda' }],
    fraquezas: [{ id: 'W1', text: 'Déficit de maquinário rural', resp: 'Obras' }],
    oportunidades: [{ id: 'O1', text: 'Captação via PAC 3', resp: 'Governo' }],
    ameacas: [{ id: 'A1', text: 'Ano eleitoral e vedações', resp: 'Procuradoria' }]
  },
  kpis: [],
  projetosEstrategicos: [],
  kanbanCards: [],
  entregas: [],
  prioridadesSemanais: [],
  financeiro: [],
  escuta: [
    { 
      id: 'C1', 
      data: '25/11/2024', 
      tema: 'Iluminação Pública', 
      descricao: 'Lâmpadas queimadas na praça principal.', 
      rua: 'Rua Presidente Vargas', 
      bairro: 'Centro', 
      cep: '96180-000',
      solicitante: 'Cidadão Local',
      status: 'recebido', 
      secretaria: 'Infraestrutura Urbana', 
      coordenadas: { lat: -30.8520, lng: -51.8120 } 
    }
  ]
};
