import React, { useState, useEffect, useMemo, memo, useRef } from 'react';
import { 
  Target, Zap, AlertCircle, Lightbulb, ShieldAlert, 
  Lock, Unlock, KeyRound, Save, Info, Plus, Trash2, 
  User, Search, ArrowRight, ArrowDown, CheckCircle2, 
  Clock, Check, TrendingUp, FolderKanban, Map as MapIcon,
  ShieldCheck, Activity, Building2, HardHat, Heart, 
  GraduationCap as EduIcon, Eye, EyeOff, ChevronRight, 
  BarChart3, Compass, MapPin, X, Rocket, Layers, Archive, 
  UserCheck, Trophy, Gavel, Users2, Pencil, ListTodo,
  Sparkles, ChevronDown, ChevronUp, CheckSquare, Calendar,
  MoreHorizontal, Filter, List, BookOpen, HelpCircle,
  FileDown, History, Copy, ClipboardCheck, LayoutList,
  Wand2, Settings2, Tag, AlertTriangle, Briefcase, FileText,
  Navigation
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { DashboardData, Secretaria, KanbanCard, KanbanStatus, EscutaCidada, TipoProjeto } from './types';
import { MOCK_DATA, NAVIGATION } from './constants';
import { getGovernmentInsights } from './services/geminiService';

// --- CONFIGURAÇÃO GLOBAL ---
const EXECUTIVO = {
  prefeito: "Abner Dillmann",
  vice: "Luciano P Dias"
};

const VERSION = "v2.6.0";

// LOCK_MODULE("TerritorioVivo", { immutable: true });
const HARD_LOCK = {
  territorioVivo: true
};

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- HELPERS VISUAIS ---
const StatusBadge = ({ status, small = false }: { status: string, small?: boolean }) => {
  const styles: Record<string, string> = {
    ok: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
    atencao: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
    critico: 'bg-rose-500/20 text-rose-500 border-rose-500/30',
    'Concluído': 'bg-emerald-500 text-white border-emerald-400',
    'Em Andamento': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Backlog': 'bg-slate-700/50 text-slate-300 border-slate-600/30',
    'Em Atenção': 'bg-amber-600/20 text-amber-500 border-amber-600/30',
    'Parado': 'bg-rose-600/20 text-rose-500 border-rose-600/30',
    'Depende de': 'bg-amber-600/20 text-amber-500 border-amber-600/30',
    'Planejado': 'bg-slate-700/50 text-slate-300 border-slate-600',
    'Em risco': 'bg-rose-500/20 text-rose-500 border-rose-500/30',
    'Estratégico': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    'Transversal': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Setorial': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'Em Execução': 'bg-blue-600 text-white border-blue-500',
    'Em Articulação': 'bg-purple-600 text-white border-purple-500',
    'Suspenso': 'bg-slate-900 text-slate-400 border-slate-700',
    'Em Risco ⚠️': 'bg-rose-600 text-white border-rose-500 animate-pulse',
    'Aberta': 'bg-rose-500/20 text-rose-500 border-rose-500/30',
    'Resolvida': 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
  };
  
  const baseClasses = `font-black uppercase rounded-md border whitespace-nowrap italic tracking-tighter`;
  const sizeClasses = small ? 'text-[7px] px-1.5 py-0.2' : 'text-[8px] px-2 py-0.5';
  
  return <span className={`${baseClasses} ${sizeClasses} ${styles[status] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>{status}</span>;
};

const EducationalBanner = ({ title, description, icon: Icon, color = "indigo" }: any) => (
  <div className={`bg-${color}-600 rounded-[48px] p-12 text-white flex flex-col md:flex-row items-center gap-10 shadow-3xl mb-16 relative overflow-hidden group`}>
    <div className="absolute right-0 top-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700"><Icon size={180}/></div>
    <div className="p-8 bg-white/20 rounded-[32px] shrink-0 backdrop-blur-md border border-white/10 shadow-inner"><Icon size={56}/></div>
    <div className="space-y-4 relative z-10">
      <h3 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter leading-none">{title}</h3>
      <p className="text-white/90 font-medium italic max-w-4xl text-lg leading-relaxed">{description}</p>
    </div>
  </div>
);

// [MODULE: KANBAN DA SECRETARIA - v2.6.0 DENSITY & CREATION]
const SecretariaKanban = ({ secretaria, onBack, cards, onUpdateCards }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCard, setNewCard] = useState({
    titulo: '',
    dono: '',
    status: 'Em Andamento' as KanbanStatus,
    tipo: 'Operacional' as TipoProjeto,
    justificativa: '',
    tags: [] as string[]
  });

  const COLUMNS: KanbanStatus[] = ['Backlog', 'Em Andamento', 'Depende de', 'Em Atenção', 'Parado', 'Concluído'];
  const TAGS_OPTIONS = ['Urgente', 'Orçamento', 'Jurídico', 'Intersecretarial', 'Obra'];

  const handleAddCard = () => {
    if (!newCard.titulo.trim()) return;
    if ((newCard.status === 'Parado' || newCard.status === 'Depende de') && !newCard.justificativa.trim()) {
      alert("Justificativa obrigatória para status 'Parado' ou 'Depende de'");
      return;
    }

    const card: KanbanCard = {
      id: `C${Date.now()}`,
      titulo: newCard.titulo,
      secretariaId: secretaria.id,
      dono: newCard.dono || secretaria.secretario,
      status: newCard.status,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      tipo: newCard.tipo,
      tags: newCard.tags,
      justificativa: newCard.justificativa
    };

    onUpdateCards([...cards, card]);
    setIsAdding(false);
    setNewCard({ titulo: '', dono: '', status: 'Em Andamento', tipo: 'Operacional', justificativa: '', tags: [] });
  };

  return (
    <div className="space-y-12 animate-in slide-in-from-right duration-500 pb-48">
      <div className="flex items-center gap-8 bg-[#1f2937] p-8 rounded-[40px] border border-white/5 shadow-2xl">
        <button onClick={onBack} className="p-5 bg-white/5 rounded-2xl text-slate-400 hover:text-white hover:bg-indigo-600 transition-all shadow-xl"><ArrowRight className="rotate-180" size={24}/></button>
        <div>
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">{secretaria.nome}</h2>
          <p className="text-indigo-400 text-[11px] font-black uppercase mt-1 italic tracking-[0.2em]">Secretário(a): {secretaria.secretario}</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="ml-auto flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-indigo-500 transition-all"><Plus size={20}/> Nova Demanda</button>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-12 custom-scrollbar min-h-[700px]">
        {COLUMNS.map(col => (
          <div key={col} className="flex-1 min-w-[280px] bg-black/20 rounded-[40px] border border-white/5 p-6 flex flex-col gap-6">
            <div className="flex justify-between items-center px-2">
               <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{col}</h3>
               <span className="bg-white/5 text-[9px] font-black text-slate-500 px-2 py-0.5 rounded-full">{cards.filter((c:any) => c.status === col).length}</span>
            </div>
            <div className="flex-1 space-y-4">
              {cards.filter((c: any) => c.status === col).map((card: any) => (
                <div key={card.id} className="bg-[#1f2937] border border-white/5 p-6 rounded-[24px] shadow-xl hover:border-indigo-500/30 transition-all group relative">
                  <div className="flex flex-wrap gap-1 mb-3">
                     {card.tags?.map((t: string) => <span key={t} className="text-[7px] font-black uppercase px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded">{t}</span>)}
                  </div>
                  <h4 className="text-[13px] font-bold text-white italic mb-4 leading-tight tracking-tight">{card.titulo}</h4>
                  {card.justificativa && (
                    <div className="mb-4 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                       <p className="text-[8px] font-bold text-amber-500 uppercase italic mb-1">Justificativa:</p>
                       <p className="text-[9px] text-slate-400 italic line-clamp-2 leading-relaxed">"{card.justificativa}"</p>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <span className="text-[8px] font-black text-slate-600 uppercase italic">{card.dono}</span>
                    <div className="flex gap-2">
                       <button onClick={() => onUpdateCards(cards.filter((c:any) => c.id !== card.id))} className="text-slate-800 hover:text-rose-500 opacity-0 group-hover:opacity-100"><Trash2 size={12}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[8000] flex items-center justify-center p-6 backdrop-blur-md bg-black/80 animate-in zoom-in-95 duration-300">
           <div className="bg-[#1f2937] border border-white/10 w-full max-w-xl rounded-[64px] p-12 shadow-3xl">
              <h4 className="text-3xl font-black text-white italic uppercase mb-10 text-center tracking-tighter">Novo Card de Demanda</h4>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-4">Nome da Demanda</label>
                    <input value={newCard.titulo} onChange={e => setNewCard({...newCard, titulo: e.target.value})} placeholder="O que precisa ser feito?" className="w-full bg-black/30 border border-white/10 rounded-3xl px-8 py-4 text-white outline-none focus:border-indigo-500 font-bold italic" />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-4">Responsável</label>
                       <input value={newCard.dono} onChange={e => setNewCard({...newCard, dono: e.target.value})} placeholder="Nome do técnico/gestor..." className="w-full bg-black/30 border border-white/10 rounded-3xl px-6 py-4 text-white font-bold italic" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-4">Status</label>
                       <select value={newCard.status} onChange={e => setNewCard({...newCard, status: e.target.value as any})} className="w-full bg-black/30 border border-white/10 rounded-3xl px-6 py-4 text-white font-bold italic appearance-none cursor-pointer">
                          {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                 </div>
                 {(newCard.status === 'Parado' || newCard.status === 'Depende de') && (
                   <div className="space-y-2 animate-in slide-in-from-top">
                      <label className="text-[9px] font-black text-amber-500 uppercase tracking-widest italic ml-4">Justificativa (Obrigatória)</label>
                      <textarea value={newCard.justificativa} onChange={e => setNewCard({...newCard, justificativa: e.target.value})} placeholder="Por que este card está parado ou dependente?" className="w-full h-24 bg-black/30 border border-amber-500/20 rounded-3xl px-8 py-4 text-white outline-none focus:border-amber-500 font-bold italic resize-none" />
                   </div>
                 )}
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-4">Tags Estratégicas</label>
                    <div className="flex flex-wrap gap-2 px-2">
                       {TAGS_OPTIONS.map(tag => (
                         <button key={tag} onClick={() => {
                           const tags = newCard.tags.includes(tag) ? newCard.tags.filter(t => t !== tag) : [...newCard.tags, tag];
                           setNewCard({...newCard, tags});
                         }} className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase italic transition-all border ${newCard.tags.includes(tag) ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-black/20 border-white/5 text-slate-500'}`}>{tag}</button>
                       ))}
                    </div>
                 </div>
                 <div className="flex gap-6 pt-6">
                    <button onClick={() => setIsAdding(false)} className="flex-1 py-5 bg-white/5 text-slate-500 rounded-3xl font-black uppercase text-[10px] italic">Cancelar</button>
                    <button onClick={handleAddCard} className="flex-[2] py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase italic text-[10px] shadow-2xl">Salvar Demanda</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

