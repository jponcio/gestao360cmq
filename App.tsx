
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Target, Zap, AlertCircle, Lightbulb, ShieldAlert, 
  Lock, Unlock, KeyRound, Save, Info, Plus, Trash2, 
  User, Search, ArrowRight, ArrowDown, GraduationCap, 
  CheckCircle2, Circle, Clock, Check, TrendingUp,
  LayoutDashboard, FolderKanban, CheckSquare, Map as MapIcon,
  ShieldCheck, Activity, Calendar, Briefcase, MessageSquare,
  Users, Building2, HardHat, Heart, GraduationCap as EduIcon,
  Landmark, Globe, Shield, Scale, Tractor, Eye, EyeOff,
  Filter, ChevronRight, BarChart3, BookOpen, Compass, Award,
  MapPin, Navigation2, X, Send, ArrowUpRight, ListTodo, AlertTriangle,
  Tag as TagIcon, MoreHorizontal, Settings2, Sparkles, Pencil, RefreshCw,
  Hash, Map as MapLucide, HelpCircle, Book, ShieldQuestion, ExternalLink,
  Link, MoveUp, MoveDown, MousePointer2, Rocket, Layers, Flag, Archive, ChevronDown,
  BarChart, PieChart, Activity as ActivityIcon
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { DashboardData, Secretaria, KanbanCard, KanbanStatus, EscutaCidada, DependenciaTipo, TipoProjeto } from './types';
import { MOCK_DATA, NAVIGATION } from './constants';
import { getGovernmentInsights } from './services/geminiService';

