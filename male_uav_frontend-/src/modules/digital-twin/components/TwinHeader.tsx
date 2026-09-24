import React from 'react';
import { Shield, AlertTriangle, Activity } from 'lucide-react';

export const TwinHeader = () => {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6 justify-between shadow-sm z-30 flex-shrink-0">
      
      {/* LEFT SECTION */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center shadow-sm">
          <Shield className="w-5 h-5 text-red-600" />
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-[15px] font-black text-gray-900 tracking-tight leading-tight uppercase">DRDO | GCS-X1</span>
          <span className="text-xs font-bold text-red-600 leading-tight">Aero Piston Twin</span>
        </div>
      </div>

      {/* CENTER SECTION */}
      <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50/80 px-5 py-1.5 gap-6 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none flex flex-col gap-0.5">
            <span>Engine</span>
            <span>HLT:</span>
          </span>
          <span className="text-[15px] font-black text-gray-900 leading-none tracking-tight">87.7%</span>
        </div>
        
        <div className="w-px h-6 bg-gray-300"></div>
        
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">RUL:</span>
          <div className="flex flex-col items-center">
            <span className="text-[15px] font-black text-gray-900 leading-none tracking-tight">142.6</span>
            <span className="text-[9px] font-bold text-gray-500 tracking-widest mt-0.5">hrs</span>
          </div>
        </div>
        
        <div className="w-px h-6 bg-gray-300"></div>
        
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none flex flex-col gap-0.5">
            <span>Twin</span>
            <span>Sync:</span>
          </span>
          <span className="text-[15px] font-black text-gray-900 leading-none tracking-tight">98.7%</span>
        </div>
        
        <div className="w-px h-6 bg-gray-300"></div>
        
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Decision:</span>
          <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-black tracking-widest border border-green-200 uppercase">
            GO FLIGHT
          </div>
        </div>
        
        <div className="w-px h-6 bg-gray-300"></div>
        
        <div className="flex items-center">
          <div className="bg-red-50 text-red-600 px-3 py-1.5 rounded-md text-xs font-black border border-red-200 flex items-center gap-1.5 uppercase shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5" />
            ALERT
          </div>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-black text-xs tracking-widest flex items-center gap-2 shadow border border-blue-700 transition-colors uppercase">
          <Activity className="w-4 h-4" />
          SIMULATOR
        </button>
      </div>
      
    </div>
  );
};
