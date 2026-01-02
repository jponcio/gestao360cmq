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
  Navigation, Phone, Stethoscope, BrainCircuit, DollarSign,
  LayoutDashboard, BarChart, Download, FileJson, Bookmark,
  Wallet
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { DashboardData, Secretaria, KanbanCard, KanbanStatus, EscutaCidada, TipoProjeto, ProjetoEstrategico, StatusProjeto, SWOTMatrix, OKR, KeyResult } from './types';
import { MOCK_DATA, NAVIGATION } from './constants';
import { getGovernmentInsights, getTerritoryIntervention } from './services/geminiService';

// --- CONFIGURAÇÃO GLOBAL E PERSISTÊNCIA ---
const EXECUTIVO = { prefeito: "Abner Dillmann", vice: "Luciano P Dias" };
const VERSION = "v3.0.5-ULTIMATE";
const STORAGE_VER = "v3_0_5";

const saveState = (key: string, state: any) => {
  try {
    localStorage.setItem(`BI360_${key}_${STORAGE_VER}`, JSON.stringify(state));
  } catch (e) { console.error(`Erro ao persistir modulo ${key}:`, e); }
};

const loadState = (key: string, defaultValue: any) => {
  try {
    const saved = localStorage.getItem(`BI360_${key}_${STORAGE_VER}`);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch { return defaultValue; }
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
    'Concluída': 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/20',
    'Execução': 'bg-blue-500 text-white border-blue-400',
    'Em Andamento': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Em andamento': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Backlog': 'bg-slate-700/50 text-slate-300 border-slate-600/30',
    'Em Atenção': 'bg-amber-600/20 text-amber-500 border-amber-600/30',
    'Parado': 'bg-rose-600/20 text-rose-500 border-rose-600/30',
    'Planejado': 'bg-slate-700/50 text-slate-300 border-slate-600',
    'Risco': 'bg-rose-600 text-white border-rose-500 animate-pulse',
    'Depende de': 'bg-amber-500 text-white border-amber-400',
    'Aguardando parecer técnico': 'bg-purple-500 text-white border-purple-400',
    'Aguardando parecer': 'bg-purple-500 text-white border-purple-400',
    'Cadastrada': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  };
  const baseClasses = `font-black uppercase rounded-md border whitespace-nowrap italic tracking-tighter transition-all`;
  const sizeClasses = small ? 'text-[7px] px-1.5 py-0.2' : 'text-[8px] px-2 py-0.5';
  return <span className={`${baseClasses} ${sizeClasses} ${styles[status] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>{status}</span>;
};

const EducationalBanner = ({ title, description, icon: Icon, color = "indigo" }: any) => (
  <div className={`bg-${color}-600 rounded-[48px] p-10 text-white flex flex-col md:flex-row items-center gap-10 shadow-3xl mb-12 relative overflow-hidden group`}>
    <div className="absolute right-0 top-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700"><Icon size={180}/></div>
    <div className="p-8 bg-white/20 rounded-[32px] shrink-0 backdrop-blur-md border border-white/10 shadow-inner"><Icon size={56}/></div>
    <div className="space-y-4 relative z-10">
      <h3 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter leading-none">{title}</h3>
      <p className="text-white/90 font-medium italic max-w-4xl text-lg leading-relaxed">{description}</p>
    </div>
  </div>
);

const MapInvalidator = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => { map.invalidateSize(); }, 400); 
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

// --- COMPONENTES DE PERFORMANCE ---
const PerformanceChart = ({ demands, deliveries, bottlenecks }: any) => {
  const max = Math.max(demands, deliveries, bottlenecks, 1);
  const bars = [
    { label: 'Demandas (Escuta)', value: demands, color: 'bg-indigo-500', icon: MapIcon },
    { label: 'Entregas (Concluídas)', value: deliveries, color: 'bg-emerald-500', icon: CheckCircle2 },
    { label: 'Gargalos (Atenção)', value: bottlenecks, color: 'bg-rose-500', icon: AlertTriangle },
  ];

  return (
    <div className="bg-[#1f2937] border border-white/5 p-12 rounded-[56px] shadow-3xl h-full flex flex-col">
      <h4 className="text-xl font-black text-white italic uppercase mb-10 tracking-tighter flex items-center gap-4"><BarChart className="text-indigo-400"/> Monitor de Escala Executiva</h4>
      <div className="flex-1 flex items-end justify-around gap-8 min-h-[220px]">
        {bars.map((bar) => (
          <div key={bar.label} className="flex-1 flex flex-col items-center group">
            <div className="mb-4 text-white font-black italic text-2xl group-hover:scale-125 transition-transform">{bar.value}</div>
            <div 
              className={`${bar.color} w-full rounded-t-[24px] transition-all duration-1000 shadow-lg group-hover:brightness-110`} 
              style={{ height: `${(bar.value / max) * 100}%` }}
            ></div>
            <div className="mt-6 flex flex-col items-center gap-2">
              <bar.icon size={16} className="text-slate-500" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic text-center max-w-[90px]">{bar.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MÓDULO: TERRITÓRIO VIVO ---
const CitizenListening = memo(({ escuta, onUpdateEscuta, onAddEscuta }: any) => {
  const [iaAnalysis, setIaAnalysis] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [newDemand, setNewDemand] = useState({ 
    tema: '', bairro: '', rua: '', nro: '', cep: '', nome: '', telefone: '' 
  });

  const handleCEPBlur = async () => {
    const cleanCep = newDemand.cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setNewDemand(prev => ({ ...prev, rua: data.logradouro || '', bairro: data.bairro || '' }));
        }
      } catch (e) { console.error("CEP Erro", e); }
      finally { setLoadingCep(false); }
    }
  };

  const handleSaveDemand = () => {
    if (!newDemand.tema.trim() || !newDemand.nome.trim()) {
      alert("Por favor, preencha a descrição da demanda e o nome do solicitante.");
      return;
    }
    const demand: EscutaCidada = {
      id: `E-${Date.now()}`, data: new Date().toISOString(), tema: newDemand.tema,
      descricao: `Nome: ${newDemand.nome} | Contato: ${newDemand.telefone}`, rua: newDemand.rua, nro: newDemand.nro,
      bairro: newDemand.bairro, cep: newDemand.cep, solicitante: newDemand.nome,
      telefone: newDemand.telefone, status: 'Cadastrada', secretaria: 'S1',
      coordenadas: { lat: -30.8489 + (Math.random() - 0.5) * 0.03, lng: -51.8030 + (Math.random() - 0.5) * 0.03 }
    };
    onAddEscuta(demand);
    setIsAdding(false);
    setNewDemand({ tema: '', bairro: '', rua: '', nro: '', cep: '', nome: '', telefone: '' });
  };

  const updateDemandStatus = (id: string, newStatus: any) => {
    onUpdateEscuta(escuta.map((e: any) => e.id === id ? { ...e, status: newStatus, updatedAt: new Date().toISOString() } : e));
  };

  const updateJustification = (id: string, text: string) => {
    onUpdateEscuta(escuta.map((e: any) => e.id === id ? { ...e, justificativa: text } : e));
  };

  return (
    <div className="space-y-12 animate-in fade-in pb-48">
      <EducationalBanner title="Território Vivo" description="Monitoramento completo de demandas georreferenciadas com controle de contato e histórico." icon={MapIcon} color="indigo" />
      <div className="flex justify-between items-center bg-[#1f2937] p-8 rounded-[48px] border border-white/5 shadow-2xl">
         <div className="flex items-center gap-4"><MapPin className="text-indigo-500"/><p className="text-[11px] font-black text-slate-300 uppercase tracking-widest italic">Hub de Triagem de Campo</p></div>
         <button onClick={() => setIsAdding(true)} className="px-12 py-6 bg-indigo-600 text-white rounded-[32px] font-black uppercase italic shadow-2xl flex items-center gap-4 hover:bg-indigo-500 transition-all border border-white/10 hover:scale-[1.02] active:scale-95"><Plus size={24}/> Nova Demanda Territorial</button>
      </div>
      <div className="flex h-[800px] bg-[#1f2937] rounded-[64px] border border-white/5 overflow-hidden shadow-3xl">
        <div className="w-[38%] border-r border-white/5 flex flex-col bg-black/10">
          <div className="p-10 border-b border-white/5 bg-black/20 flex justify-between items-center"><h3 className="font-black italic uppercase text-indigo-500 text-sm tracking-widest">Registros Ativos</h3><span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full font-black">{escuta.length}</span></div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            {escuta.map((item: any) => (
              <div key={item.id} className="p-8 rounded-[40px] border border-white/5 bg-white/5 group hover:border-indigo-500/30 transition-all space-y-5">
                 <div className="flex justify-between items-start">
                    <div className="flex-1"><h4 className="text-[14px] font-black text-white italic tracking-tight leading-snug">{item.tema}</h4><p className="text-[10px] text-slate-500 italic uppercase mt-1">Soli: {item.solicitante}</p></div>
                    <StatusBadge status={item.status} small />
                 </div>
                 <div className="space-y-1.5 p-4 bg-black/20 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-2"><MapPin size={12} className="text-indigo-500"/> {item.bairro} | {item.rua}, {item.nro}</p>
                    <p className="text-[9px] text-slate-500 font-black italic flex items-center gap-2"><Phone size={10} className="text-emerald-500"/> {item.telefone}</p>
                 </div>
                 <div className="pt-4 border-t border-white/5 space-y-4">
                    <div className="flex items-center gap-3">
                       <label className="text-[9px] font-black uppercase text-slate-600 italic">Alterar Status:</label>
                       <select value={item.status} onChange={(e) => updateDemandStatus(item.id, e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-black text-slate-300 outline-none focus:border-indigo-500 transition-all cursor-pointer">
                         {['Cadastrada', 'Em andamento', 'Depende de', 'Aguardando parecer técnico', 'Parado', 'Concluída'].map(s => <option key={s} value={s}>{s}</option>)}
                       </select>
                    </div>
                    {['Depende de', 'Aguardando parecer técnico', 'Parado', 'Concluída'].includes(item.status) && (
                      <div className="animate-in slide-in-from-top duration-500">
                         <label className="text-[8px] font-black uppercase text-amber-500 italic mb-2 block">Despacho / Justificativa:</label>
                         <textarea value={item.justificativa || ''} onChange={(e) => updateJustification(item.id, e.target.value)} placeholder="Descreva o motivo ou a ação tomada..." className="w-full bg-black/50 border border-amber-500/20 rounded-2xl p-4 text-[11px] text-slate-300 italic outline-none focus:border-amber-500/50 min-h-[80px]" />
                      </div>
                    )}
                 </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 relative z-10 bg-black/20">
          <MapContainer center={[-30.8489, -51.8030]} zoom={14} className="w-full h-full">
            <MapInvalidator /><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {escuta.map((item:any) => (
              <Marker key={item.id} position={[item.coordenadas?.lat || -30.84, item.coordenadas?.lng || -51.80]}>
                <Popup><div className="p-3 font-black italic text-sm text-slate-800"><p className="border-b border-slate-200 pb-2 mb-2">{item.tema}</p><span className="text-[10px] text-slate-500 uppercase">{item.bairro} - {item.rua}, {item.nro}</span></div></Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[8000] flex items-center justify-center p-6 backdrop-blur-md bg-black/80 animate-in zoom-in-95 duration-300">
           <div className="bg-[#1f2937] border border-white/10 w-full max-w-3xl rounded-[64px] p-12 shadow-3xl max-h-[95vh] overflow-y-auto custom-scrollbar">
              <h4 className="text-4xl font-black text-white italic uppercase mb-12 text-center tracking-tighter">Lançar Demanda Municipal</h4>
              <div className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase italic px-4">Nome do Solicitante</label>
                       <input value={newDemand.nome} onChange={e=>setNewDemand({...newDemand, nome: e.target.value})} placeholder="Ex: João da Silva..." className="w-full bg-black/30 border border-white/10 rounded-3xl px-8 py-5 text-white font-bold italic outline-none focus:border-indigo-500 shadow-inner" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase italic px-4">WhatsApp / Telefone</label>
                       <input value={newDemand.telefone} onChange={e=>setNewDemand({...newDemand, telefone: e.target.value})} placeholder="(51) 99999-9999" className="w-full bg-black/30 border border-white/10 rounded-3xl px-8 py-5 text-white italic outline-none focus:border-indigo-500 shadow-inner" />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase italic px-4">Descrição da Demanda</label>
                    <input value={newDemand.tema} onChange={e=>setNewDemand({...newDemand, tema: e.target.value})} placeholder="Ex: Substituição de lâmpada queimada no poste..." className="w-full bg-black/30 border border-white/10 rounded-3xl px-8 py-5 text-white font-bold italic outline-none focus:border-indigo-500 shadow-inner" />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-2 col-span-1">
                       <label className="text-[10px] font-black text-slate-500 uppercase italic px-4">CEP</label>
                       <input value={newDemand.cep} onBlur={handleCEPBlur} onChange={e=>setNewDemand({...newDemand, cep: e.target.value})} placeholder="96180-000" className="w-full bg-black/30 border border-white/10 rounded-3xl px-8 py-5 text-white font-bold outline-none focus:border-indigo-500 shadow-inner" />
                       {loadingCep && <span className="text-[8px] text-indigo-400 px-4 animate-pulse">Buscando endereço...</span>}
                    </div>
                    <div className="space-y-2 col-span-3">
                       <label className="text-[10px] font-black text-slate-500 uppercase italic px-4">Bairro</label>
                       <input value={newDemand.bairro} onChange={e=>setNewDemand({...newDemand, bairro: e.target.value})} placeholder="Bairro..." className="w-full bg-black/30 border border-white/10 rounded-3xl px-8 py-5 text-white italic outline-none focus:border-indigo-500 shadow-inner" />
                    </div>
                 </div>

                 <div className="grid grid-cols-4 gap-6">
                    <div className="space-y-2 col-span-3">
                       <label className="text-[10px] font-black text-slate-500 uppercase italic px-4">Logradouro (Rua)</label>
                       <input value={newDemand.rua} onChange={e=>setNewDemand({...newDemand, rua: e.target.value})} placeholder="Nome da rua..." className="w-full bg-black/30 border border-white/10 rounded-3xl px-8 py-5 text-white italic outline-none focus:border-indigo-500 shadow-inner" />
                    </div>
                    <div className="space-y-2 col-span-1">
                       <label className="text-[10px] font-black text-slate-500 uppercase italic px-4">N°</label>
                       <input value={newDemand.nro} onChange={e=>setNewDemand({...newDemand, nro: e.target.value})} placeholder="S/N" className="w-full bg-black/30 border border-white/10 rounded-3xl px-8 py-5 text-white font-bold outline-none focus:border-indigo-500 shadow-inner" />
                    </div>
                 </div>

                 <div className="flex gap-6 pt-12">
                    <button onClick={()=>setIsAdding(false)} className="flex-1 py-7 bg-white/5 rounded-[40px] font-black uppercase text-slate-500 italic tracking-widest hover:bg-rose-500/10 hover:text-rose-500 transition-all">Cancelar</button>
                    <button onClick={handleSaveDemand} className="flex-[2] py-7 bg-indigo-600 text-white rounded-[40px] font-black uppercase italic shadow-2xl tracking-widest border border-white/10 hover:bg-indigo-500 transition-all">Gravar e Georreferenciar</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
});

// --- MÓDULO: SWOT (PRESERVADO) ---
const SWOTModule = ({ swotMatrices, setSwotMatrices }: any) => {
  const [activeId, setActiveId] = useState(swotMatrices[0]?.id || 'SWOT-1');
  const [isAddingMatrix, setIsAddingMatrix] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const current = useMemo(() => swotMatrices.find((m: any) => m.id === activeId) || swotMatrices[0], [activeId, swotMatrices]);

  const handleExportPDF = () => {
    const doc = new (window as any).jspdf.jsPDF();
    doc.setFontSize(22); doc.text(`MATRIZ SWOT: ${current.titulo}`, 20, 20);
    doc.setFontSize(12); doc.text(`Camaquã 360 - Diagnóstico Estratégico em ${new Date().toLocaleDateString()}`, 20, 30);
    doc.line(20, 35, 190, 35);
    const quadrants = [{ label: 'FORÇAS', points: current.data.forcas || [] }, { label: 'FRAQUEZAS', points: current.data.fraquezas || [] }, { label: 'OPORTUNIDADES', points: current.data.oportunidades || [] }, { label: 'AMEAÇAS', points: current.data.ameacas || [] }];
    let y = 50;
    quadrants.forEach(q => {
      doc.setFontSize(14); doc.setFont(undefined, 'bold'); doc.text(q.label, 20, y);
      y += 10; doc.setFontSize(10); doc.setFont(undefined, 'normal');
      q.points.forEach((p: string) => { doc.text(`- ${p}`, 25, y); y += 7; if (y > 280) { doc.addPage(); y = 20; } });
      y += 5;
    });
    doc.save(`swot-camaqua-${current.titulo.toLowerCase().replace(/\s/g, '-')}.pdf`);
  };

  const Quadrant = ({ title, type, color, points }: any) => (
    <div className={`bg-black/20 border border-white/5 rounded-[48px] p-8 flex flex-col h-[400px] hover:border-${color}-500/20 transition-all`}>
      <h4 className={`text-xl font-black uppercase italic mb-6 text-${color}-500 tracking-tighter`}>{title}</h4>
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
        {points.map((p: string, i: number) => (
          <div key={i} className="bg-white/5 p-5 rounded-2xl text-[11px] font-bold italic text-slate-300 border border-white/5 flex justify-between group hover:bg-white/10">
            {p}<button onClick={() => { const nextPoints = points.filter((_:any,idx:number)=>idx!==i); setSwotMatrices(swotMatrices.map((m:any)=> m.id === activeId ? {...m, data: {...m.data, [type]: nextPoints}} : m)); }} className="opacity-0 group-hover:opacity-100 text-rose-500 transition-all"><Trash2 size={14}/></button>
          </div>
        ))}
      </div>
      <input onKeyDown={(e: any) => { if (e.key === 'Enter' && e.target.value.trim()) { const nextPoints = [...points, e.target.value.trim()]; setSwotMatrices(swotMatrices.map((m:any)=> m.id === activeId ? {...m, data: {...m.data, [type]: nextPoints}} : m)); e.target.value = ''; } }} placeholder="Adicionar..." className="mt-6 bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-[11px] text-white italic outline-none focus:border-indigo-500" />
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in pb-48">
      <EducationalBanner title="Matriz SWOT Estratégica" description="Diagnóstico analítico para embasamento de políticas públicas e gestão de riscos." icon={Compass} color="emerald" />
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-[#1f2937] p-8 rounded-[48px] border border-white/5 shadow-2xl">
         <div className="flex gap-4 overflow-x-auto custom-scrollbar max-w-full pb-2">
            {swotMatrices.filter((m: any) => !m.arquivada).map((m: any) => (
              <button key={m.id} onClick={() => setActiveId(m.id)} className={`px-8 py-4 rounded-3xl font-black uppercase italic text-[10px] transition-all whitespace-nowrap ${activeId === m.id ? 'bg-emerald-600 text-white shadow-xl' : 'bg-white/5 text-slate-500 hover:text-slate-300'}`}>{m.titulo}</button>
            ))}
            <button onClick={() => setIsAddingMatrix(true)} className="p-4 bg-emerald-500/10 text-emerald-500 rounded-3xl hover:bg-emerald-500 hover:text-white transition-all"><Plus size={20}/></button>
         </div>
         <div className="flex gap-4 shrink-0">
            <button onClick={() => setSwotMatrices(swotMatrices.map((m:any)=>m.id===activeId?{...m,arquivada:!m.arquivada}:m))} className="p-5 bg-white/5 text-slate-400 rounded-3xl hover:text-amber-500 transition-all border border-white/5"><Archive size={20}/></button>
            <button onClick={handleExportPDF} className="px-10 py-5 bg-indigo-600 text-white rounded-[28px] font-black uppercase italic text-[10px] shadow-2xl flex items-center gap-3 hover:bg-indigo-500"><Download size={18}/> Exportar PDF</button>
         </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <Quadrant title="Forças" type="forcas" color="emerald" points={current?.data?.forcas || []} />
        <Quadrant title="Fraquezas" type="fraquezas" color="amber" points={current?.data?.fraquezas || []} />
        <Quadrant title="Oportunidades" type="oportunidades" color="sky" points={current?.data?.oportunidades || []} />
        <Quadrant title="Ameaças" type="ameacas" color="rose" points={current?.data?.ameacas || []} />
      </div>
    </div>
  );
};

// --- MÓDULO: OKR (HABILITADO) ---
const OKRModule = ({ okrs, setOkrs }: { okrs: OKR[], setOkrs: (val: OKR[]) => void }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newOkr, setNewOkr] = useState({ objetivo: '', status: 'Em andamento' as any });

  const addOkr = () => {
    if (!newOkr.objetivo.trim()) return;
    const okr: OKR = {
      id: `OKR-${Date.now()}`,
      objetivo: newOkr.objetivo,
      status: newOkr.status,
      subEstrategias: []
    };
    setOkrs([okr, ...okrs]);
    setIsAdding(false);
    setNewOkr({ objetivo: '', status: 'Em andamento' });
  };

  const toggleKR = (okrId: string, krId: string) => {
    setOkrs(okrs.map(o => o.id === okrId ? {
      ...o, subEstrategias: o.subEstrategias.map(kr => kr.id === krId ? { ...kr, concluida: !kr.concluida } : kr)
    } : o));
  };

  const addKR = (okrId: string, text: string) => {
    if (!text.trim()) return;
    setOkrs(okrs.map(o => o.id === okrId ? {
      ...o, subEstrategias: [...o.subEstrategias, { id: `KR-${Date.now()}`, texto: text, concluida: false }]
    } : o));
  };

  return (
    <div className="space-y-12 animate-in fade-in pb-48">
      <EducationalBanner title="Gestão por OKRs" description="Monitoramento de resultados-chave alinhados ao plano de governo." icon={Target} color="amber" />
      <div className="flex justify-end"><button onClick={() => setIsAdding(true)} className="px-10 py-5 bg-amber-600 text-white rounded-3xl font-black uppercase italic text-[10px] shadow-2xl flex items-center gap-3"><Plus size={18}/> Novo Objetivo Macro</button></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {okrs.map(okr => (
          <div key={okr.id} className="bg-[#1f2937] p-12 rounded-[64px] border border-white/5 relative group">
             <div className="flex justify-between items-start mb-8"><StatusBadge status={okr.status}/> <button onClick={() => setOkrs(okrs.filter(o=>o.id!==okr.id))} className="text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button></div>
             <h4 className="text-2xl font-black text-white italic mb-10 leading-tight tracking-tighter uppercase">{okr.objetivo}</h4>
             <div className="space-y-4">
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] italic mb-4">Resultados-Chave (KRs)</p>
                {okr.subEstrategias.map(kr => (
                  <div key={kr.id} onClick={() => toggleKR(okr.id, kr.id)} className="flex items-center gap-4 p-5 rounded-3xl bg-black/20 border border-white/5 cursor-pointer hover:border-amber-500/30 transition-all">
                     <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${kr.concluida ? 'bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-500/20' : 'border-slate-700'}`}>
                        {kr.concluida && <Check size={14} className="text-white"/>}
                     </div>
                     <span className={`text-[12px] font-bold italic ${kr.concluida ? 'text-slate-500 line-through' : 'text-slate-300'}`}>{kr.texto}</span>
                  </div>
                ))}
                <input onKeyDown={(e:any) => { if(e.key === 'Enter') { addKR(okr.id, e.target.value); e.target.value = ''; } }} placeholder="Adicionar KR..." className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-[11px] text-white italic outline-none focus:border-amber-500 mt-6" />
             </div>
          </div>
        ))}
      </div>
      {isAdding && (
        <div className="fixed inset-0 z-[8000] flex items-center justify-center p-6 backdrop-blur-md bg-black/80">
           <div className="bg-[#1f2937] border border-white/10 w-full max-w-xl rounded-[64px] p-12 shadow-3xl">
              <h4 className="text-3xl font-black text-white italic uppercase mb-10 text-center tracking-tighter">Lançar OKR Estratégico</h4>
              <div className="space-y-6">
                <input value={newOkr.objetivo} onChange={e=>setNewOkr({...newOkr, objetivo: e.target.value})} placeholder="Objetivo Principal (ex: Zerar fila da saúde)..." className="w-full bg-black/30 border border-white/10 rounded-3xl px-8 py-5 text-white font-bold italic outline-none focus:border-amber-500 shadow-inner" />
                <div className="flex gap-6 pt-8"><button onClick={()=>setIsAdding(false)} className="flex-1 py-6 bg-white/5 rounded-[32px] font-black uppercase text-slate-500 italic">Cancelar</button><button onClick={addOkr} className="flex-[2] py-6 bg-amber-600 text-white rounded-[32px] font-black uppercase italic shadow-2xl">Gravar Objetivo</button></div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

// --- MÓDULO MACRO (CENTRO DE COMANDO) ---
const MacroDashboard = ({ data, selectedSecretaria, setSelectedSecretaria, kanbanRegistry, onUpdateKanban, insights, demands, deliveries, bottlenecks }: any) => {
  const [financialLocked, setFinancialLocked] = useState(true);

  const handleUnlock = () => {
    const password = prompt("Insira a senha de acesso financeiro:");
    if (password === '1234') { setFinancialLocked(false); } 
    else { alert("Senha incorreta. Acesso negado."); }
  };

  if (selectedSecretaria) {
    return <SecretariaKanban secretaria={selectedSecretaria} onBack={() => setSelectedSecretaria(null)} cards={kanbanRegistry[selectedSecretaria.id] || []} onUpdateCards={(nc: any) => onUpdateKanban(selectedSecretaria.id, nc)} />;
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-48">
      <EducationalBanner title="Centro de Comando 360" description="Apoio estratégico à decisão integrando fluxos de pautas e demandas da população." icon={LayoutDashboard} color="indigo" />
      
      {/* SEÇÃO DE PERFORMANCE E FINANCEIRO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
        <div className="lg:col-span-2">
          <PerformanceChart demands={demands} deliveries={deliveries} bottlenecks={bottlenecks} />
        </div>
        
        {/* RECURSOS EM CAIXA - COM SENHA E BLUR */}
        <div className="bg-[#1f2937] border border-white/5 p-12 rounded-[56px] shadow-3xl flex flex-col justify-between relative overflow-hidden group">
           <div className="absolute -right-10 -top-10 p-20 bg-emerald-500/5 rounded-full blur-3xl"></div>
           <div className="flex justify-between items-start relative z-10">
              <div className="p-5 bg-emerald-500/10 rounded-3xl text-emerald-500 shadow-xl"><Wallet size={32}/></div>
              <button onClick={financialLocked ? handleUnlock : () => setFinancialLocked(true)} className="p-3 bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all">
                {financialLocked ? <Lock size={18}/> : <Unlock size={18} className="text-emerald-500"/>}
              </button>
           </div>
           <div className="mt-8 relative z-10">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">Recursos Ativos em Caixa</p>
              <h3 className={`text-4xl font-black text-white italic transition-all duration-700 ${financialLocked ? 'blur-xl select-none opacity-40' : 'blur-0'}`}>
                R$ 42.850.312,40
              </h3>
              <p className="text-[9px] font-black text-emerald-500/50 uppercase italic mt-4 tracking-widest flex items-center gap-2">
                 <Activity size={12}/> Disponibilidade Imediata
              </p>
           </div>
           <div className="pt-8 border-t border-white/5 mt-8 relative z-10">
              <div className="flex justify-between items-center mb-2">
                 <span className="text-[9px] font-black text-slate-600 uppercase italic">Tesouro Municipal</span>
                 <span className="text-[10px] font-black text-slate-300 italic">Ativo</span>
              </div>
           </div>
        </div>
      </div>

      {/* GRID DE SECRETARIAS COM PREVIEW TRELLO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        {data.secretarias.map((s: Secretaria) => {
          const sCards = kanbanRegistry[s.id] || [];
          return (
            <div key={s.id} onClick={() => setSelectedSecretaria(s)} className="bg-[#1f2937] border border-white/5 p-10 rounded-[56px] shadow-3xl hover:border-indigo-500/50 hover:translate-y-[-8px] transition-all cursor-pointer group flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <div className="p-5 bg-indigo-500/10 rounded-3xl text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xl"><Building2 size={24} /></div>
                <StatusBadge status={s.status} small />
              </div>
              <h4 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2 group-hover:text-indigo-400 transition-colors leading-none truncate">{s.nome}</h4>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-tight mb-8">Sec: {s.secretario}</p>
              
              {/* TRELLO PREVIEW SECTION */}
              <div className="flex-1 space-y-3 mb-6">
                 <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic border-b border-white/5 pb-2">Pautas Ativas</p>
                 {sCards.length > 0 ? sCards.slice(0, 3).map((c: any) => (
                    <div key={c.id} className="bg-black/20 p-4 rounded-2xl border border-white/5 group-hover:border-indigo-500/20 transition-all">
                       <div className="flex items-center gap-2 mb-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${c.status === 'Concluído' ? 'bg-emerald-500' : 'bg-indigo-500'}`}></div>
                          <span className="text-[7px] font-black text-slate-500 uppercase italic truncate">{c.status}</span>
                       </div>
                       <p className="text-[9px] font-bold text-slate-300 italic leading-tight line-clamp-1">{c.titulo}</p>
                    </div>
                 )) : (
                    <p className="text-[8px] text-slate-700 italic font-black uppercase tracking-widest py-6 text-center opacity-40">Sem pautas registradas</p>
                 )}
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-between items-center mt-auto">
                <span className="text-[9px] font-black text-indigo-400 uppercase italic">{sCards.length} Fluxos</span>
                <ChevronRight size={18} className="text-slate-700 group-hover:text-indigo-500 group-hover:translate-x-2 transition-all" />
              </div>
            </div>
          );
        })}
      </div>

      {/* INTELIGÊNCIA DE GABINETE NO RODAPÉ */}
      <div className="bg-[#1f2937] border border-white/5 p-12 rounded-[56px] shadow-3xl flex flex-col md:flex-row justify-between relative group mt-12 animate-in slide-in-from-bottom duration-1000">
          <div className="flex flex-col md:flex-row items-center gap-10 w-full">
            <div className="p-8 bg-indigo-600 rounded-[36px] text-white shadow-2xl animate-pulse shrink-0"><BrainCircuit size={48}/></div>
            <div className="flex-1 space-y-6">
               <div>
                  <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">Inteligência de Gabinete</h4>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic tracking-[0.2em] mt-2">Sincronização de Dados Gemini em Tempo Real</p>
               </div>
               <div className="bg-black/40 border border-indigo-500/20 rounded-[40px] p-10 shadow-inner">
                  <p className="text-[15px] font-bold text-slate-300 italic leading-relaxed tracking-tight">{insights}</p>
               </div>
               <div className="flex items-center justify-between text-[11px] font-black uppercase italic tracking-widest text-emerald-500 pt-4">
                  <span className="flex items-center gap-3"><ShieldCheck size={18}/> Protocolo de Gestão Camaquã - Ativo</span>
               </div>
            </div>
          </div>
      </div>
    </div>
  );
};

