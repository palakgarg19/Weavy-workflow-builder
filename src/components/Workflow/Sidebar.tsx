"use client";

import { DragEvent, useState, useEffect } from 'react';
import { 
  Search, History, Image as LucideImage, Sparkles, 
 Download, Type
} from 'lucide-react';
import { useWorkflowStore } from '@/store/workflowStore';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const { saveWorkflow, workflowName, setWorkflowName } = useWorkflowStore();
  const [activeTab, setActiveTab] = useState<string | null>('search');
  const [localTitle, setLocalTitle] = useState(workflowName);

  // Sync tab title with workflow name (from store)
  useEffect(() => {
    document.title = workflowName;
  }, [workflowName]);

  // Update local state when store changes (e.g. on load)
  useEffect(() => {
    setLocalTitle(workflowName);
  }, [workflowName]);

  const handleTitleSubmit = () => {
    if (localTitle.trim() !== "") {
      setWorkflowName(localTitle);
    } else {
      setLocalTitle(workflowName); // Revert if empty
    }
  };
  
  const onDragStart = (event: DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const navItems = [
    { id: 'search', icon: Search },
    { id: 'history', icon: History },
  ];

  const handleTabClick = (tabId: string) => {
      if (activeTab === tabId) {
          setActiveTab(null); // Close if clicking same tab
      } else {
          setActiveTab(tabId); // Open if clicking different tab
      }
  };

  const [searchQuery, setSearchQuery] = useState('');

  const nodeItems = [
    { type: 'textNode', label: 'Prompt', icon: Type },
    { type: 'uploadNode', label: 'Import', icon: Download },
    { type: 'imageNode', label: 'Image', icon: LucideImage },
    { type: 'llmNode', label: 'Run Any LLM', icon: Sparkles }
  ];

  const filteredItems = nodeItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="flex h-screen flex-shrink-0 z-20 bg-[rgb(33,33,38)] transition-all" style={{ fontFamily: '"DM Sans", system-ui, -apple-system, Arial, "Apple Color Emoji", "Segoe UI Emoji", sans-serif' }}>
      {/* 1. Navigation Rail */}
      <div className="w-[48px] px-1 border-r border-[#ffffff0a] flex flex-col items-center pt-[24px] pb-4 gap-0 z-30 bg-[rgb(33,33,38)]">
         {/* Logo */}
         <div className="w-10 h-10 flex items-center justify-center cursor-pointer">
            <img src="/logo-white.png" alt="W" className="w-[32px] h-[32px] object-contain" />
         </div>

         {/* Nav Icons */}
         <div className="flex flex-col gap-[12px] w-full items-center mt-[25px]">
            {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                    <button 
                        key={item.id}
                        onClick={() => handleTabClick(item.id)}
                        className={cn(
                            "w-[36px] h-[36px] flex items-center justify-center rounded-[5px] transition-all duration-200 group relative border-none outline-none focus:outline-none ring-0 shadow-none",
                            isActive ? "bg-[rgb(247,255,168)]" : "bg-transparent text-[rgb(211,211,212)] hover:bg-[rgb(53,53,57)]"
                        )}
                    >
                        <item.icon size={20} strokeWidth={1} />
                    </button>
                );
            })}
         </div>

         <div className="flex-1" />
      </div>

      {/* 2. Expanded Sidebar Panel */}
       <aside className={cn(
           "bg-[rgb(33,33,38)] border-r border-[#ffffff0a] flex flex-col relative z-20 transition-all duration-300 ease-in-out overflow-hidden",
           activeTab ? "w-[239px] opacity-100 translate-x-0" : "w-0 opacity-0 -translate-x-full border-none"
       )}>
        {/* Render content based on activeTab */}
        
        {(activeTab === 'search' || activeTab === 'history') && (
            <>
                  {/* Workspace Title & Workflow Name */}
                  <div className="h-[72px] w-full flex items-center justify-center shrink-0">
                    <div className="w-[220px] h-[40px] flex items-center justify-center bg-[rgb(33,33,38)] group">
                        <input 
                            type="text" 
                            value={localTitle} 
                            onChange={(e) => setLocalTitle(e.target.value)}
                            onBlur={(e) => {
                                handleTitleSubmit();
                                e.currentTarget.style.borderColor = 'transparent';
                                e.currentTarget.style.fontSize = '14px';
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = 'rgb(211,211,212)';
                                e.currentTarget.style.fontSize = '12px';
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                            className="bg-transparent outline-none focus:ring-0 cursor-text text-left transition-all rounded-[2px]"
                            style={{ 
                                width: '196px',
                                height: '17.6px',
                                color: 'rgb(255, 255, 255)',
                                fontSize: '14px',
                                fontWeight: 500,
                                fontFamily: '"DM Sans", system-ui, -apple-system, Arial, "Apple Color Emoji", "Segoe UI Emoji", sans-serif',
                                lineHeight: 'normal',
                                border: '0.5px solid transparent',
                                paddingLeft: '6px',
                                marginTop: '8px'
                            }}
                            placeholder="Workflow Name"
                        />
                    </div>
                  </div>
                  
                  {/* Separator Line */}
                  <div className="w-[240px] h-[0.5px] bg-[#ffffff0a] shrink-0" />

                  <div className={cn(
                      "w-[240px] flex flex-col justify-center items-start pl-[16px] pt-[1px] shrink-0 box-border",
                      activeTab === 'search' ? "h-[86.4px]" : "h-[48px]"
                  )}>
                     <div className="flex flex-col items-start gap-[10px]" style={{ width: '179.19px' }}>
                         <div className="flex items-center bg-[rgb(33,33,38)] border border-[#ffffff0a] focus-within:border-[rgb(211,211,212)] transition-all duration-200 rounded-[4px] pl-[9px] w-full" 
                              style={{ height: '25.6px' }}>
                             <Search 
                                 style={{ width: '13.83px', height: '16px' }} 
                                 className="text-[#a1a1aa] shrink-0 mr-[8px]" 
                             />
                             <input 
                                 type="text" 
                                 placeholder="Search" 
                                 value={searchQuery}
                                 onChange={(e) => setSearchQuery(e.target.value)}
                                 className="bg-transparent border-none outline-none text-[#e4e4e7] placeholder:text-[#71717a] placeholder:font-bold)" 
                                 style={{ 
                                     width: '139.7px', 
                                     height: '16px', 
                                     fontSize: '12px',
                                     fontFamily: '"DM Sans", sans-serif',
                                     fontWeight: 500
                                 }}
                             />
                         </div>
 
                          {/* From Input to Output Row - Only in Search Tab */}
                          {activeTab === 'search' && (
                              <div className="flex items-center gap-[4px] relative h-[20px]">
                                 <span style={{ 
                                     color: 'rgb(255, 255, 255)',
                                     fontSize: '12px',
                                     fontWeight: 400,
                                     fontFamily: '"DM Sans", system-ui, -apple-system, Arial, sans-serif',
                                     lineHeight: 'normal'
                                 }}>
                                     From
                                 </span>
                                 
                                 <div className="relative group/input">
                                     <button className="bg-[#2a2a30] px-1.5 py-0.5 rounded-[4px] border border-[#2a2a30] tracking-wide transition-all"
                                         style={{ 
                                             color: 'rgba(255, 255, 255, 0.6)',
                                             fontSize: '12px',
                                             fontWeight: 400,
                                             fontFamily: '"DM Mono", monospace',
                                             lineHeight: 'normal'
                                         }}
                                     >
                                         Input
                                     </button>
                                     {/* Hidden logic for list - showing it on hover for now as a demo of "open select list" */}
                                     <div className="absolute top-full left-0 mt-1 w-24 bg-[#212126] border border-[#ffffff14] rounded-lg shadow-xl opacity-0 invisible group-hover/input:opacity-100 group-hover/input:visible z-50 transition-all py-1">
                                         <button className="w-full text-left px-3 py-1.5 text-[12px] text-white hover:bg-[#2a2a30] transition-colors">Text</button>
                                         <button className="w-full text-left px-3 py-1.5 text-[12px] text-white hover:bg-[#2a2a30] transition-colors">Image</button>
                                     </div>
                                 </div>
         
                                 <span style={{ 
                                     color: 'rgb(255, 255, 255)',
                                     fontSize: '12px',
                                     fontWeight: 400,
                                     fontFamily: '"DM Sans", system-ui, -apple-system, Arial, sans-serif',
                                     lineHeight: 'normal'
                                 }}>
                                     to
                                 </span>
         
                                 <div className="relative group/output">
                                     <button className="bg-[#2a2a30] px-1.5 py-0.5 rounded-[4px] border border-[#2a2a30] tracking-wide transition-all"
                                         style={{ 
                                             color: 'rgba(255, 255, 255, 0.6)',
                                             fontSize: '12px',
                                             fontWeight: 400,
                                             fontFamily: '"DM Mono", monospace',
                                             lineHeight: 'normal',
                                         }}
                                     >
                                         Output
                                     </button>
                                     <div className="absolute top-full left-0 mt-1 w-24 bg-[#212126] border border-[#ffffff14] rounded-lg shadow-xl opacity-0 invisible group-hover/output:opacity-100 group-hover/output:visible z-50 transition-all py-1">
                                         <button className="w-full text-left px-3 py-1.5 text-[12px] text-white hover:bg-[#2a2a30] transition-colors">Text</button>
                                         <button className="w-full text-left px-3 py-1.5 text-[12px] text-white hover:bg-[#2a2a30] transition-colors">Image</button>
                                     </div>
                                 </div>
                              </div>
                          )}
                     </div>
                  </div>
              
              {/* Second Separator Line - Only in Search Tab */}
              {activeTab === 'search' && (
                  <div className="w-[240px] h-[0.5px] bg-[#ffffff0a] shrink-0 mb-[16px]" />
              )}

                {/* Quick Access Grid */}
                <div className="pl-[16px] pr-[16px] pt-0 flex-1 overflow-y-auto w-full">
                    {/* <div className="h-4 w-full shrink-0" /> */}
                    {!searchQuery && (
                        <h3 
                            style={{ 
                                color: 'rgb(255, 255, 255)',
                                fontSize: '16px',
                                fontWeight: 500,
                                fontFamily: '"DM Sans", system-ui, -apple-system, Arial, "Apple Color Emoji", "Segoe UI Emoji", sans-serif',
                                lineHeight: 'normal'
                            }}
                            className="mb-4 tracking-tight"
                        >
                            Quick access
                        </h3>
                    )}
                    
                    <div className="flex flex-wrap gap-[8px] w-full">
                        {filteredItems.map((item) => (
                            <div 
                                key={item.type}
                                className="w-[99.6px] h-[100px] bg-[rgb(43,43,47)] border border-[#ffffff1c] rounded-[5px] flex flex-col items-center justify-center gap-[8px] cursor-grab hover:bg-[#2a2a30] transition-all group"
                                onDragStart={(event) => onDragStart(event, item.type)}
                                draggable
                            >
                                <item.icon size={20} className="text-[#e4e4e7] group-hover:text-white transition-colors stroke-[1.5px]" />
                                <span 
                                    style={{ 
                                        color: 'rgb(255, 255, 255)',
                                        fontSize: '12px',
                                        fontWeight: 400,
                                        fontFamily: '"DM Sans", system-ui, -apple-system, Arial, "Apple Color Emoji", "Segoe UI Emoji", sans-serif',
                                        lineHeight: 'normal'
                                    }}
                                    className="tracking-normal text-center px-1"
                                >
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        )}

      </aside>
    </div>
  );
}
