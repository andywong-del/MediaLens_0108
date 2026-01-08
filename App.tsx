
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { 
  Layout, Box, Layers, ArrowRight, Globe, 
  Bell, Grid, HeartPulse, Target, 
  TrendingUp, Trophy, Megaphone, Send, ChevronDown, 
  ChevronLeft, ChevronRight, Zap as BoltIcon, Sparkles, Zap, Search,
  HelpCircle, Clock, Flame, Crown, Activity
} from 'lucide-react';
import { Button } from './components/Button';
import { generateMockup } from './services/geminiService';
import { Asset, GeneratedMockup, AppView, LoadingState, PlacedLayer } from './types';
import { useApiKey } from './hooks/useApiKey';
import ApiKeyDialog from './components/ApiKeyDialog';

// --- Sidebar Item Component (Matching Image) ---
const SidebarItem = ({ icon, label, active, onClick, collapsed, isPremium }: { 
  icon: React.ReactNode, 
  label: string, 
  active: boolean, 
  onClick: () => void,
  collapsed: boolean,
  isPremium?: boolean
}) => (
  <button
    onClick={onClick}
    title={collapsed ? label : ""}
    className={`w-full flex items-center transition-all duration-300 group relative
      ${collapsed ? 'justify-center px-0 py-3' : 'px-4 py-3.5 space-x-4 rounded-[18px]'}
      ${active ? 'text-white bg-[#2d62ed] shadow-xl shadow-blue-200/40' : 'text-[#64748b] hover:text-zinc-900 hover:bg-zinc-50'}`}
  >
    <div className={`${active ? 'text-white' : 'text-[#94a3b8] group-hover:text-zinc-600'}`}>
      {React.cloneElement(icon as React.ReactElement<any>, { size: 22, strokeWidth: active ? 2.5 : 2 })}
    </div>
    {!collapsed && (
      <div className="flex-1 flex items-center justify-between overflow-hidden">
        <span className={`text-[15px] font-bold text-left whitespace-nowrap transition-colors ${active ? 'text-white' : 'text-[#64748b]'}`}>{label}</span>
        {isPremium && (
          <Crown size={14} className={`ml-2 shrink-0 ${active ? 'text-white fill-white/20' : 'text-[#3b82f6] fill-[#3b82f6]/10'}`} />
        )}
      </div>
    )}
  </button>
);

// --- New Feature Card Component (Matching Image) ---
const FeatureCard = ({ icon, title, desc, onClick, bgColor }: { 
  icon: React.ReactNode, 
  title: string, 
  desc: string, 
  onClick: () => void,
  bgColor: string 
}) => (
  <div 
    className="bg-white rounded-[40px] border border-zinc-100 shadow-sm hover:shadow-md transition-all duration-300 p-4 flex flex-col group cursor-pointer"
    onClick={onClick}
  >
    <div className={`${bgColor} rounded-[32px] h-48 flex items-center justify-center relative overflow-hidden mb-6`}>
      <div className="bg-white w-[85%] h-[75%] rounded-2xl shadow-lg relative p-4 flex items-center justify-center">
        <div className="absolute top-3 left-3 flex gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400 opacity-60"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 opacity-60"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 opacity-60"></div>
        </div>
        <div className="text-zinc-200">
          {React.cloneElement(icon as React.ReactElement<any>, { size: 48, strokeWidth: 1.5 })}
        </div>
      </div>
    </div>
    <div className="px-4 pb-4 flex-1 flex flex-col">
      <h3 className="font-black text-zinc-900 mb-2 text-xl tracking-tight">{title}</h3>
      <p className="text-[14px] text-zinc-500 leading-relaxed mb-8 font-medium line-clamp-2">
        {desc}
      </p>
      <button className="mt-auto w-full bg-zinc-950 text-white rounded-full py-4 font-bold text-sm flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all active:scale-[0.98]">
        Start Now <ArrowRight size={16} />
      </button>
    </div>
  </div>
);

