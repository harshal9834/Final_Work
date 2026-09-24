import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  Cpu, 
  BrainCircuit, 
  GitCompare, 
  Radio, 
  History, 
  ZapOff, 
  Wrench, 
  Radar, 
  AlertTriangle, 
  Network, 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  Search,
  ExternalLink,
  Layers,
  Terminal
} from 'lucide-react';
import { useGcs } from '../../contexts/GcsContext';
import { NAV_ITEMS } from '../../constants';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const { activeTab, setActiveTab, selectedUav, nightVisionMode, alerts } = useGcs();
  const [searchQuery, setSearchQuery] = useState('');

  const moreModuleIds = [
    'maintenance',
    'fleet',
    'alerts',
    'multi-agent',
    'continuous-learning',
    'reports',
    'system-health'
  ];

  const [isMoreExpanded, setIsMoreExpanded] = useState<boolean>(() => 
    moreModuleIds.includes(activeTab)
  );

  const iconMap: Record<string, React.ReactNode> = {
    LayoutDashboard: <LayoutDashboard className="w-4 h-4" />,
    Activity: <Activity className="w-4 h-4" />,
    Cpu: <Cpu className="w-4 h-4" />,
    BrainCircuit: <BrainCircuit className="w-4 h-4" />,
    GitCompare: <GitCompare className="w-4 h-4" />,
    Radio: <Radio className="w-4 h-4" />,
    History: <History className="w-4 h-4" />,
    ZapOff: <ZapOff className="w-4 h-4" />,
    Wrench: <Wrench className="w-4 h-4" />,
    Radar: <Radar className="w-4 h-4" />,
    AlertTriangle: <AlertTriangle className="w-4 h-4" />,
    Network: <Network className="w-4 h-4" />,
    Sparkles: <Sparkles className="w-4 h-4" />,
    FileText: <FileText className="w-4 h-4" />,
    ShieldCheck: <ShieldCheck className="w-4 h-4" />,
    Terminal: <Terminal className="w-4 h-4" />,
  };

  const topItems = NAV_ITEMS.filter(item => !moreModuleIds.includes(item.id));
  const moreItems = NAV_ITEMS.filter(item => moreModuleIds.includes(item.id));

  const filterItem = (item: typeof NAV_ITEMS[0]) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.id.toLowerCase().includes(searchQuery.toLowerCase());

  const filteredTopItems = topItems.filter(filterItem);
  const filteredMoreItems = moreItems.filter(filterItem);
  const isSearching = searchQuery.trim().length > 0;

  const renderNavItem = (item: typeof NAV_ITEMS[0], isChild = false) => {
    const isActive = activeTab === item.id;
    const isAlert = item.id === 'alerts' && alerts.some(a => !a.acknowledged);

    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 group relative ${
          isChild ? 'pl-4' : ''
        } ${
          isActive
            ? 'bg-[#EFF6FF] text-[#1E40AF] border border-blue-300 shadow-sm shadow-blue-100'
            : 'text-[#475569] hover:text-blue-700 hover:bg-[#EFF6FF] border border-transparent'
        }`}
        title={isCollapsed ? item.label : undefined}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-blue-500 rounded-r shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
        )}

        <div className={`transition-transform duration-200 ${isActive ? 'text-blue-500' : 'group-hover:text-blue-500'}`}>
          {iconMap[item.icon] || <Activity className="w-4 h-4" />}
        </div>

        {!isCollapsed && (
          <div className="flex-1 text-left flex items-center justify-between overflow-hidden">
            <span className={`truncate ${isActive ? 'font-bold text-[#1E40AF]' : ''}`}>
              {item.label}
            </span>
            {item.badge && (
              <span className={`text-[9px] font-mono-code px-1.5 py-0.2 rounded font-bold uppercase tracking-wider shrink-0 ${
                item.badge === 'USP' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                item.badge === 'LIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                isAlert ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' :
                'bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]'
              }`}>
                {item.badge}
              </span>
            )}
          </div>
        )}
      </button>
    );
  };

  const hasActiveMoreChild = moreModuleIds.includes(activeTab);

  return (
    <aside
      className={`border-r transition-all duration-300 flex flex-col z-30 shrink-0 select-none ${
        nightVisionMode 
          ? 'bg-emerald-950/80 border-emerald-900 text-emerald-200' 
          : 'bg-[#F1F5F9] border-[#E2E8F0] text-[#0F172A]'
      } ${isCollapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Sidebar Top Search / Toggle */}
      <div className="p-3 border-b border-[#E2E8F0] flex items-center justify-between gap-2">
        {!isCollapsed ? (
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] rounded pl-8 pr-2 py-1 text-xs text-[#0F172A] placeholder:text-[#94A3B8] font-mono-code focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
            />
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1 text-[#64748B] hover:text-blue-600 hover:bg-[#EFF6FF] rounded transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Module Navigation List */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
      <div className="px-2 py-1 text-[10px] font-mono-code font-bold text-[#1E293B] uppercase tracking-widest">
          {!isCollapsed && 'OPERATIONAL MODULES'}
        </div>

        {/* Top 8 Menu Items up to Fault Simulator */}
        {filteredTopItems.map(item => renderNavItem(item, false))}

        {/* Expandable "More Modules" Dropdown immediately below Fault Simulator */}
        {(!isSearching && filteredMoreItems.length > 0) && (
          <div className="space-y-1 pt-1 border-t border-[#E2E8F0]">
            <button
              onClick={() => setIsMoreExpanded(prev => !prev)}
              className={`w-full flex items-center gap-3 px-2.5 py-2 rounded text-xs font-medium transition-all group border ${
                hasActiveMoreChild
                  ? 'bg-[#EFF6FF] text-blue-700 border-blue-200 font-bold'
                  : 'text-[#475569] hover:text-blue-600 hover:bg-[#EFF6FF] border-transparent'
              }`}
              title={isCollapsed ? 'More Modules' : undefined}
            >
              <div className="text-[#94A3B8] group-hover:text-blue-500 transition-colors">
                <Layers className="w-4 h-4" />
              </div>

              {!isCollapsed && (
                <div className="flex-1 text-left flex items-center justify-between">
                  <span className="truncate font-semibold">More Modules</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono-code px-1.5 py-0.2 rounded font-bold bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
                      7
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-[#94A3B8] transition-transform duration-250 ${isMoreExpanded ? 'rotate-180 text-blue-500' : ''}`} />
                  </div>
                </div>
              )}
            </button>

            {/* Collapsible Submenu */}
            {(isMoreExpanded || isCollapsed) && (
              <div className={`space-y-1 transition-all duration-250 ease-in-out ${isCollapsed ? '' : 'pl-2 border-l border-[#E2E8F0] ml-2'}`}>
                {filteredMoreItems.map(item => renderNavItem(item, !isCollapsed))}
              </div>
            )}
          </div>
        )}

        {/* When searching, show matching items directly */}
        {isSearching && filteredMoreItems.map(item => renderNavItem(item, false))}
      </div>

      {!isCollapsed && (
        <div className="p-3 m-2 bg-white border border-[#E2E8F0] rounded-lg text-xs font-mono-code shadow-sm">
          <div className="flex items-center justify-between text-[10px] text-[#334155] mb-1 font-bold">
            <span className="uppercase font-bold">ACTIVE TELEMETRY</span>
            <span className="text-green-800 flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 led-glow" />
              LOCKED
            </span>
          </div>
          <div className="font-bold text-[#000000] truncate">{selectedUav.callsign}</div>
          <div className="text-[11px] text-[#334155] font-medium truncate">{selectedUav.model}</div>
          <div className="mt-2 pt-2 border-t border-[#E2E8F0] grid grid-cols-2 gap-1 text-[10px]">
            <div>
              <span className="text-[#475569] font-semibold">ALT: </span>
              <span className="text-[#000000] font-bold">{selectedUav.altitudeFt.toLocaleString()} FT</span>
            </div>
            <div>
              <span className="text-[#475569] font-semibold">SPD: </span>
              <span className="text-[#000000] font-bold">{selectedUav.airspeedKts} KTS</span>
            </div>
            <div>
              <span className="text-[#475569] font-semibold">FUEL: </span>
              <span className="text-amber-800 font-bold">{selectedUav.fuelRemainingKg} KG</span>
            </div>
            <div>
              <span className="text-[#475569] font-semibold">HLT: </span>
              <span className="text-green-800 font-bold">{selectedUav.engineHealthIndex.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}

      <div className="p-2 border-t border-[#E2E8F0] text-[10px] font-mono-code text-[#334155] flex items-center justify-between">
        {!isCollapsed ? (
          <>
            <span className="font-semibold text-[#334155]">DRDO-ADE // NODE 03</span>
            <span className="text-[#1E40AF] font-bold">v4.2.8</span>
          </>
        ) : (
          <span className="w-full text-center text-[9px] text-[#1E40AF] font-bold">v4.2</span>
        )}
      </div>
    </aside>
  );
};