// --- MÓDULO KANBAN (PRESERVADO) ---
const SecretariaKanban = ({ secretaria, onBack, cards, onUpdateCards }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCard, setNewCard] = useState({ titulo: '', dono: '', tipo: 'Operacional' });
  const columns: KanbanStatus[] = ['Backlog', 'Em Andamento', 'Depende de', 'Em Atenção', 'Parado', 'Concluído'];

  const handleAddCard = () => {
    if (!newCard.titulo.trim()) return;
    const card: KanbanCard = {
      id: `C-${Date.now()}`, titulo: newCard.titulo, secretariaId: secretaria.id,
      dono: newCard.dono || secretaria.secretario, status: 'Backlog', criadoEm: new Date().toISOString(),
      updatedAt: new Date().toISOString(), tipo: newCard.tipo as TipoProjeto, tags: []
    };
    onUpdateCards([...cards, card]); setIsAdding(false);
    setNewCard({ titulo: '', dono: '', tipo: 'Operacional' });
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-48">
      <div className="flex items-center gap-8 mb-12"><button onClick={onBack} className="p-6 bg-white/5 rounded-[32px] text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5"><ChevronRight size={24} className="rotate-180"/></button><h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">{secretaria.nome}</h2></div>
      <div className="flex justify-between items-center bg-[#1f2937] p-8 rounded-[48px] border border-white/5 shadow-2xl">
         <div className="flex items-center gap-4"><FolderKanban className="text-indigo-500"/><p className="text-[11px] font-black text-slate-300 uppercase tracking-widest italic">Quadro Operacional</p></div>
         <button onClick={() => setIsAdding(true)} className="px-12 py-6 bg-indigo-600 text-white rounded-[32px] font-black uppercase italic shadow-2xl flex items-center gap-4 hover:bg-indigo-500 transition-all border border-white/10"><Plus size={24}/> Nova Pauta</button>
      </div>
      <div className="flex gap-8 overflow-x-auto pb-10 custom-scrollbar min-h-[600px]">
        {columns.map(col => (
          <div key={col} className="min-w-[320px] w-[320px] flex flex-col gap-6">
            <h5 className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic px-4">{col} ({cards.filter((c:any) => c.status === col).length})</h5>
            <div className="flex-1 space-y-4">
              {cards.filter((c:any) => c.status === col).map((card:any) => (
                <div key={card.id} className="bg-[#1f2937] border border-white/5 p-8 rounded-[40px] shadow-xl hover:border-indigo-500/30 transition-all">
                  <h6 className="text-[13px] font-black text-white italic mb-4 leading-snug">{card.titulo}</h6>
                  <div className="flex items-center gap-2 mb-6"><div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[8px] font-black text-white">{card.dono.charAt(0)}</div><span className="text-[9px] font-black text-slate-500 uppercase italic">{card.dono}</span></div>
                  <select value={card.status} onChange={(e) => onUpdateCards(cards.map((c:any) => c.id === card.id ? { ...c, status: e.target.value as KanbanStatus, updatedAt: new Date().toISOString() } : c))} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[9px] font-black text-slate-400 uppercase italic outline-none focus:border-indigo-500">
                    {columns.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {isAdding && (
        <div className="fixed inset-0 z-[8000] flex items-center justify-center p-6 backdrop-blur-md bg-black/80">
           <div className="bg-[#1f2937] border border-white/10 w-full max-w-xl rounded-[64px] p-12 shadow-3xl">
              <h4 className="text-3xl font-black text-white italic uppercase mb-10 text-center tracking-tighter">Lançar Pauta</h4>
              <div className="space-y-6">
                <input value={newCard.titulo} onChange={e=>setNewCard({...newCard, titulo: e.target.value})} placeholder="Título da Pauta..." className="w-full bg-black/30 border border-white/10 rounded-3xl px-8 py-5 text-white font-bold italic outline-none focus:border-indigo-500 shadow-inner" />
                <div className="flex gap-6"><button onClick={()=>setIsAdding(false)} className="flex-1 py-6 bg-white/5 rounded-[32px] font-black uppercase text-slate-500 italic">Cancelar</button><button onClick={handleAddCard} className="flex-[2] py-6 bg-indigo-600 text-white rounded-[32px] font-black uppercase italic shadow-2xl">Confirmar</button></div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

// --- MÓDULO: PROJETOS (ATUALIZADO PARA PROJETOS REAIS) ---
const GestaoProjetos = ({ projetos, onUpdateProjetos, secretarias }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newProject, setNewProject] = useState<any>({
    nome: '', responsavel: '', eixo: secretarias[0].nome, status: 'Execução',
    recursoPrevisto: '', fim: new Date().toISOString().split('T')[0],
    prioridade: 'Média', subItens: []
  });

  const handleAddProject = () => {
    if (!newProject.nome.trim()) {
      alert("Defina o nome do projeto estratégico.");
      return;
    }
    const projectData = { 
      ...newProject, 
      id: editingId || `P-${Date.now()}`, 
      progresso: newProject.progresso || 0,
      updatedAt: new Date().toISOString(),
      arquivado: false
    };
    if (editingId) onUpdateProjetos(projetos.map((p: any) => p.id === editingId ? projectData : p));
    else onUpdateProjetos([projectData, ...projetos]);
    setIsAdding(false); 
    setEditingId(null);
    setNewProject({
      nome: '', responsavel: '', eixo: secretarias[0].nome, status: 'Execução',
      recursoPrevisto: '', fim: new Date().toISOString().split('T')[0],
      prioridade: 'Média', subItens: []
    });
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-48">
      <EducationalBanner title="Projetos Estratégicos" description="Gestão oficial do Plano de Governo. Registre obras, programas e intervenções estruturantes." icon={Layers} color="indigo" />
      <div className="flex justify-end">
        <button onClick={() => { setEditingId(null); setIsAdding(true); }} className="px-12 py-8 bg-indigo-600 text-white rounded-[40px] font-black uppercase text-[12px] shadow-3xl hover:bg-indigo-500 shrink-0 flex items-center gap-4 border border-white/10 active:scale-95 transition-all">
          <Plus size={24}/> Registrar Novo Projeto Real
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projetos.length === 0 ? (
          <div className="col-span-full py-40 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[64px] bg-white/2 opacity-40">
            <Layers size={64} className="text-slate-600 mb-6"/>
            <p className="text-xl font-black uppercase italic text-slate-600 tracking-widest">Nenhum projeto estratégico cadastrado</p>
            <p className="text-[10px] font-bold text-slate-700 uppercase mt-4 italic">Clique no botão acima para iniciar a entrada de dados reais</p>
          </div>
        ) : projetos.filter((p:any) => !p.arquivado).map((p: any) => (
          <div key={p.id} className="bg-[#1f2937] border border-white/5 p-10 rounded-[56px] shadow-3xl hover:border-indigo-500/30 transition-all flex flex-col justify-between h-[520px]">
            <div>
              <div className="flex justify-between items-start mb-6">
                <button onClick={() => { setNewProject(p); setEditingId(p.id); setIsAdding(true); }} className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-indigo-600 transition-all"><Pencil size={14}/></button>
                <StatusBadge status={p.status} />
              </div>
              <p className="text-[9px] font-black text-indigo-500 uppercase mb-2 italic tracking-widest">{p.eixo}</p>
              <h4 className="text-xl font-black text-white italic mb-4 leading-tight">{p.nome}</h4>
              <div className="bg-black/20 p-4 rounded-2xl mb-6 border border-white/5">
                <p className="text-[7px] font-black text-slate-600 uppercase mb-1 italic">Responsável Técnico</p>
                <p className="text-[10px] font-black text-slate-300 italic">{p.responsavel || "Não definido"}</p>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase italic">
                  <span>Progresso Realizado</span>
                  <span>{p.progresso}%</span>
                </div>
                <div className="w-full bg-black/40 h-3 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${p.progresso}%` }}></div>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center pt-6 border-t border-white/5">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-600"/>
                <span className="text-[9px] font-black text-slate-500 uppercase italic">Entrega: {new Date(p.fim).toLocaleDateString()}</span>
              </div>
              <button onClick={() => onUpdateProjetos(projetos.filter((pj:any)=>pj.id !== p.id))} className="p-3 text-rose-500/30 hover:text-rose-500 transition-all"><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
      </div>
      {isAdding && (
        <div className="fixed inset-0 z-[8000] flex items-center justify-center p-6 backdrop-blur-md bg-black/80 animate-in zoom-in-95 duration-300">
           <div className="bg-[#1f2937] border border-white/10 w-full max-w-2xl rounded-[64px] p-12 shadow-3xl max-h-[90vh] overflow-y-auto custom-scrollbar">
              <h4 className="text-3xl font-black text-white italic uppercase mb-10 text-center tracking-tighter">Entrada de Projeto Real</h4>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase italic px-4">Nome do Projeto Estratégico</label>
                  <input value={newProject.nome} onChange={e=>setNewProject({...newProject, nome: e.target.value})} placeholder="Ex: Pavimentação da Av. Olavo Moraes..." className="w-full bg-black/30 border border-white/10 rounded-3xl px-8 py-5 text-white font-bold italic outline-none focus:border-indigo-500 shadow-inner" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase italic px-4">Responsável</label>
                      <input value={newProject.responsavel} onChange={e=>setNewProject({...newProject, responsavel: e.target.value})} placeholder="Nome do Secretário ou Diretor..." className="w-full bg-black/30 border border-white/10 rounded-3xl px-8 py-5 text-white font-bold italic outline-none focus:border-indigo-500 shadow-inner" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase italic px-4">Secretaria / Eixo</label>
                      <select value={newProject.eixo} onChange={e=>setNewProject({...newProject, eixo: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-3xl px-8 py-5 text-white font-bold italic outline-none focus:border-indigo-500 shadow-inner appearance-none">
                         {secretarias.map((s:any) => <option key={s.id} value={s.nome}>{s.nome}</option>)}
                      </select>
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase italic px-4">Status Inicial</label>
                      <select value={newProject.status} onChange={e=>setNewProject({...newProject, status: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-3xl px-8 py-5 text-white font-bold italic outline-none focus:border-indigo-500 shadow-inner appearance-none">
                         {['Backlog', 'Planejado', 'Execução', 'Tramitação', 'Risco', 'Concluído'].map(st => <option key={st} value={st}>{st}</option>)}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase italic px-4">Data Estimada de Entrega</label>
                      <input type="date" value={newProject.fim} onChange={e=>setNewProject({...newProject, fim: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-3xl px-8 py-5 text-white font-bold italic outline-none focus:border-indigo-500 shadow-inner" />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase italic px-4">Progresso Atual (%)</label>
                   <input type="number" min="0" max="100" value={newProject.progresso || 0} onChange={e=>setNewProject({...newProject, progresso: parseInt(e.target.value)})} className="w-full bg-black/30 border border-white/10 rounded-3xl px-8 py-5 text-white font-bold italic outline-none focus:border-indigo-500 shadow-inner" />
                </div>
                <div className="flex gap-6 pt-10">
                   <button onClick={()=>setIsAdding(false)} className="flex-1 py-7 bg-white/5 rounded-[40px] font-black uppercase text-slate-500 italic tracking-widest hover:bg-rose-500/10 hover:text-rose-500 transition-all">Descartar</button>
                   <button onClick={handleAddProject} className="flex-[2] py-7 bg-indigo-600 text-white rounded-[40px] font-black uppercase italic shadow-2xl tracking-widest border border-white/10 hover:bg-indigo-500 transition-all">Salvar Projeto Estratégico</button>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

// --- APP ROOT ---
const App = () => {
  const [activeTab, setActiveTab] = useState('prefeito');
  const [insights, setInsights] = useState<string>('Analista IA processando métricas transversais...');
  const [selectedSecretaria, setSelectedSecretaria] = useState<Secretaria | null>(null);

  const [kanbanRegistry, setKanbanRegistry] = useState(() => loadState('KANBAN', MOCK_DATA.secretarias.reduce((acc, s) => ({ ...acc, [s.id]: [] }), {})));
  const [okrs, setOkrs] = useState<OKR[]>(() => loadState('OKR', []));
  const [swotMatrices, setSwotMatrices] = useState(() => loadState('SWOT_REGISTRY', [{ id: 'SWOT-001', titulo: 'Diagnóstico Geral', arquivada: false, data: MOCK_DATA.swot, criadaEm: new Date().toISOString() }]));
  const [projetos, setProjetos] = useState(() => loadState('PROJETOS', MOCK_DATA.projetosEstrategicos));
  const [escuta, setEscuta] = useState(() => loadState('ESCUTA', MOCK_DATA.escuta));

  const metrics = useMemo(() => {
    const totalDemands = escuta.length;
    const deliveries = escuta.filter((e:any) => e.status === 'Concluída').length + projetos.filter((p:any)=>p.status === 'Concluído').length;
    const bottlenecks = escuta.filter((e:any) => ['Depende de', 'Parado'].includes(e.status)).length + projetos.filter((p:any)=>['Risco', 'Parado'].includes(p.status)).length;
    return { demands: totalDemands, deliveries, bottlenecks };
  }, [escuta, projetos]);

  useEffect(() => {
    saveState('KANBAN', kanbanRegistry);
    saveState('OKR', okrs);
    saveState('SWOT_REGISTRY', swotMatrices);
    saveState('PROJETOS', projetos);
    saveState('ESCUTA', escuta);
  }, [kanbanRegistry, okrs, swotMatrices, projetos, escuta]);

  useEffect(() => {
    const loadInsights = async () => {
      const text = await getGovernmentInsights({ ...MOCK_DATA, escuta, okrs, projetosEstrategicos: projetos });
      setInsights(text || "Gabinete 360 Camaquã pronto para o despacho.");
    };
    loadInsights();
  }, [kanbanRegistry, okrs, projetos, escuta]);

  const renderModule = () => {
    switch(activeTab) {
      case 'prefeito': return <MacroDashboard data={MOCK_DATA} selectedSecretaria={selectedSecretaria} setSelectedSecretaria={setSelectedSecretaria} kanbanRegistry={kanbanRegistry} onUpdateKanban={(id:any,nc:any)=>setKanbanRegistry({...kanbanRegistry,[id]:nc})} insights={insights} {...metrics} />;
      case 'projetos': return <GestaoProjetos projetos={projetos} onUpdateProjetos={setProjetos} secretarias={MOCK_DATA.secretarias} />;
      case 'okr': return <OKRModule okrs={okrs} setOkrs={setOkrs} />;
      case 'swot': return <SWOTModule swotMatrices={swotMatrices} setSwotMatrices={setSwotMatrices} />;
      case 'escuta': return <CitizenListening escuta={escuta} onUpdateEscuta={setEscuta} onAddEscuta={(d:any)=>setEscuta([d,...escuta])} />;
      default: return <div className="p-40 text-center italic text-slate-600 font-black uppercase tracking-[1em] opacity-30">Camaquã 360 v3.0.5</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans flex flex-col relative custom-scrollbar overflow-x-hidden">
      <div className="w-full bg-[#1e293b]/95 border-b border-white/5 py-6 px-12 backdrop-blur-md z-[2000] sticky top-0 flex items-center justify-between shadow-2xl">
           <div className="flex items-center gap-6 flex-1 overflow-hidden"><div className="p-4 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/30 group"><Lightbulb size={20} className="text-white group-hover:rotate-12 transition-transform"/></div><p className="text-[12px] font-black text-slate-300 italic truncate tracking-widest uppercase flex items-center gap-3"><span className="text-indigo-400">BI 360°</span> <span className="w-1 h-1 rounded-full bg-slate-700"></span> Gabinete Municipal</p></div>
           <div className="flex items-center gap-10 shrink-0 ml-8"><div className="flex items-center gap-4 px-6 py-2.5 bg-black/40 rounded-full border border-white/10 shadow-inner"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div><span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">CAMAQUÃ ONLINE</span></div><span className="text-[12px] font-black text-indigo-400 uppercase italic pl-10 border-l border-white/10 tracking-widest">{VERSION}</span></div>
      </div>
      <main className="flex-1 w-full max-w-[1750px] mx-auto p-10 lg:p-20">
        <header className="mb-24 animate-in slide-in-from-top duration-1000">
          <h1 className="text-3xl lg:text-[6rem] font-black text-white tracking-tighter uppercase italic leading-none opacity-95">CAMAQUÃ 360°</h1>
          <div className="flex flex-col md:flex-row gap-12 mt-8 ml-4 opacity-75"><div className="flex flex-col"><span className="text-slate-600 text-[9px] font-black uppercase italic tracking-widest mb-1">Prefeito Municipal</span><p className="text-slate-200 text-sm font-black uppercase tracking-widest italic">{EXECUTIVO.prefeito}</p></div><div className="flex flex-col border-l border-white/10 pl-12"><span className="text-slate-600 text-[9px] font-black uppercase italic tracking-widest mb-1">Vice-Prefeito</span><p className="text-slate-200 text-sm font-black uppercase tracking-widest italic">{EXECUTIVO.vice}</p></div></div>
        </header>
        {renderModule()}
      </main>
      <div className="fixed bottom-14 left-1/2 -translate-x-1/2 z-[3000] w-full max-w-6xl px-12">
        <nav className="bg-[#1e293b]/95 backdrop-blur-3xl border border-white/10 p-4 rounded-[56px] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] flex items-center justify-around border-t border-white/5">
          {NAVIGATION.map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setSelectedSecretaria(null); }} className={`flex flex-col items-center justify-center w-32 h-18 rounded-[36px] transition-all duration-300 hover:bg-white/5 group ${activeTab === item.id ? 'bg-indigo-600/10 border border-indigo-500/20 shadow-inner' : ''}`}>
              <item.icon size={22} className={activeTab === item.id ? 'text-indigo-400 scale-110' : 'text-slate-500 group-hover:text-slate-300 transition-all'} /><span className={`text-[9px] font-black uppercase tracking-widest mt-2 transition-all ${activeTab === item.id ? 'text-indigo-400 opacity-100' : 'text-slate-500 opacity-50'}`}>{item.name}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default App;