export default function App() {
  const [view, setView] = useState<AppView>('dashboard');
  const [assets] = useState<Asset[]>([]);
  const [generatedMockups] = useState<GeneratedMockup[]>([]);
  const [selectedProductId] = useState<string | null>(null);
  const [placedLogos] = useState<PlacedLayer[]>([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState<LoadingState>({ isGenerating: false, message: '' });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { showApiKeyDialog, setShowApiKeyDialog, validateApiKey, handleApiKeyDialogContinue } = useApiKey();

  const handleApiError = (error: any) => {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('Requested entity was not found') || msg.includes('403') || msg.includes('key')) {
      setShowApiKeyDialog(true);
    } else {
      alert(`Error: ${msg}`);
    }
  };

  const handleGenerate = async () => {
    const product = assets.find(a => a.id === selectedProductId);
    const layers = placedLogos.map(l => ({ asset: assets.find(a => a.id === l.assetId)!, placement: l })).filter(x => x.asset);
    if (!product || layers.length === 0) return;
    if (!(await validateApiKey())) return;

    setLoading({ isGenerating: true, message: 'Processing with AI...' });
    try {
      await generateMockup(product, layers, prompt);
      setView('gallery');
    } catch (e: any) {
      handleApiError(e);
    } finally {
      setLoading({ isGenerating: false, message: '' });
    }
  };

  return (
    <div className="h-screen w-screen bg-[#FDFDFD] text-zinc-900 font-sans flex flex-col overflow-hidden">
      {showApiKeyDialog && <ApiKeyDialog onContinue={handleApiKeyDialogContinue} />}

      <header className="h-16 bg-white border-b border-zinc-100 flex items-center justify-between px-6 shrink-0 z-50 fixed top-0 left-0 right-0">
         <div className="flex items-center gap-2">
            <span className="font-black text-[18px] tracking-tight text-blue-600">MEDIA</span>
            <div className="w-6 h-6 rounded-full border-[3px] border-blue-600 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
            </div>
            <span className="font-black text-[18px] tracking-tight text-blue-600">LENS</span>
         </div>

         <div className="flex-1 flex justify-center px-10">
            <div className="bg-blue-600 text-white rounded-full h-11 px-6 flex items-center gap-4 shadow-lg shadow-blue-200">
               <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider">
                  <Clock size={14} className="text-amber-400" />
                  7 DAYS LEFT IN TRIAL
               </div>
               <div className="bg-blue-700/50 px-2.5 py-1 rounded text-[11px] font-bold font-mono border border-white/10">
                  22:49:17
               </div>
               <div className="h-4 w-px bg-white/30" />
               <div className="text-[11px] font-bold uppercase tracking-wider opacity-90">
                  UNLOCK ALL THE PREMIUM FEATURES?
               </div>
               <button className="bg-white text-blue-600 px-5 py-1.5 rounded-full text-[11px] font-black flex items-center gap-2 hover:bg-zinc-100 transition-all uppercase tracking-wider ml-2">
                  <Zap size={12} fill="currentColor" /> UPGRADE NOW
               </button>
            </div>
         </div>

         <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
               <div className="w-9 h-9 bg-black rounded-full shadow-md" />
               <div className="flex items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity">
                  <span className="text-[13px] font-bold text-zinc-700">Wong Andy</span>
                  <ChevronDown size={14} className="text-blue-600" />
               </div>
            </div>
            <div className="h-6 w-px bg-zinc-100" />
            <div className="text-blue-600 cursor-pointer hover:scale-110 transition-transform">
               <HelpCircle size={22} />
            </div>
         </div>
      </header>

      <div className="flex flex-1 pt-16 overflow-hidden">
        {/* SIDEBAR - Collapsible & Updated to match latest image */}
        <aside 
          className={`border-r border-zinc-100 bg-white flex flex-col shrink-0 transition-all duration-300 ease-in-out relative
            ${isSidebarCollapsed ? 'w-[80px]' : 'w-[280px]'}`}
        >
          {/* Workspace Tile Section */}
          <div className="p-4 pt-6">
            <div className={`flex items-center bg-[#f8fafc]/80 border border-[#f1f5f9] rounded-[24px] transition-all duration-300 p-2.5 ${isSidebarCollapsed ? 'justify-center' : 'gap-4 pr-4'}`}>
              <div className="w-12 h-12 rounded-[18px] bg-[#2d62ed] flex items-center justify-center font-bold text-white text-xl shrink-0 shadow-lg shadow-blue-100">P</div>
              {!isSidebarCollapsed && (
                <div className="flex-1 overflow-hidden flex items-center justify-between">
                  <div className="animate-fade-in">
                    <p className="text-[15px] font-black text-[#1e293b] truncate">PL - HK</p>
                    <p className="text-[11px] text-[#94a3b8] font-bold tracking-wider uppercase truncate">ANDY WONG</p>
                  </div>
                  <ChevronDown size={14} className="text-[#cbd5e1] ml-2" />
                </div>
              )}
            </div>
          </div>

          {/* Floating Collapse Button */}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`absolute -right-4 top-10 w-8 h-8 bg-white border border-[#f1f5f9] rounded-full flex items-center justify-center text-[#94a3b8] hover:text-blue-600 shadow-md z-10 transition-transform active:scale-95`}
          >
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Navigation Items */}
          <div className="px-6 space-y-1 mt-4 flex-1">
             <SidebarItem collapsed={isSidebarCollapsed} icon={<Layout />} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
             <SidebarItem collapsed={isSidebarCollapsed} icon={<HeartPulse />} label="Audit My Page" active={view === 'assets'} onClick={() => setView('assets')} />
             <SidebarItem collapsed={isSidebarCollapsed} icon={<Target />} label="Competitor Spy" active={view === 'studio'} onClick={() => setView('studio')} />
             <SidebarItem collapsed={isSidebarCollapsed} icon={<Flame />} label="Viral Content Search" active={false} onClick={() => {}} />
             <SidebarItem collapsed={isSidebarCollapsed} icon={<Trophy />} label="Influencer Rankings" isPremium active={false} onClick={() => {}} />
             <SidebarItem collapsed={isSidebarCollapsed} icon={<Search />} label="Keyword Monitor" isPremium active={false} onClick={() => {}} />
             <SidebarItem collapsed={isSidebarCollapsed} icon={<Megaphone />} label="Ad Strategy Library" isPremium active={false} onClick={() => {}} />
             <SidebarItem collapsed={isSidebarCollapsed} icon={<Activity />} label="Social Pulse" isPremium active={false} onClick={() => {}} />
          </div>

          {/* Footer Logo/Bottom part */}
          <div className="p-6 border-t border-zinc-50 flex justify-center">
             {isSidebarCollapsed ? (
                <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400"><Layout size={18} /></div>
             ) : (
                <div className="flex items-center gap-2 opacity-30 grayscale pointer-events-none">
                  <span className="font-black text-[12px] tracking-tight text-zinc-900">MEDIA LENS</span>
                </div>
             )}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto bg-white p-10 lg:p-14">
          <div className="max-w-6xl mx-auto space-y-14">
            {view === 'dashboard' && (
              <div className="animate-fade-in space-y-12">
                <div className="flex flex-col gap-10">
                  <h1 className="text-[34px] font-black text-[#0f172a] tracking-tight flex items-center gap-3">
                    <span className="text-2xl">👋</span> Hi! What are you looking for?
                  </h1>
                  <div className="relative group max-w-5xl">
                    <div className="bg-white border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] p-2 flex items-center gap-4 transition-all focus-within:shadow-[0_12px_40px_rgb(0,0,0,0.08)]">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 ml-2">
                        <BoltIcon size={20} className="fill-blue-600" />
                      </div>
                      <input 
                        type="text" 
                        placeholder="Ask AI Agent for Trend or Insights"
                        className="flex-1 bg-transparent border-none outline-none text-zinc-400 text-[17px] font-medium placeholder:text-zinc-300"
                      />
                      <button className="bg-[#2d5cf7] text-white px-8 py-4 rounded-[18px] font-black text-xs flex items-center gap-3 tracking-widest hover:bg-blue-700 transition-all uppercase shadow-lg shadow-blue-200 active:scale-95">
                        AI AGENT <Send size={14} className="rotate-[-30deg]" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-black text-[#94a3b8] tracking-[0.2em] uppercase">
                    <Sparkles size={14} className="text-blue-500" />
                    No idea? you may start with...
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <FeatureCard 
                    icon={<HeartPulse />}
                    title="Audit My Page"
                    desc="Real-time brand sentiment monitoring and ROI mapping across all social channels."
                    bgColor="bg-orange-50"
                    onClick={() => setView('assets')}
                  />
                  <FeatureCard 
                    icon={<Target />}
                    title="Competitor Spy"
                    desc="Deep dive into rival campaign performance and visual asset positioning strategy."
                    bgColor="bg-sky-50"
                    onClick={() => setView('studio')}
                  />
                  <FeatureCard 
                    icon={<Flame />}
                    title="Viral Content Search"
                    desc="Identify high-growth trends and emerging creative formats before they peak globally."
                    bgColor="bg-emerald-50"
                    onClick={() => {}}
                  />
                </div>
              </div>
            )}

            {(view === 'assets' || view === 'studio' || view === 'gallery') && (
              <div className="animate-fade-in space-y-8">
                 <div className="flex items-center gap-6">
                    <button onClick={() => setView('dashboard')} className="p-3 bg-white border border-zinc-100 rounded-xl text-zinc-400 hover:text-blue-600 transition-all shadow-sm">
                      <ChevronLeft size={24} />
                    </button>
                    <h2 className="text-4xl font-black text-zinc-900 capitalize tracking-tight">{view.replace('-', ' ')}</h2>
                 </div>
                 {view === 'assets' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="bg-white p-10 rounded-[40px] border border-zinc-100 shadow-sm">
                        <h3 className="font-black text-lg mb-8 flex items-center gap-3"><Box size={24} className="text-blue-600" /> Inventory</h3>
                        <div className="h-64 border-2 border-dashed border-zinc-100 rounded-[32px] flex items-center justify-center text-zinc-300 text-sm font-medium">
                          No active assets tracked
                        </div>
                      </div>
                      <div className="bg-white p-10 rounded-[40px] border border-zinc-100 shadow-sm">
                        <h3 className="font-black text-lg mb-8 flex items-center gap-3"><Layers size={24} className="text-blue-600" /> Elements</h3>
                        <div className="h-64 border-2 border-dashed border-zinc-100 rounded-[32px] flex items-center justify-center text-zinc-300 text-sm font-medium">
                          Branding library empty
                        </div>
                      </div>
                    </div>
                 )}
                 {view === 'studio' && (
                    <div className="bg-white p-4 rounded-[40px] border border-zinc-100 shadow-2xl overflow-hidden h-[700px] flex">
                       <div className="w-96 border-r border-zinc-50 p-8 flex flex-col gap-8">
                          <h4 className="text-[12px] font-black text-zinc-400 uppercase tracking-widest">Model Settings</h4>
                          <textarea 
                            value={prompt} 
                            onChange={e => setPrompt(e.target.value)}
                            placeholder="Describe how to blend the branding elements..."
                            className="w-full bg-zinc-50 rounded-[24px] p-6 text-sm h-48 outline-none border border-transparent focus:border-blue-100 transition-all font-medium resize-none shadow-inner"
                          />
                          <Button className="w-full py-6 rounded-2xl shadow-xl shadow-blue-100" size="lg" onClick={handleGenerate} isLoading={loading.isGenerating} icon={<Zap size={20}/>}>
                            GENERATE ANALYSIS
                          </Button>
                       </div>
                       <div className="flex-1 bg-zinc-50 flex items-center justify-center relative rounded-r-[36px]">
                          <div className="text-center space-y-6">
                            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                               <Target size={48} className="text-zinc-200" />
                            </div>
                            <p className="text-zinc-400 font-bold text-sm tracking-wide">STAGE ASSETS FOR AI VISUALIZATION</p>
                          </div>
                       </div>
                    </div>
                 )}
                 {view === 'gallery' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                       {generatedMockups.map(m => (
                         <div key={m.id} className="bg-white rounded-[40px] border border-zinc-100 shadow-xl overflow-hidden group">
                           <div className="aspect-square relative overflow-hidden bg-zinc-50">
                             <img src={m.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                           </div>
                           <div className="p-8">
                              <p className="text-[11px] font-black text-blue-600 mb-2 uppercase tracking-widest">INTELLIGENCE OUTPUT</p>
                              <p className="text-sm text-zinc-500 font-bold line-clamp-1">{m.prompt}</p>
                           </div>
                         </div>
                       ))}
                       {generatedMockups.length === 0 && (
                          <div className="col-span-full py-32 text-center text-zinc-300 font-bold text-xl">
                             No reports generated yet.
                          </div>
                       )}
                    </div>
                 )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