// --- CONFIGURAÇÃO GLOBAL LEAFLET ---
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- HELPERS ANALYTICS ---
const calculateDaysOld = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return Math.floor(Math.abs(new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  } catch { return 0; }
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    ok: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
    atencao: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
    critico: 'bg-rose-500/20 text-rose-500 border-rose-500/30',
    concluido: 'bg-emerald-500 text-white border-emerald-400',
    'Concluído': 'bg-emerald-500 text-white border-emerald-400',
    'Em Andamento': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Backlog': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    'Depende de': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };
  return <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md border whitespace-nowrap ${styles[status] || 'bg-slate-800 text-slate-400'}`}>{status}</span>;
};

// [SECTION: KANBAN MODULE]
const SecretariaKanban = ({ secretaria, onBack, cards, onUpdateCards }: any) => {
  const [modalMode, setModalMode] = useState<'none' | 'add' | 'edit'>('none');
  const [editingCard, setEditingCard] = useState<KanbanCard | null>(null);
  const [watchedStatus, setWatchedStatus] = useState<KanbanStatus>('Backlog');
  const columns: KanbanStatus[] = ['Backlog', 'Em Andamento', 'Depende de', 'Concluído'];

  const handleSaveCard = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const cardData: KanbanCard = {
      id: editingCard ? editingCard.id : `C${Date.now()}`,
      titulo: fd.get('titulo') as string,
      dono: fd.get('dono') as string,
      status: watchedStatus,
      criadoEm: editingCard?.criadoEm || new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      secretariaId: secretaria.id,
      tipo: (fd.get('tipo') as TipoProjeto) || 'Operacional',
      tags: editingCard?.tags || ['Rotina'],
      justificativa: fd.get('justificativa') as string || '',
    };
    if (modalMode === 'add') onUpdateCards([cardData, ...cards]);
    else onUpdateCards(cards.map((c: any) => c.id === cardData.id ? cardData : c));
    setModalMode('none'); setEditingCard(null);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-32">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-[#1f2937] p-8 rounded-[40px] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-6">
           <button onClick={onBack} className="p-4 bg-white/5 rounded-2xl hover:bg-indigo-600 text-slate-400 transition-all"><ArrowRight className="rotate-180" size={24}/></button>
           <div><h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">{secretaria.nome}</h3><p className="text-xs text-indigo-400 font-black uppercase">{secretaria.secretario}</p></div>
        </div>
        <button onClick={() => setModalMode('add')} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg"><Plus size={18}/> Novo Card</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map(col => {
          const colCards = (cards || []).filter((c: any) => c.status === col);
          return (
            <div key={col} className="bg-[#111827]/50 rounded-[48px] p-6 border border-white/5 min-h-[600px] flex flex-col">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 px-4 flex justify-between">{col} <span className="bg-slate-800 text-indigo-400 px-3 py-1 rounded-full">{colCards.length}</span></h4>
              <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-1">
                {colCards.map((card: any) => {
                   const daysOld = calculateDaysOld(card.atualizadoEm);
                   const isInert = daysOld >= 3 && card.status !== 'Concluído';
                   return (
                    <div key={card.id} onClick={() => { setEditingCard(card); setWatchedStatus(card.status); setModalMode('edit'); }} className={`bg-[#1f2937] border p-6 rounded-[32px] shadow-xl cursor-pointer hover:border-indigo-500/50 transition-all relative group ${isInert ? 'border-rose-500/30' : 'border-white/5'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <StatusBadge status={card.status} />
                        {isInert && <div className="p-1.5 bg-rose-500/10 text-rose-500 rounded-lg animate-pulse" title="Card inerte há +3 dias"><Clock size={12}/></div>}
                      </div>
                      <h5 className="text-white font-black text-sm mb-4 italic leading-tight">{card.titulo}</h5>
                      {card.justificativa && <div className="flex items-center gap-2 text-[9px] text-amber-500 font-bold uppercase mb-4 bg-amber-500/5 p-2 rounded-xl"><AlertTriangle size={10}/> Justificativa Pendente</div>}
                      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{card.dono}</span>
                        <span className="text-[8px] font-black text-slate-600">{daysOld}d</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {modalMode !== 'none' && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 backdrop-blur-md bg-black/70 animate-in fade-in">
          <div className="bg-[#1f2937] border border-white/10 w-full max-w-2xl rounded-[48px] p-10 shadow-3xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h4 className="text-2xl font-black text-white italic uppercase mb-10">{modalMode === 'add' ? 'Nova Demanda' : 'Ajustar Card'}</h4>
            <form onSubmit={handleSaveCard} className="space-y-6">
              <input name="titulo" required defaultValue={editingCard?.titulo} placeholder="Título do Card" className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-indigo-500" />
              <input name="dono" required defaultValue={editingCard?.dono} placeholder="Responsável" className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-indigo-500" />
              
              <div className="space-y-3">
                 <p className="text-[10px] font-black text-slate-500 uppercase italic">Status da Entrega</p>
                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {columns.map(st => (
                      <label key={st} className={`cursor-pointer flex items-center justify-center p-4 rounded-2xl border transition-all ${watchedStatus === st ? 'bg-indigo-600 text-white' : 'bg-black/20 text-slate-500'}`}>
                         <input type="radio" name="status" value={st} checked={watchedStatus === st} onChange={() => setWatchedStatus(st)} className="hidden" />
                         <span className="text-[9px] font-black uppercase">{st}</span>
                      </label>
                    ))}
                 </div>
              </div>

              {watchedStatus === 'Depende de' && (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                   <p className="text-[10px] font-black text-amber-500 uppercase italic">Justificativa de Impedimento</p>
                   <textarea name="justificativa" defaultValue={editingCard?.justificativa} required placeholder="Descreva o motivo do bloqueio ou dependência..." className="w-full h-32 bg-black/20 border border-amber-500/20 rounded-2xl p-6 text-white text-sm resize-none outline-none focus:border-amber-500" />
                </div>
              )}

              <div className="flex gap-4 pt-6">
                 <button type="button" onClick={() => setModalMode('none')} className="flex-1 py-5 bg-white/5 text-slate-500 rounded-[28px] text-[10px] font-black uppercase">Cancelar</button>
                 <button type="submit" className="flex-[2] py-5 bg-indigo-600 text-white rounded-[28px] text-[10px] font-black uppercase shadow-xl italic tracking-widest">Salvar no BI</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// [SECTION: STRATEGY MODULE (OKR/SWOT)]
const EstrategiaModule = ({ swotItems, setSwotItems, okrs, setOkrs, archivedOkrs, setArchivedOkrs }: any) => {
  const [activeQuadrant, setActiveQuadrant] = useState<string | null>(null);
  const [newItem, setNewItem] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [editingOkr, setEditingOkr] = useState<any>(null);

  const handleAddSwot = (quadrant: string | null) => {
    if (!quadrant || !newItem.trim()) return;
    const item = { id: `${quadrant}-${Date.now()}`, text: newItem, resp: 'BI Gestão' };
    setSwotItems((prev: any) => ({ ...prev, [quadrant]: [...(prev[quadrant] || []), item] }));
    setNewItem(''); setActiveQuadrant(null);
  };

  return (
    <div className="space-y-16 animate-in fade-in duration-700 pb-48">
      {/* Banner Diagnóstico SWOT */}
      <div className="bg-gradient-to-br from-slate-900 via-[#1f2937] to-slate-900 rounded-[48px] p-12 lg:p-16 border border-white/10 shadow-3xl relative overflow-hidden group">
         <div className="absolute right-[-50px] top-[-50px] opacity-10 group-hover:rotate-12 transition-transform duration-1000"><Rocket size={400}/></div>
         <div className="relative z-10 max-w-4xl">
           <div className="flex items-center gap-3 mb-6"><Sparkles className="text-amber-400" size={24}/><p className="text-[12px] font-black uppercase text-amber-400 tracking-[0.5em] italic">Estratégia Camaquã 360: Matriz SWOT</p></div>
           <h2 className="text-4xl lg:text-7xl font-black text-white italic uppercase tracking-tighter leading-none mb-8">Diagnóstico de Alta Performance</h2>
           <p className="text-lg text-slate-400 leading-relaxed italic mb-10 max-w-3xl">A matriz SWOT permite identificar forças e fraquezas do <strong>Ambiente Interno</strong>, enquanto monitoramos as oportunidades e ameaças do <strong>Ambiente Externo</strong>.</p>
           <div className="grid grid-cols-2 gap-8">
              <div className="flex items-center gap-3 text-rose-500 font-black uppercase text-xs"><CheckCircle2 size={16}/> Pontos Fortes Internos</div>
              <div className="flex items-center gap-3 text-amber-500 font-black uppercase text-xs"><AlertTriangle size={16}/> Fraquezas e Gargalos</div>
           </div>
         </div>
      </div>

      {/* Grid SWOT */}
      <section className="space-y-12">
        <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter px-4">Matriz Operacional BI</h3>
        <div className="flex flex-col lg:flex-row gap-12 items-start justify-center px-4">
           <div className="relative w-full lg:w-[680px] h-[680px] grid grid-cols-2 grid-rows-2 gap-4">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-44 h-44 bg-[#0f172a] border-[12px] border-[#1f2937] rounded-full shadow-2xl flex items-center justify-center"><Search size={56} className="text-indigo-400" /></div>
              {['forcas', 'fraquezas', 'oportunidades', 'ameacas'].map((q) => (
                <div key={q} className={`${q === 'forcas' ? 'bg-[#ef4444]' : q === 'fraquezas' ? 'bg-[#f59e0b]' : q === 'oportunidades' ? 'bg-[#10b981]' : 'bg-[#3b82f6]'} rounded-[56px] p-10 flex flex-col justify-between shadow-2xl border-2 border-white/20 relative group overflow-hidden`}>
                  <div className="absolute top-[-40px] left-[-40px] opacity-10 font-black text-[180px] italic text-white">{q[0].toUpperCase()}</div>
                  <h4 className="text-3xl font-black text-white italic uppercase relative z-10">{q}</h4>
                  <button onClick={() => setActiveQuadrant(q)} className="bg-white/20 hover:bg-white text-white hover:text-slate-900 w-16 h-16 rounded-3xl flex items-center justify-center transition-all shadow-xl self-end relative z-10"><Plus size={32}/></button>
                </div>
              ))}
           </div>
           <div className="flex-1 w-full bg-[#111827] border border-white/5 rounded-[56px] p-10 h-[680px] overflow-hidden flex flex-col shadow-2xl">
              <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-3"><Layers size={14}/> Timeline de Inteligência</h4>
              <div className="space-y-8 overflow-y-auto custom-scrollbar flex-1 pb-12">
                 {Object.entries(swotItems || {}).map(([key, items]: any) => items.length > 0 && (
                   <div key={key} className="space-y-4">
                      <div className="flex items-center gap-3 sticky top-0 bg-[#111827] py-2 z-10">
                        <div className={`w-3 h-3 rounded-full ${key === 'forcas' ? 'bg-rose-500' : key === 'fraquezas' ? 'bg-amber-500' : key === 'oportunidades' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                        <p className="text-[10px] font-black uppercase text-slate-400 italic">{key}</p>
                      </div>
                      <div className="space-y-3 pl-4 border-l border-white/5">
                        {items.map((item: any) => (
                          <div key={item.id} className="bg-[#1f2937] border border-white/5 p-6 rounded-[32px] shadow-xl flex items-start justify-between group">
                             <div className="max-w-[85%]"><p className="text-sm font-black text-white italic leading-tight mb-4">"{item.text || item.texto}"</p><span className="text-[8px] font-black text-indigo-400 uppercase italic">{item.resp || item.responsavel}</span></div>
                             <button onClick={() => setSwotItems((prev: any) => ({ ...prev, [key]: prev[key].filter((i: any) => i.id !== item.id) }))} className="text-slate-700 hover:text-rose-500 p-2"><Trash2 size={16}/></button>
                          </div>
                        ))}
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* OKR War Room */}
      <section className="space-y-12 px-4">
        <div className="bg-[#facc15] rounded-[60px] p-12 text-slate-900 shadow-3xl flex flex-col lg:flex-row items-center gap-16">
           <div className="flex-1">
             <h3 className="text-5xl font-black italic uppercase tracking-tighter">Gestão Estratégica OKR</h3>
             <p className="text-sm font-bold opacity-60 mt-2 italic uppercase">War Room de Resultados Municipais</p>
           </div>
           <button onClick={() => setIsCreatingNew(true)} className="bg-slate-900 text-white px-8 py-5 rounded-[28px] text-[11px] font-black uppercase italic shadow-2xl flex items-center gap-3"><Plus size={20}/> Novo Objetivo</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {(okrs || []).map((okr: any) => {
             const krs = okr.krs || [];
             const archivedKrs = okr.archivedKrs || [];
             return (
             <div key={okr.id} className="bg-[#1f2937] border border-white/5 p-8 rounded-[48px] shadow-2xl flex flex-col h-[520px] group hover:border-amber-400/30 transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 rounded-2xl bg-amber-400/10 text-amber-400 border border-white/5"><Flag size={24}/></div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-slate-600 uppercase italic">KRs: {krs.length}</span>
                    <button onClick={() => setOkrs((p: any) => p.filter((o: any) => o.id !== okr.id))} className="text-slate-700 hover:text-rose-500 p-2"><Archive size={16}/></button>
                  </div>
                </div>
                <div className="flex-1">
                   <h4 className="text-lg font-black text-white italic uppercase mb-6 line-clamp-3 leading-tight">{okr.objetivo}</h4>
                   <div className="space-y-6">
                      {krs.slice(0, 3).map((kr: any) => (
                        <div key={kr.id} className="space-y-2">
                           <div className="flex justify-between text-[10px] font-black text-slate-400">
                             <span className="truncate max-w-[80%]">"{kr.text}"</span>
                             <span>{kr.status}%</span>
                           </div>
                           <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                             <div className="h-full bg-amber-400 transition-all" style={{ width: `${kr.status}%` }}></div>
                           </div>
                        </div>
                      ))}
                      {archivedKrs.length > 0 && (
                        <div className="pt-4 flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase italic">
                          <Archive size={12}/> {archivedKrs.length} KRs Arquivadas
                        </div>
                      )}
                   </div>
                </div>
                <button onClick={() => setEditingOkr(okr)} className="mt-8 w-full py-4 bg-white/5 border border-white/5 rounded-[28px] text-[9px] font-black text-slate-500 uppercase italic group-hover:text-white group-hover:bg-amber-400/10 transition-all">Painel de Missão</button>
             </div>
           )})}
        </div>
      </section>

      {/* OKR Edit Modal with KR Archive Logic */}
      {editingOkr && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center p-6 backdrop-blur-md bg-black/70 animate-in fade-in">
           <div className="bg-[#1f2937] border border-white/10 w-full max-w-4xl rounded-[60px] p-10 lg:p-14 shadow-3xl overflow-y-auto max-h-[90vh] custom-scrollbar">
              <div className="flex justify-between items-center mb-12">
                 <h5 className="text-3xl font-black text-white italic uppercase tracking-tighter">Gestão de Key Results</h5>
                 <button onClick={() => setEditingOkr(null)} className="text-slate-500 hover:text-white"><X size={32}/></button>
              </div>
              <div className="space-y-12">
                 <div className="space-y-4">
                   <p className="text-[10px] font-black text-slate-500 uppercase italic">Objetivo Mestre</p>
                   <input value={editingOkr.objetivo} onChange={(e) => setEditingOkr({...editingOkr, objetivo: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-[28px] px-8 py-5 text-white font-bold italic outline-none focus:border-amber-400" />
                 </div>

                 <div className="space-y-6">
                    <div className="flex justify-between items-center">
                       <p className="text-[10px] font-black text-amber-400 uppercase italic">Key Results Ativos</p>
                       <button onClick={() => {
                         const nKR = { id: `KR-${Date.now()}`, text: 'Novo Resultado Chave', status: 0 };
                         setEditingOkr({...editingOkr, krs: [...(editingOkr.krs || []), nKR]});
                       }} className="text-[9px] font-black text-indigo-400 uppercase flex items-center gap-2 border border-indigo-400/20 px-4 py-2 rounded-xl hover:bg-indigo-400 hover:text-white transition-all"><Plus size={14}/> Add KR</button>
                    </div>
                    <div className="space-y-4">
                       {(editingOkr.krs || []).map((kr: any) => (
                         <div key={kr.id} className="bg-black/20 p-6 rounded-[32px] border border-white/5 flex items-center gap-6">
                            <input value={kr.text} onChange={(e) => {
                               const nKrs = editingOkr.krs.map((k: any) => k.id === kr.id ? {...k, text: e.target.value} : k);
                               setEditingOkr({...editingOkr, krs: nKrs});
                            }} className="bg-transparent text-sm font-bold text-white outline-none flex-1 italic" />
                            <div className="w-48 flex items-center gap-4">
                               <input type="range" value={kr.status} onChange={(e) => {
                                  const nKrs = editingOkr.krs.map((k: any) => k.id === kr.id ? {...k, status: parseInt(e.target.value)} : k);
                                  setEditingOkr({...editingOkr, krs: nKrs});
                               }} className="flex-1 accent-amber-400" />
                               <span className="text-xs font-black text-amber-400 w-8">{kr.status}%</span>
                            </div>
                            <button onClick={() => {
                               const nKrs = editingOkr.krs.filter((k: any) => k.id !== kr.id);
                               const nArch = [...(editingOkr.archivedKrs || []), kr];
                               setEditingOkr({...editingOkr, krs: nKrs, archivedKrs: nArch});
                            }} className="text-slate-700 hover:text-rose-500 transition-colors"><Archive size={18}/></button>
                         </div>
                       ))}
                    </div>
                 </div>

                 {editingOkr.archivedKrs?.length > 0 && (
                   <div className="space-y-6 pt-10 border-t border-white/5">
                      <p className="text-[10px] font-black text-slate-600 uppercase italic">Key Results Arquivados (Histórico)</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {editingOkr.archivedKrs.map((akr: any) => (
                           <div key={akr.id} className="bg-black/40 p-4 rounded-2xl flex items-center justify-between border border-white/5">
                              <span className="text-[10px] font-bold text-slate-500 italic truncate max-w-[70%] line-through">"{akr.text}"</span>
                              <button onClick={() => {
                                 const nArch = editingOkr.archivedKrs.filter((k: any) => k.id !== akr.id);
                                 const nKrs = [...(editingOkr.krs || []), akr];
                                 setEditingOkr({...editingOkr, archivedKrs: nArch, krs: nKrs});
                              }} className="text-[8px] font-black text-amber-500 uppercase hover:text-white transition-all">Restaurar</button>
                           </div>
                         ))}
                      </div>
                   </div>
                 )}

                 <button onClick={() => { setOkrs((p: any) => p.map((o: any) => o.id === editingOkr.id ? editingOkr : o)); setEditingOkr(null); }} className="w-full py-6 bg-amber-400 text-slate-900 rounded-[32px] text-[11px] font-black uppercase shadow-3xl italic tracking-widest">Consolidar Dados BI</button>
              </div>
           </div>
        </div>
      )}

      {/* SWOT Modals */}
      {activeQuadrant && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center p-6 backdrop-blur-md bg-black/70 animate-in fade-in">
          <div className="bg-[#1f2937] border border-white/10 w-full max-w-xl rounded-[60px] p-12 shadow-3xl">
             <h5 className="text-2xl font-black text-white italic uppercase mb-10">Cadastrar Insight: {activeQuadrant}</h5>
             <textarea value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Descrição estratégica..." className="w-full h-40 bg-black/20 border border-white/10 rounded-[32px] p-8 text-sm text-white resize-none outline-none focus:border-indigo-500" />
             <div className="flex gap-6 mt-10">
                <button onClick={() => setActiveQuadrant(null)} className="flex-1 py-5 bg-white/5 text-slate-500 rounded-[32px] text-[11px] font-black uppercase">Sair</button>
                <button onClick={() => { handleAddSwot(activeQuadrant); }} className="flex-[2] py-5 bg-indigo-600 text-white rounded-[32px] text-[11px] font-black uppercase italic tracking-widest">Gravar Insight</button>
             </div>
          </div>
        </div>
      )}

      {isCreatingNew && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center p-6 backdrop-blur-md bg-black/70 animate-in fade-in">
          <div className="bg-[#1f2937] border border-white/10 w-full max-w-xl rounded-[60px] p-12 shadow-3xl">
             <h5 className="text-3xl font-black text-white italic uppercase mb-10">Novo Objetivo</h5>
             <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); const nO = { id: `OKR-${Date.now()}`, objetivo: fd.get('obj') as string, krs: [], archivedKrs: [] }; setOkrs((p: any) => [nO, ...p]); setIsCreatingNew(false); }} className="space-y-8">
                <input name="obj" required placeholder="Título do Objetivo Mestre" className="w-full bg-black/20 border border-white/10 rounded-[28px] px-8 py-5 text-white italic outline-none focus:border-amber-400" />
                <button type="submit" className="w-full py-5 bg-amber-400 text-slate-900 rounded-[32px] text-[11px] font-black uppercase italic tracking-widest">Criar Objetivo Estratégico</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

// [SECTION: MACRO DASHBOARD RECOVERY]
const MacroDashboard = ({ data, selectedSecretaria, setSelectedSecretaria, kanbanRegistry, onUpdateKanban }: any) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  
  if (selectedSecretaria) return <SecretariaKanban secretaria={selectedSecretaria} onBack={() => setSelectedSecretaria(null)} cards={kanbanRegistry[selectedSecretaria.id] || []} onUpdateCards={(nc: any) => onUpdateKanban(selectedSecretaria.id, nc)} />;

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-24">
      {/* Cards de Métricas Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-[#1f2937] border border-white/5 p-8 rounded-[40px] shadow-xl hover:border-indigo-500/30 transition-all">
          <div className="flex items-center gap-3 text-emerald-500 mb-2 font-black text-[9px] uppercase"><TrendingUp size={14}/> +4.2% YoY</div>
          <p className="text-slate-500 text-[10px] font-black uppercase mb-1">Arrecadação Municipal</p>
          <h4 className="text-3xl font-black text-white italic tracking-tighter">R$ 15.542.000</h4>
        </div>
        
        <div className="bg-[#1f2937] border border-white/5 p-8 rounded-[40px] shadow-xl relative overflow-hidden group">
           <p className="text-slate-500 text-[10px] font-black uppercase mb-1">Saldo em Caixa BI</p>
           {!isUnlocked ? (
              <div className="flex items-center gap-2 bg-slate-900/90 border border-white/10 rounded-2xl px-4 py-2 mt-2">
                <Lock size={16} className="text-indigo-400 animate-pulse"/>
                <input type="password" value={password} onChange={(e) => {setPassword(e.target.value); if(e.target.value === 'camaqua360') setIsUnlocked(true);}} placeholder="Password" className="bg-transparent text-xs font-black text-white outline-none w-28 tracking-widest" />
              </div>
           ) : ( 
             <div className="animate-in fade-in zoom-in-95">
               <h4 className="text-3xl font-black text-white italic tracking-tighter mt-2">R$ 2.422.000</h4>
               <button onClick={() => setIsUnlocked(false)} className="absolute top-4 right-4 text-slate-700 hover:text-white"><EyeOff size={14}/></button>
             </div>
           )}
        </div>

        <div className="bg-[#1f2937] border border-white/5 p-8 rounded-[40px] shadow-xl hover:border-amber-500/30 transition-all">
          <div className="flex items-center gap-3 text-amber-500 mb-2 font-black text-[9px] uppercase"><ActivityIcon size={14}/> Monitoramento Ativo</div>
          <p className="text-slate-500 text-[10px] font-black uppercase mb-1">Obras Ativas</p>
          <h4 className="text-3xl font-black text-white italic tracking-tighter">19 Frentes</h4>
        </div>

        <div className="bg-[#1f2937] border border-white/5 p-8 rounded-[40px] shadow-xl hover:border-indigo-500/30 transition-all">
          <div className="flex items-center gap-3 text-indigo-400 mb-2 font-black text-[9px] uppercase"><MessageSquare size={14}/> Digital Citizen</div>
          <p className="text-slate-500 text-[10px] font-black uppercase mb-1">Escuta Cidadã</p>
          <h4 className="text-3xl font-black text-white italic tracking-tighter">128 Chamados</h4>
        </div>
      </div>

      {/* Grid de Secretarias */}
      <div className="bg-[#1f2937] border border-white/5 rounded-[48px] p-10 lg:p-14 shadow-2xl">
        <div className="flex justify-between items-center mb-16">
           <h3 className="text-3xl font-black text-white uppercase italic leading-none">Status do Secretariado</h3>
           <div className="flex gap-4">
              <span className="flex items-center gap-2 text-[9px] font-black text-emerald-500 uppercase italic"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Eficiente</span>
              <span className="flex items-center gap-2 text-[9px] font-black text-amber-500 uppercase italic"><div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div> Atenção</span>
           </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {(data.secretarias || []).map((sec: any) => (
             <div key={sec.id} className="bg-[#111827]/60 border border-white/5 p-8 rounded-[48px] hover:border-indigo-500/30 transition-all group flex flex-col justify-between h-[600px] shadow-xl relative overflow-hidden">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 rounded-3xl bg-indigo-500/10 text-indigo-400 border border-white/5 shadow-inner">
                      {sec.nome.includes('Saúde') ? <Heart size={24}/> : sec.nome.includes('Educação') ? <EduIcon size={24}/> : <Building2 size={24}/>}
                    </div>
                    <StatusBadge status={sec.status} />
                  </div>
                  <h4 className="text-[14px] font-black text-white uppercase italic mb-1 leading-tight">{sec.nome}</h4>
                  <p className="text-[10px] font-bold text-slate-500 mb-6 uppercase tracking-wider">{sec.secretario}</p>
                  
                  <div className="space-y-4 pt-6 border-t border-white/5">
                     {(sec.metrics || []).map((m: any, idx: number) => (
                       <div key={idx} className="flex justify-between items-center bg-black/20 p-3 rounded-2xl border border-white/5">
                          <span className="text-[8px] font-black text-slate-500 uppercase italic">{m.label}</span>
                          <span className="text-xs font-black text-white italic">{m.value}</span>
                       </div>
                     ))}
                  </div>
                </div>
                <button onClick={() => setSelectedSecretaria(sec)} className="w-full py-5 bg-white/5 hover:bg-indigo-600 rounded-[32px] text-[10px] font-black text-slate-300 group-hover:text-white uppercase tracking-[0.3em] transition-all border border-white/5 flex items-center justify-center gap-2">Gerenciar Pasta <ChevronRight size={14}/></button>
             </div>
          ))}
        </div>
        
        {/* EXECUTIVE ANALYTICS SECTION RESTORED */}
        <div className="mt-20 border-t border-white/5 pt-16">
           <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-10 italic flex items-center gap-3"><PieChart size={16}/> Analytics Consolidado de Gestão</h4>
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="bg-[#111827]/80 border border-white/5 p-10 rounded-[48px] shadow-2xl">
                 <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-8">Performance Geral BI</h5>
                 <div className="flex items-center gap-10">
                    <div className="relative w-32 h-32">
                       <svg className="w-full h-full -rotate-90">
                          <circle cx="64" cy="64" r="50" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
                          <circle cx="64" cy="64" r="50" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="314" strokeDashoffset="78" className="text-indigo-500" strokeLinecap="round" />
                       </svg>
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-black text-white italic leading-none">75%</span>
                          <span className="text-[7px] font-black text-slate-500 uppercase">Eficiência</span>
                       </div>
                    </div>
                    <div className="flex-1 space-y-4">
                       <div className="flex justify-between text-[9px] font-black uppercase text-slate-400"><span>Entregas</span><span className="text-emerald-500">82%</span></div>
                       <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[82%]"></div></div>
                       <div className="flex justify-between text-[9px] font-black uppercase text-slate-400"><span>Prazos</span><span className="text-amber-500">64%</span></div>
                       <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden"><div className="h-full bg-amber-500 w-[64%]"></div></div>
                    </div>
                 </div>
              </div>

              <div className="bg-[#111827]/80 border border-white/5 p-10 rounded-[48px] shadow-2xl col-span-2">
                 <div className="flex justify-between items-center mb-10">
                    <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Frequência Operacional (7 dias)</h5>
                    <div className="flex gap-4"><span className="text-[8px] font-black text-slate-600 uppercase">Seg</span><span className="text-[8px] font-black text-slate-600 uppercase">Ter</span><span className="text-[8px] font-black text-slate-600 uppercase">Qua</span><span className="text-[8px] font-black text-white uppercase italic">Hoje</span></div>
                 </div>
                 <div className="flex items-end justify-between h-24 gap-4 px-2">
                    {[35, 60, 45, 80, 55, 90, 75].map((val, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-3">
                         <div className={`w-full rounded-t-xl transition-all duration-700 ${i === 6 ? 'bg-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-slate-800 hover:bg-slate-700'}`} style={{ height: `${val}%` }}></div>
                         <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

// [SECTION: CITIZEN LISTENING RECOVERY]
const CitizenListening = ({ escuta, onAdd }: any) => {
  const [selectedId, setSelectedId] = useState<string | null>(escuta[0]?.id || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const selectedPoint = useMemo(() => escuta.find((p: any) => p.id === selectedId) || escuta[0], [selectedId, escuta]);

  const MapController = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => { if(center) map.setView(center, 15, { animate: true }); }, [center, map]);
    return null;
  };

  return (
    <div className="h-[75vh] bg-[#1f2937] rounded-[48px] border border-white/5 overflow-hidden shadow-2xl flex flex-col lg:flex-row relative">
      <div className="w-full lg:w-96 bg-[#111827] border-r border-white/5 flex flex-col overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/20">
            <h3 className="text-sm font-black text-white uppercase italic flex items-center gap-2"><MapIcon size={16} className="text-amber-500"/> Território Vivo</h3>
            <button onClick={() => setIsModalOpen(true)} className="p-3 bg-amber-600 rounded-xl text-white hover:bg-amber-500 transition-all shadow-lg"><Plus size={16}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {(escuta || []).map((e: any) => (
            <div key={e.id} onClick={() => setSelectedId(e.id)} className={`p-5 rounded-[28px] border transition-all cursor-pointer relative ${selectedId === e.id ? 'bg-amber-600/15 border-amber-600/50 shadow-xl' : 'bg-white/5 border-white/5 hover:border-amber-500/20'}`}>
              <h4 className="text-[11px] font-black uppercase text-slate-100 italic leading-tight">{e.tema}</h4>
              <p className="text-[10px] text-slate-500 font-medium italic mt-2 line-clamp-2 leading-relaxed">"{e.descricao}"</p>
              <div className="flex justify-between items-center mt-4 pt-2 border-t border-white/5"><span className="text-[8px] font-black text-amber-500/80 uppercase italic">{e.bairro}</span><span className="text-[8px] font-black text-slate-600">{e.data}</span></div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 relative min-h-[400px]">
        <MapContainer center={[-30.8520, -51.8120]} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%', background: '#111827' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapController center={[selectedPoint?.coordenadas.lat || -30.852, selectedPoint?.coordenadas.lng || -51.812]} />
          {(escuta || []).map((e: any) => (<Marker key={e.id} position={[e.coordenadas.lat, e.coordenadas.lng]} icon={DefaultIcon}><Popup><div className="p-4"><h5 className="font-black text-xs uppercase text-amber-500">{e.tema}</h5><p className="text-[10px] text-slate-200 italic mt-1">"{e.descricao}"</p><div className="mt-3 pt-2 border-t border-white/5 flex gap-2"><span className="text-[8px] font-black text-slate-400 uppercase">{e.bairro}</span></div></div></Popup></Marker>))}
        </MapContainer>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 backdrop-blur-md bg-black/70 animate-in fade-in zoom-in-95">
           <div className="bg-[#1f2937] border border-white/10 w-full max-w-2xl rounded-[60px] p-10 shadow-3xl">
              <div className="flex justify-between items-center mb-12">
                <h5 className="text-3xl font-black text-white italic uppercase">Novo Chamado Cidadão</h5>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white"><X size={32}/></button>
              </div>
              <form onSubmit={(ev) => { 
                ev.preventDefault(); 
                const fd = new FormData(ev.currentTarget); 
                onAdd({ 
                  id: `ESC-${Date.now()}`, 
                  data: new Date().toLocaleDateString('pt-BR'), 
                  tema: fd.get('tema'), 
                  descricao: fd.get('desc'), 
                  bairro: fd.get('bairro'), 
                  status: 'recebido', 
                  coordenadas: { lat: -30.852 + (Math.random() * 0.01 - 0.005), lng: -51.812 + (Math.random() * 0.01 - 0.005) } 
                }); 
                setIsModalOpen(false); 
              }} className="space-y-6">
                <input name="tema" required placeholder="Tema (Ex: Iluminação, Asfalto)" className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white italic outline-none focus:border-amber-600" />
                <textarea name="desc" required placeholder="Descrição da ocorrência..." className="w-full h-32 bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white resize-none outline-none focus:border-amber-600 italic" />
                <input name="bairro" required placeholder="Bairro" className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white italic outline-none focus:border-amber-600" />
                <button type="submit" className="w-full py-5 bg-amber-600 text-white rounded-[32px] text-[11px] font-black uppercase italic hover:bg-amber-500 shadow-2xl">Registrar na Ouvidoria BI</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

// [SECTION: GOVERNANCE MANUAL]
const GovernanceManual = () => {
  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-32">
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[48px] p-12 lg:p-16 border border-white/10 shadow-3xl">
        <div className="flex items-center gap-4 mb-8">
           <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md"><BookOpen className="text-indigo-400" size={32}/></div>
           <h2 className="text-4xl lg:text-6xl font-black text-white italic uppercase tracking-tighter">Manual de Governança C360</h2>
        </div>
        <p className="text-lg text-slate-400 leading-relaxed italic max-w-4xl">Este manual estabelece as diretrizes para a gestão de impacto e inteligência governamental da Prefeitura de Camaquã. O sistema utiliza metodologias ágeis (Kanban) e gestão por resultados (OKRs).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { title: 'Gestão de Demandas', desc: 'Utilize o Kanban para monitorar o fluxo de entregas de cada secretaria. Cards inertes por mais de 3 dias são sinalizados em vermelho.', icon: FolderKanban },
          { title: 'OKR & Estratégia', desc: 'Os Objetivos e Resultados-Chave (OKRs) definem as metas prioritárias do governo. A Matriz SWOT auxilia no diagnóstico de riscos.', icon: Target },
          { title: 'Território Vivo', desc: 'A Escuta Cidadã é a principal ferramenta de feedback direto da população, georreferenciada para melhor tomada de decisão.', icon: MapIcon },
          { title: 'Segurança BI', desc: 'Dados financeiros sensíveis são protegidos por camadas de autenticação local. Use a senha de acesso para visualizar o saldo em caixa.', icon: ShieldCheck },
        ].map((item, idx) => (
          <div key={idx} className="bg-[#1f2937] border border-white/5 p-10 rounded-[40px] shadow-xl hover:border-indigo-500/20 transition-all flex gap-8 items-start">
             <div className="p-5 bg-black/20 rounded-[28px] text-indigo-400"><item.icon size={24}/></div>
             <div>
               <h4 className="text-xl font-black text-white italic uppercase mb-4">{item.title}</h4>
               <p className="text-sm text-slate-500 leading-relaxed font-bold italic uppercase">{item.desc}</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// [MAIN APP ENGINE]
const App = () => {
  const [activeTab, setActiveTab] = useState('prefeito');
  const [isSyncing, setIsSyncing] = useState(false);
  const [insights, setInsights] = useState<string>('Painel Executivo v1.8.0...');

  const getInitialState = (key: string, defaultValue: any) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch { return defaultValue; }
  };

  const [kanbanRegistry, setKanbanRegistry] = useState(() => getInitialState('c360_kanban', MOCK_DATA.secretarias.reduce((acc, s) => ({ ...acc, [s.id]: [] }), {})));
  const [localEscuta, setLocalEscuta] = useState(() => getInitialState('c360_escuta', MOCK_DATA.escuta));
  const [swotItems, setSwotItems] = useState(() => getInitialState('c360_swot', MOCK_DATA.swot));
  const [okrs, setOkrs] = useState(() => getInitialState('c360_okrs', MOCK_DATA.okrs));
  const [archivedOkrs, setArchivedOkrs] = useState(() => getInitialState('c360_archived_okrs', []));

  useEffect(() => {
    setIsSyncing(true);
    localStorage.setItem('c360_kanban', JSON.stringify(kanbanRegistry));
    localStorage.setItem('c360_escuta', JSON.stringify(localEscuta));
    localStorage.setItem('c360_swot', JSON.stringify(swotItems));
    localStorage.setItem('c360_okrs', JSON.stringify(okrs));
    localStorage.setItem('c360_archived_okrs', JSON.stringify(archivedOkrs));
    const timer = setTimeout(() => setIsSyncing(false), 800);
    return () => clearTimeout(timer);
  }, [kanbanRegistry, localEscuta, swotItems, okrs, archivedOkrs]);

  const [selectedSecretaria, setSelectedSecretaria] = useState<Secretaria | null>(null);
  useEffect(() => { getGovernmentInsights(MOCK_DATA).then(res => setInsights(res || "Monitoramento BI Ativo.")); }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans flex flex-col relative overflow-x-hidden">
      {/* HUD de Monitoramento */}
      <div className="w-full bg-[#1e293b]/70 border-b border-white/5 py-5 px-8 backdrop-blur-md z-[2000] sticky top-0 shadow-lg">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
           <div className="flex items-center gap-4 flex-1">
             <div className="p-2.5 bg-indigo-500 rounded-xl shadow-lg"><Lightbulb size={16} className="text-white"/></div>
             <p className="text-[11px] font-bold text-slate-300 italic truncate tracking-wide uppercase">{insights}</p>
           </div>
           <div className="hidden lg:flex items-center gap-6">
             <div className="flex items-center gap-2 px-4 py-1.5 bg-black/40 rounded-full border border-white/10">
                <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                <span className="text-[9px] font-black uppercase text-slate-400">{isSyncing ? 'Persistindo BI...' : 'BI Persistente OK'}</span>
             </div>
             <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic border-l border-white/10 pl-8">v1.8.0 SOVEREIGN GOVERNANCE</span>
           </div>
        </div>
      </div>

      <main className="flex-1 w-full max-w-[1600px] mx-auto p-6 lg:p-14">
        <header className="mb-20 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-indigo-600 rounded-[28px] flex items-center justify-center text-white shadow-2xl"><Globe size={32} /></div>
              <div>
                <h1 className="text-5xl lg:text-8xl font-black text-white tracking-tighter uppercase italic leading-none">CAMAQUÃ 360</h1>
                <p className="text-slate-500 text-[12px] font-black uppercase tracking-[0.6em] ml-2 italic mt-2">Inteligência Governamental & Gestão de Impacto</p>
              </div>
            </div>
        </header>

        {activeTab === 'prefeito' && <MacroDashboard data={MOCK_DATA} selectedSecretaria={selectedSecretaria} setSelectedSecretaria={setSelectedSecretaria} kanbanRegistry={kanbanRegistry} onUpdateKanban={(secId: any, cards: any) => setKanbanRegistry((p: any) => ({ ...p, [secId]: cards }))} />}
        {activeTab === 'estrategia' && <EstrategiaModule swotItems={swotItems} setSwotItems={setSwotItems} okrs={okrs} setOkrs={setOkrs} archivedOkrs={archivedOkrs} setArchivedOkrs={setArchivedOkrs} />}
        {activeTab === 'escuta' && <CitizenListening escuta={localEscuta} onAdd={(newE: any) => setLocalEscuta((p: any) => [newE, ...p])} />}
        {activeTab === 'governanca' && <GovernanceManual />}
      </main>

      {/* Navegação High-End */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[3000] w-full max-w-4xl px-8">
        <nav className="bg-[#1e293b]/95 backdrop-blur-3xl border border-white/10 p-4 rounded-[50px] shadow-2xl flex items-center justify-around">
          {NAVIGATION.map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setSelectedSecretaria(null); }} className={`relative flex flex-col items-center justify-center w-24 h-18 rounded-[32px] transition-all duration-300 ${activeTab === item.id ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-200'}`}>
              <item.icon size={activeTab === item.id ? 28 : 22} />
              <span className={`text-[9px] font-black uppercase tracking-tighter mt-1 ${activeTab === item.id ? 'opacity-100' : 'opacity-0'}`}>{item.name}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default App;