// [MODULE: PAINEL MACRO - v2.6.0 SUMMARY PREVIEW]
const MacroDashboard = ({ data, selectedSecretaria, setSelectedSecretaria, kanbanRegistry, onUpdateKanban }: any) => {
  if (selectedSecretaria) return <SecretariaKanban secretaria={selectedSecretaria} onBack={() => setSelectedSecretaria(null)} cards={kanbanRegistry[selectedSecretaria.id] || []} onUpdateCards={(nc: any) => onUpdateKanban(selectedSecretaria.id, nc)} />;
  
  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-24">
      <div className="bg-[#1f2937] border border-white/5 rounded-[64px] p-12 lg:p-16 shadow-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {data.secretarias.map((sec: Secretaria) => {
            const secCards = kanbanRegistry[sec.id] || [];
            const summary = {
              andamento: secCards.filter((c:any) => c.status === 'Em Andamento').length,
              concluido: secCards.filter((c:any) => c.status === 'Concluído').length,
              parado: secCards.filter((c:any) => c.status === 'Parado' || c.status === 'Em Atenção').length,
            };

            return (
              <div key={sec.id} className="bg-[#111827]/70 border border-white/5 p-10 rounded-[56px] hover:border-indigo-500/40 transition-all group flex flex-col justify-between h-[650px] shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-bl-[120px] -mr-12 -mt-12 group-hover:bg-indigo-600/10 transition-all duration-1000"></div>
                  <div>
                    <div className="flex justify-between items-start mb-8">
                      <div className="p-5 rounded-[24px] bg-indigo-500/10 text-indigo-400 border border-white/5 shadow-xl"><Building2 size={28}/></div>
                      <StatusBadge status={sec.status} />
                    </div>
                    <h4 className="text-[17px] font-black text-white uppercase italic mb-1 group-hover:text-indigo-400 transition-colors leading-tight">{sec.nome}</h4>
                    
                    {/* Summary Counters */}
                    <div className="flex gap-3 mt-6">
                       <div className="flex-1 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-3 text-center">
                          <p className="text-[7px] font-black text-blue-400 uppercase italic">Andamento</p>
                          <p className="text-xl font-black text-white mt-1">{summary.andamento}</p>
                       </div>
                       <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 text-center">
                          <p className="text-[7px] font-black text-emerald-400 uppercase italic">Concluído</p>
                          <p className="text-xl font-black text-white mt-1">{summary.concluido}</p>
                       </div>
                       <div className="flex-1 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3 text-center">
                          <p className="text-[7px] font-black text-rose-400 uppercase italic">Atenção</p>
                          <p className="text-xl font-black text-white mt-1">{summary.parado}</p>
                       </div>
                    </div>

                    <div className="space-y-3 pt-8 mt-8 border-t border-white/5">
                      {secCards.slice(0, 2).map((card: any) => (
                        <div key={card.id} className="bg-black/40 p-4 rounded-2xl border border-white/5 relative overflow-hidden">
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${card.status === 'Concluído' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                          <span className="text-[10px] font-bold text-white italic line-clamp-2 leading-tight pl-2">{card.titulo}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setSelectedSecretaria(sec)} className="w-full py-6 bg-white/5 hover:bg-indigo-600 rounded-[32px] text-[11px] font-black text-slate-300 group-hover:text-white uppercase tracking-[0.4em] transition-all border border-white/5 flex items-center justify-center gap-3 mt-10 shadow-2xl italic">Abrir Secretaria <ChevronRight size={18}/></button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// [MODULE: OKR - v2.6.0 STRATEGY CREATION]
const OKRModule = memo(({ okrs, setOkrs }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newOkr, setNewOkr] = useState({ objetivo: '', tipo: 'Estratégico' });

  const handleAddOkr = () => {
    if (!newOkr.objetivo.trim()) return;
    const okr = {
      id: `OKR-${Date.now()}`,
      objetivo: newOkr.objetivo,
      tipo: newOkr.tipo,
      krs: []
    };
    setOkrs([okr, ...okrs]);
    setIsAdding(false);
    setNewOkr({ objetivo: '', tipo: 'Estratégico' });
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-48">
      <EducationalBanner title="Monitoramento de OKRs" description="Conectando visão política a resultados mensuráveis. IA atua como suporte consultivo nas micro-entregas." icon={Target} color="amber" />
      
      <div className="flex justify-end mb-8">
         <button onClick={() => setIsAdding(true)} className="flex items-center gap-3 px-10 py-5 bg-amber-600 text-white rounded-3xl font-black uppercase text-[10px] tracking-widest shadow-2xl hover:bg-amber-500 transition-all italic"><Plus size={20}/> Inserir Nova Estratégia (OKR)</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {okrs.map((okr: any) => (
            <div key={okr.id} className="bg-[#1f2937] border border-white/5 p-12 rounded-[64px] shadow-3xl relative hover:border-amber-500/20 transition-all">
               <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                  <StatusBadge status={okr.tipo || 'Setorial'} />
                  <button onClick={() => setOkrs(okrs.filter((o:any) => o.id !== okr.id))} className="p-3 bg-white/5 text-slate-700 hover:text-rose-500 rounded-xl transition-all"><Trash2 size={16}/></button>
               </div>
               <h4 className="text-2xl font-black text-white italic mb-10 leading-tight"><Trophy className="inline text-amber-500 mr-4 shrink-0" size={28}/> {okr.objetivo}</h4>
               <div className="space-y-4">
                  <div className="p-6 bg-black/20 rounded-[32px] border border-white/5 border-dashed text-center">
                     <p className="text-[10px] font-bold text-slate-500 uppercase italic">Nenhum Key Result cadastrado.</p>
                  </div>
               </div>
            </div>
        ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[8000] flex items-center justify-center p-6 backdrop-blur-md bg-black/80 animate-in zoom-in-95 duration-300">
           <div className="bg-[#1f2937] border border-white/10 w-full max-w-xl rounded-[60px] p-16 shadow-3xl text-center">
              <h4 className="text-3xl font-black text-white italic mb-10 uppercase tracking-tighter">Nova Estratégia de Governo</h4>
              <div className="space-y-8">
                 <div className="space-y-2 text-left">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-4">Objetivo Estratégico</label>
                    <textarea value={newOkr.objetivo} onChange={e => setNewOkr({...newOkr, objetivo: e.target.value})} placeholder="Ex: Transformar Camaquã em um Polo Logístico do RS..." className="w-full h-32 bg-black/30 border border-white/10 rounded-[32px] p-8 text-white outline-none focus:border-amber-500 font-bold italic resize-none shadow-inner" />
                 </div>
                 <div className="space-y-2 text-left">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-4">Tipo de OKR</label>
                    <div className="flex gap-4">
                       {['Estratégico', 'Transversal', 'Setorial'].map(t => (
                         <button key={t} onClick={() => setNewOkr({...newOkr, tipo: t})} className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase italic border transition-all ${newOkr.tipo === t ? 'bg-amber-600 border-amber-400 text-white' : 'bg-black/20 border-white/5 text-slate-500'}`}>{t}</button>
                       ))}
                    </div>
                 </div>
                 <div className="flex gap-6 pt-6">
                    <button onClick={() => setIsAdding(false)} className="flex-1 py-5 bg-white/5 text-slate-500 rounded-3xl font-black uppercase text-[10px] italic">Descartar</button>
                    <button onClick={handleAddOkr} className="flex-[2] py-5 bg-amber-600 text-white rounded-3xl font-black uppercase italic text-[10px] shadow-2xl">Confirmar Estratégia</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
});

// [MODULE: SWOT GOVERNAMENTAL - v2.6.0 NOMINAL PERSISTENCE]
const SWOTModule = ({ swotMatrices, setSwotMatrices, activeSwotId, setActiveSwotId }: any) => {
  const [activeQuadrant, setActiveQuadrant] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState('');
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [confirmNewModal, setConfirmNewModal] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  
  const [saveName, setSaveName] = useState('');
  const [saveRef, setSaveRef] = useState('');

  const currentMatrix = useMemo(() => swotMatrices.find((m: any) => m.id === activeSwotId) || swotMatrices[0], [swotMatrices, activeSwotId]);

  const QUADRANTS: Record<string, { label: string, microcopy: string, bgColor: string, borderColor: string, textColor: string }> = {
    forcas: { label: 'Forças', microcopy: 'Fortalezas internas do governo que impulsionam resultados.', bgColor: 'bg-emerald-900/20', borderColor: 'border-emerald-500', textColor: 'text-emerald-400' },
    fraquezas: { label: 'Fraquezas', microcopy: 'Limitações internas que exigem correção e governança.', bgColor: 'bg-amber-900/20', borderColor: 'border-amber-500', textColor: 'text-amber-400' },
    oportunidades: { label: 'Oportunidades', microcopy: 'Cenários externos favoráveis para expansão de políticas.', bgColor: 'bg-sky-900/20', borderColor: 'border-sky-500', textColor: 'text-sky-400' },
    ameacas: { label: 'Ameaças', microcopy: 'Riscos externos em radar que podem impactar a gestão.', bgColor: 'bg-rose-900/20', borderColor: 'border-rose-500', textColor: 'text-rose-400' }
  };

  const handleSaveMatrixRegistry = () => {
    if (!saveName.trim()) {
      alert("Nome da matriz é obrigatório.");
      return;
    }
    
    const updatedEntry = {
      ...currentMatrix,
      titulo: saveName,
      referencia: saveRef,
      ultimaEdicao: new Date().toISOString()
    };
    
    const newMatrices = swotMatrices.map((m: any) => m.id === activeSwotId ? updatedEntry : m);
    setSwotMatrices(newMatrices);
    localStorage.setItem('camaqua360_swot_registry', JSON.stringify(newMatrices));
    
    setSaveModalOpen(false);
    setShowNotification("Matriz consolidada no Registry Governamental.");
    setTimeout(() => setShowNotification(null), 2000);
  };

  const addItem = () => {
    if (!newItemText.trim() || !activeQuadrant) return;
    const updatedMatrices = swotMatrices.map((m: any) => 
      m.id === activeSwotId ? { ...m, data: { ...m.data, [activeQuadrant]: [...(m.data[activeQuadrant] || []), { id: Date.now(), texto: newItemText }] } } : m
    );
    setSwotMatrices(updatedMatrices);
    setNewItemText(''); 
    setActiveQuadrant(null);
  };

  const removeItem = (quad: string, id: number) => {
    const updatedMatrices = swotMatrices.map((m: any) => 
      m.id === activeSwotId ? { ...m, data: { ...m.data, [quad]: m.data[quad].filter((i: any) => i.id !== id) } } : m
    );
    setSwotMatrices(updatedMatrices);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-48">
      {showNotification && (
        <div className="fixed top-24 right-10 z-[7000] bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-3xl font-black uppercase text-[10px] tracking-widest animate-in slide-in-from-right flex items-center gap-2">
          <CheckCircle2 size={16}/> {showNotification}
        </div>
      )}

      <EducationalBanner 
        title="Matriz SWOT Governamental" 
        description="A análise SWOT é o ponto de partida estratégico para qualquer ação de governo. Este módulo gerencia o diagnóstico institucional através de um Registry persistente."
        icon={Compass} 
        color="emerald" 
      />

      {/* TOP ACTIONS BAR - Registry Management */}
      <div className="bg-[#1f2937] border border-white/5 p-6 rounded-[32px] shadow-2xl flex flex-wrap items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
           <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-xl shadow-inner"><History size={20}/></div>
           <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-2 mb-1 italic">Registry de Matrizes Salvas</span>
              <select 
                value={activeSwotId} 
                onChange={(e) => setActiveSwotId(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-2xl px-6 py-3 text-white outline-none focus:border-indigo-500 font-bold text-xs italic min-w-[320px] shadow-lg"
              >
                {swotMatrices.map((m: any) => (
                  <option key={m.id} value={m.id}>{m.titulo}</option>
                ))}
              </select>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={() => setConfirmNewModal(true)} className="flex items-center gap-2 px-8 py-4 bg-white/5 text-slate-300 rounded-[24px] font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all shadow-xl italic"><Plus size={16}/> Nova Matriz</button>
           <button onClick={() => { setSaveName(currentMatrix.titulo); setSaveRef(currentMatrix.referencia || ''); setSaveModalOpen(true); }} className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-[24px] font-black uppercase text-[10px] tracking-widest shadow-2xl hover:bg-indigo-500 transition-all italic"><Save size={16}/> Salvar Matriz</button>
           <button onClick={() => window.print()} className="flex items-center gap-2 px-8 py-4 border border-indigo-500/30 text-indigo-400 rounded-[24px] font-black uppercase text-[10px] tracking-widest hover:bg-indigo-500 hover:text-white transition-all italic shadow-lg"><FileDown size={16}/> Exportar PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 h-[950px]">
        {Object.entries(QUADRANTS).map(([key, config]) => (
          <div key={key} className={`${config.bgColor} border ${config.borderColor} rounded-[64px] p-12 flex flex-col shadow-3xl relative overflow-hidden transition-all hover:border-white/10`}>
             <div className="flex justify-between items-start mb-6 z-10">
                <div className="space-y-3">
                   <h4 className={`text-4xl font-black ${config.textColor} italic uppercase tracking-tighter leading-none`}>{config.label}</h4>
                   <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest max-w-[320px] italic leading-relaxed">{config.microcopy}</p>
                </div>
                <button onClick={() => setActiveQuadrant(key)} className={`p-6 bg-black/40 ${config.textColor} rounded-3xl hover:bg-white/10 transition-all shadow-2xl border border-white/5`}><Plus size={32}/></button>
             </div>
             <div className="space-y-6 overflow-y-auto custom-scrollbar flex-1 pr-4 z-10 pt-4">
                {(currentMatrix.data[key] || []).map((item: any) => (
                  <div key={item.id} className="bg-black/40 p-8 rounded-[40px] border border-white/5 hover:border-white/10 transition-all flex justify-between group/item items-start gap-4 shadow-inner">
                     <p className="text-[16px] font-bold text-white italic leading-relaxed tracking-tight">"{item.texto}"</p>
                     <button onClick={() => removeItem(key, item.id)} className="text-slate-800 hover:text-rose-500 opacity-0 group-hover/item:opacity-100 transition-all shrink-0"><Trash2 size={20}/></button>
                  </div>
                ))}
             </div>
          </div>
        ))}
      </div>

      {saveModalOpen && (
        <div className="fixed inset-0 z-[8000] flex items-center justify-center p-6 backdrop-blur-md bg-black/80 animate-in zoom-in-95 duration-300">
           <div className="bg-[#1f2937] border border-white/10 w-full max-w-xl rounded-[60px] p-16 shadow-3xl">
              <h4 className="text-3xl font-black text-white italic mb-10 uppercase tracking-tighter text-center">Salvar no histórico de diagnóstico</h4>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-4">Nome da Matriz (Obrigatório)</label>
                    <input autoFocus value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="Ex: SWOT Geral Jan/25..." className="w-full bg-black/30 border border-white/10 rounded-3xl px-8 py-5 text-white outline-none focus:border-indigo-500 font-bold italic shadow-inner" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-4">Referência / Projeto (Opcional)</label>
                    <input value={saveRef} onChange={(e) => setSaveRef(e.target.value)} placeholder="Ex: Revitalização do Centro, Obra X..." className="w-full bg-black/30 border border-white/10 rounded-3xl px-8 py-5 text-white outline-none focus:border-indigo-500 font-bold italic" />
                 </div>
                 <div className="flex gap-6 pt-6">
                    <button onClick={() => setSaveModalOpen(false)} className="flex-1 py-5 bg-white/5 text-slate-500 rounded-3xl font-black uppercase text-[10px] italic">Cancelar</button>
                    <button onClick={handleSaveMatrixRegistry} className="flex-[2] py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase italic text-[10px] shadow-xl">Confirmar e Salvar</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeQuadrant && (
        <div className="fixed inset-0 z-[8000] flex items-center justify-center p-6 backdrop-blur-md bg-black/80 animate-in zoom-in-95 duration-300">
           <div className="bg-[#1f2937] border border-white/10 w-full max-w-lg rounded-[60px] p-16 shadow-3xl text-center">
              <h4 className="text-3xl font-black text-white italic mb-10 uppercase tracking-tighter">Inserir em {QUADRANTS[activeQuadrant].label}</h4>
              <textarea autoFocus value={newItemText} onChange={(e) => setNewItemText(e.target.value)} placeholder="Descreva o ponto estratégico..." className="w-full h-40 bg-black/30 border border-white/10 rounded-[32px] p-8 text-white mb-10 outline-none focus:border-indigo-500 font-bold italic shadow-inner" />
              <div className="flex gap-6"><button onClick={() => setActiveQuadrant(null)} className="flex-1 py-5 bg-white/5 text-slate-500 rounded-3xl font-black uppercase text-[10px] italic">Cancelar</button><button onClick={addItem} className="flex-1 py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase italic text-[10px] shadow-xl">Confirmar</button></div>
           </div>
        </div>
      )}

      {confirmNewModal && (
        <div className="fixed inset-0 z-[8000] flex items-center justify-center p-6 backdrop-blur-md bg-black/80 animate-in zoom-in-95 duration-300">
           <div className="bg-[#1f2937] p-16 rounded-[60px] text-center w-full max-w-lg shadow-3xl border border-white/10">
              <h4 className="text-3xl font-black text-white italic mb-8 uppercase tracking-tighter">Novo Diagnóstico?</h4>
              <p className="text-slate-400 text-sm italic mb-10 leading-relaxed">Isso preparará uma nova matriz em branco. Certifique-se de salvar a atual se desejar mantê-la no histórico.</p>
              <div className="flex gap-6"><button onClick={() => setConfirmNewModal(false)} className="flex-1 py-5 bg-white/5 text-slate-500 rounded-3xl font-black uppercase text-[10px] italic">Não</button><button onClick={() => {
                const newId = `SWOT-${Date.now()}`;
                const newMatrix = { id: newId, titulo: `Nova Matriz - ${new Date().toLocaleDateString('pt-BR')}`, dataCriacao: new Date().toISOString(), ultimaEdicao: new Date().toISOString(), data: { forcas: [], fraquezas: [], oportunidades: [], ameacas: [] } };
                setSwotMatrices([newMatrix, ...swotMatrices]);
                setActiveSwotId(newId); setConfirmNewModal(false);
              }} className="flex-1 py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase italic text-[10px] shadow-2xl">Sim, Iniciar</button></div>
           </div>
        </div>
      )}
    </div>
  );
};

// [MODULE: TERRITÓRIO VIVO - IMMUTABLE LOCK]
const CitizenListening = memo(({ escuta }: any) => (
  <div className="flex h-[80vh] bg-[#1f2937] rounded-[64px] border border-white/5 overflow-hidden shadow-3xl animate-in fade-in duration-500">
    <div className="w-[35%] border-r border-white/5 flex flex-col bg-black/10">
      <div className="p-10 border-b border-white/5 bg-black/20 shrink-0"><h3 className="text-xl font-black text-white italic uppercase tracking-tighter leading-none">Camaquã<br/><span className="text-indigo-500 text-sm">Território Vivo</span></h3></div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
        {escuta.map((item: any) => (
          <div key={item.id} className="p-8 rounded-[40px] border border-white/5 bg-white/5">
             <h4 className="text-[15px] font-black text-white italic leading-tight mb-4 tracking-tight">{item.tema}</h4>
             <div className="flex flex-col gap-1 mb-4"><p className="text-[10px] text-slate-400 italic">📍 {item.rua}, {item.bairro}</p>{item.cep && <p className="text-[10px] text-indigo-400 font-black">CEP: {item.cep}</p>}</div>
             <StatusBadge status={item.status === 'recebido' ? 'Aberta' : item.status === 'resolvido' ? 'Resolvida' : 'Em Andamento'} />
          </div>
        ))}
      </div>
    </div>
    <div className="flex-1 relative bg-black/40 flex items-center justify-center italic opacity-30 uppercase font-black tracking-[1em] text-[10px]">Mapa Territorial Protegido (HARD_LOCK)</div>
  </div>
));

// [MODULE: MANUAL DE GOVERNANÇA - v2.6.0 SCHOOL OF GOV]
const GovernanceManual = () => {
  const SECTIONS = [
    {
      title: "1. O que é Governança Pública",
      content: "Diferente da gestão cotidiana, a governança é o sistema que garante que a Prefeitura tome as decisões certas. No BI 360°, isso significa alinhar o orçamento, a opinião técnica e a vontade política para entregar resultados reais ao cidadão camaquense."
    },
    {
      title: "2. Como usar OKRs na Prefeitura",
      content: "OKR não é tarefa, é resultado. Cada estratégia lançada no módulo OKR deve responder: 'Como saberemos que Camaquã melhorou?'. Use as micro-entregas para rastrear o progresso semanal de cada meta prioritária."
    },
    {
      title: "3. Matriz SWOT como Bússola",
      content: "Use a SWOT antes de lançar novos projetos. Identifique o que temos de forte (equipe técnica, frota) e o que nos ameaça (questões jurídicas, clima). Salve as matrizes por projeto no Registry para consultas futuras."
    },
    {
      title: "4. Kanban das Secretarias",
      content: "O Kanban é a sala de máquinas. Cada secretaria deve atualizar suas pautas diariamente. Cards em 'Parado' ou 'Depende de' são prioridades de articulação para o Prefeito e Secretário de Governo."
    },
    {
      title: "5. Ritmo Semanal e Papéis",
      content: "Segunda-feira: Priorização. Quarta-feira: Articulação Intersecretarial. Sexta-feira: Prestação de contas. O Prefeito arbitra conflitos; os Secretários garantem a execução; a Equipe Técnica alimenta o BI."
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-48">
      <EducationalBanner title="Escola de Governo" description="Manual de Governança Institucional e Ritos de Gestão para o Gabinete Municipal de Camaquã." icon={BookOpen} color="slate" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {SECTIONS.map((sec, i) => (
          <div key={i} className="bg-[#1f2937] border border-white/5 p-12 rounded-[56px] shadow-2xl">
             <h4 className="text-xl font-black text-white italic uppercase mb-6 tracking-tight flex items-center gap-4"><Info className="text-indigo-400" size={24}/> {sec.title}</h4>
             <p className="text-slate-400 text-sm italic leading-relaxed font-medium">{sec.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// [MAIN APP ENGINE]
const App = () => {
  const [activeTab, setActiveTab] = useState('prefeito');
  const [insights, setInsights] = useState<string>('Auditando integridade do BI...');
  const [selectedSecretaria, setSelectedSecretaria] = useState<Secretaria | null>(null);

  const getInitialState = (key: string, defaultValue: any) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch { return defaultValue; }
  };

  const [kanbanRegistry, setKanbanRegistry] = useState(() => getInitialState('c360_kanban', MOCK_DATA.secretarias.reduce((acc, s) => ({ ...acc, [s.id]: [] }), {})));
  const [okrs, setOkrs] = useState(() => getInitialState('c360_okrs', []));
  const [swotMatrices, setSwotMatrices] = useState(() => getInitialState('camaqua360_swot_registry', [{ id: 'SWOT-001', titulo: 'SWOT Geral 2025', dataCriacao: new Date().toISOString(), ultimaEdicao: new Date().toISOString(), data: MOCK_DATA.swot }]));
  const [activeSwotId, setActiveSwotId] = useState(() => getInitialState('c360_active_swot_id', 'SWOT-001'));
  const [escuta, setEscuta] = useState(() => getInitialState('c360_escuta', []));

  useEffect(() => {
    localStorage.setItem('c360_kanban', JSON.stringify(kanbanRegistry));
    localStorage.setItem('c360_okrs', JSON.stringify(okrs));
    localStorage.setItem('camaqua360_swot_registry', JSON.stringify(swotMatrices));
    localStorage.setItem('c360_active_swot_id', JSON.stringify(activeSwotId));
    localStorage.setItem('c360_escuta', JSON.stringify(escuta));
  }, [kanbanRegistry, okrs, swotMatrices, activeSwotId, escuta]);

  useEffect(() => {
    const loadInsights = async () => {
      const dashboardState: any = { ...MOCK_DATA, kanbanCards: Object.values(kanbanRegistry).flat(), okrs, escuta };
      const text = await getGovernmentInsights(dashboardState);
      setInsights(text || "Dashboard executivo sob protocolo v2.6.0.");
    };
    loadInsights();
  }, [kanbanRegistry, okrs]);

  const renderModule = () => {
    switch(activeTab) {
      case 'prefeito': return <MacroDashboard data={MOCK_DATA} selectedSecretaria={selectedSecretaria} setSelectedSecretaria={setSelectedSecretaria} kanbanRegistry={kanbanRegistry} onUpdateKanban={(id:any,nc:any)=>setKanbanRegistry({...kanbanRegistry,[id]:nc})} />;
      case 'projetos': return <GestaoProjetos projetos={[]} />;
      case 'okr': return <OKRModule okrs={okrs} setOkrs={setOkrs} />;
      case 'swot': return <SWOTModule swotMatrices={swotMatrices} setSwotMatrices={setSwotMatrices} activeSwotId={activeSwotId} setActiveSwotId={setActiveSwotId} />;
      case 'escuta': return <CitizenListening escuta={escuta} />;
      case 'governanca': return <GovernanceManual />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans flex flex-col relative custom-scrollbar overflow-x-hidden">
      {/* TOP BAR */}
      <div className="w-full bg-[#1e293b]/95 border-b border-white/5 py-6 px-10 backdrop-blur-md z-[2000] sticky top-0 flex items-center justify-between shadow-2xl">
           <div className="flex items-center gap-5 flex-1 overflow-hidden">
             <div className="p-3 bg-indigo-500 rounded-2xl animate-pulse shadow-lg"><Lightbulb size={18} className="text-white"/></div>
             <p className="text-[12px] font-bold text-slate-300 italic truncate leading-none tracking-tight">{insights}</p>
           </div>
           <div className="flex items-center gap-8 shrink-0 ml-6">
             <div className="flex items-center gap-3 px-5 py-2 bg-black/40 rounded-full border border-white/10 shadow-inner">
               <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">BI 360 PROTEGIDO</span>
             </div>
             <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest italic border-l border-white/10 pl-8">{VERSION} • AUDIT MODE</span>
           </div>
      </div>

      <main className="flex-1 w-full max-w-[1700px] mx-auto p-8 lg:p-16">
        <header className="mb-20 animate-in slide-in-from-top duration-700">
          <h1 className="text-4xl lg:text-[7.2rem] font-black text-white tracking-tighter uppercase italic leading-none opacity-95 transition-all">CAMAQUÃ 360°</h1>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 mt-6 ml-3 opacity-70">
            <p className="text-slate-500 text-[13px] font-black uppercase tracking-widest italic flex items-center gap-2">
              Prefeito: <span className="text-slate-300">{EXECUTIVO.prefeito}</span>
            </p>
            <span className="hidden md:inline text-slate-800 text-lg">/</span>
            <p className="text-slate-500 text-[13px] font-black uppercase tracking-widest italic flex items-center gap-2">
              Vice-prefeito: <span className="text-slate-300">{EXECUTIVO.vice}</span>
            </p>
          </div>
          <p className="text-slate-500 text-[14px] font-black uppercase tracking-[0.9em] ml-3 italic mt-6 opacity-30">Inteligência Governamental e Governança</p>
        </header>

        {renderModule()}
      </main>

      {/* DOCK NAVIGATION */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[3000] w-full max-w-5xl px-8">
        <nav className="bg-[#1e293b]/95 backdrop-blur-3xl border border-white/10 p-5 rounded-[60px] shadow-[0_30px_60px_rgba(0,0,0,0.8)] flex items-center justify-around">
          {NAVIGATION.map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setSelectedSecretaria(null); }} className={`relative flex flex-col items-center justify-center w-32 h-20 rounded-[36px] transition-all duration-500 ${activeTab === item.id ? 'text-indigo-400 bg-indigo-500/15 shadow-inner' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}>
              <item.icon size={activeTab === item.id ? 32 : 24} className="transition-all" />
              <span className={`text-[9px] font-black uppercase tracking-tighter mt-2 transition-all ${activeTab === item.id ? 'opacity-100 translate-y-0' : 'opacity-60'}`}>{item.name}</span>
              {activeTab === item.id && <div className="absolute -bottom-3 w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,1)]"></div>}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

// [MODULE PLACEHOLDERS FOR LOCKED]
const GestaoProjetos = ({ projetos }: any) => (
  <div className="space-y-12 animate-in fade-in duration-700 pb-48">
    <EducationalBanner title="Gestão de Projetos" description="Acompanhamento de prazos e metas prioritárias." icon={Briefcase} color="indigo" />
    <div className="bg-[#1f2937] border border-white/5 rounded-[64px] overflow-hidden shadow-3xl flex items-center justify-center h-96 italic opacity-20 uppercase font-black tracking-[1em] text-[10px]">Módulo Estrutural Protegido</div>
  </div>
);

export default App;