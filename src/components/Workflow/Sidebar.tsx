"use client";

import { DragEvent, useState, useEffect, useRef } from 'react';
import {
    Search, History, Image as LucideImage, Sparkles,
    Download, Type, ChevronDown, Plus, Save, Upload, Check
} from 'lucide-react';
import { useWorkflowStore } from '@/store/workflowStore';
import { cn } from '@/lib/utils';

export default function Sidebar() {
    const workflowName = useWorkflowStore(state => state.workflowName);
    const setWorkflowName = useWorkflowStore(state => state.setWorkflowName);
    const workflows = useWorkflowStore(state => state.workflows);
    const fetchWorkflows = useWorkflowStore(state => state.fetchWorkflows);
    const loadWorkflow = useWorkflowStore(state => state.loadWorkflow);
    const createNewWorkflow = useWorkflowStore(state => state.createNewWorkflow);
    const saveWorkflow = useWorkflowStore(state => state.saveWorkflow);
    const isSaving = useWorkflowStore(state => state.isSaving);
    const exportWorkflow = useWorkflowStore(state => state.exportWorkflow);
    const importWorkflow = useWorkflowStore(state => state.importWorkflow);
    const [activeTab, setActiveTab] = useState<string | null>('search');
    const [localTitle, setLocalTitle] = useState(workflowName);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                const result = importWorkflow(json);
                if (!result.success) {
                    alert(`Import Failed: ${result.error}`);
                }
            } catch (error) {
                alert("Invalid File: This is not a valid JSON workflow file.");
            }
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsText(file);
    };

    // Fetch workflows once on mount
    useEffect(() => {
        fetchWorkflows();
    }, [fetchWorkflows]);

    // Handle clicking outside dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
            setLocalTitle(workflowName);
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
            setActiveTab(null);
        } else {
            setActiveTab(tabId);
        }
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedInputs, setSelectedInputs] = useState<string[]>([]);
    const [selectedOutputs, setSelectedOutputs] = useState<string[]>([]);

    const toggleFilter = (type: 'input' | 'output', value: string) => {
        if (type === 'input') {
            setSelectedInputs(prev =>
                prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
            );
        } else {
            setSelectedOutputs(prev =>
                prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
            );
        }
    };

    const nodeItems = [
        { type: 'textNode', label: 'Prompt', icon: Type, inputs: [], outputs: ['text'] },
        { type: 'uploadNode', label: 'Import', icon: Download, inputs: [], outputs: ['image'] },
        { type: 'imageNode', label: 'Image', icon: LucideImage, inputs: ['text', 'image'], outputs: ['image'] },
        { type: 'llmNode', label: 'Run Any LLM', icon: Sparkles, inputs: ['text', 'image'], outputs: ['text'] }
    ];

    const filteredItems = nodeItems.filter(item => {
        if (searchQuery && !item.label.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        if (selectedOutputs.includes('text') && selectedOutputs.includes('image')) {
            return false;
        }

        const hasInputFilter = selectedInputs.length > 0;
        const hasOutputFilter = selectedOutputs.length > 0;

        if (!hasInputFilter && !hasOutputFilter) return true;

        if (!hasInputFilter && selectedOutputs.length === 1 && selectedOutputs[0] === 'text') {
            return item.type === 'textNode' || item.type === 'llmNode';
        }

        if (!hasInputFilter && selectedOutputs.length === 1 && selectedOutputs[0] === 'image') {
            return item.type === 'uploadNode' || item.type === 'imageNode';
        }

        if (hasInputFilter && selectedOutputs.length === 1 && selectedOutputs[0] === 'image') {
            return item.type === 'imageNode';
        }

        if (hasInputFilter && selectedOutputs.length === 1 && selectedOutputs[0] === 'text') {
            return item.type === 'llmNode';
        }

        if (hasInputFilter && !hasOutputFilter) {
            return selectedInputs.some(i => item.inputs.includes(i));
        }

        return false;
    });

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
                        {/* Editable Workflow Title & Dropdown Toggle */}
                        <div className="h-[72px] w-full flex items-center justify-center shrink-0">
                            <div ref={dropdownRef} className="relative z-[100]">
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
                                            width: '184px',
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
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className={cn(
                                            "mt-[8px] p-1.5 rounded-[4px] transition-all shrink-0 border-none outline-none shadow-none focus:outline-none ring-0",
                                            isDropdownOpen ? "bg-[rgb(53,53,57)]" : "hover:bg-[rgb(53,53,57)] bg-transparent"
                                        )}
                                    >
                                        <ChevronDown
                                            size={14}
                                            strokeWidth={1.5}
                                            className={cn(
                                                "transition-transform duration-200 text-[rgb(211,211,212)]",
                                                isDropdownOpen && "rotate-180"
                                            )}
                                        />
                                    </button>
                                </div>

                                {/* Dropdown Menu */}
                                {isDropdownOpen && (
                                    <div
                                        className="absolute top-[44px] left-[-4px] bg-[rgb(33,33,38)] border border-[#ffffff14] rounded-[8px] shadow-[0_8px_32px_rgba(0,0,0,0.5)] py-2 z-[101] flex flex-col items-center"
                                        style={{ width: '220.4px' }}
                                    >
                                        <div className="w-full max-h-[300px] overflow-y-auto custom-scrollbar flex flex-col items-center mt-[8px]">
                                            {workflows.length === 0 ? (
                                                <div className="w-[184px] px-[3px] py-1 text-[12px] text-[rgba(255,255,255,0.4)] italic">No workflows found</div>
                                            ) : (
                                                workflows.map((w) => (
                                                    <button
                                                        key={w.id}
                                                        onClick={() => {
                                                            loadWorkflow(w.id);
                                                            setIsDropdownOpen(false);
                                                        }}
                                                        className="w-[184px] h-[24px] flex items-center px-[8px] rounded-[4px] hover:bg-[rgb(53,53,57)] transition-all group bg-transparent border-none outline-none shadow-none cursor-pointer"
                                                    >
                                                        <span
                                                            className="truncate pointer-events-none"
                                                            style={{
                                                                fontSize: '12px',
                                                                fontWeight: 400,
                                                                fontFamily: '"DM Sans", sans-serif',
                                                                color: 'rgb(255, 255, 255)'
                                                            }}
                                                        >
                                                            {w.name}
                                                        </span>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                        <div className="w-[184px] h-[0.5px] bg-[#ffffff0a] my-[6px]" />
                                        <button
                                            onClick={() => {
                                                createNewWorkflow();
                                                setIsDropdownOpen(false);
                                            }}
                                            className="w-[184px] h-[24px] flex items-center px-[8px] rounded-[4px] hover:bg-[rgb(53,53,57)] transition-all gap-2 group bg-transparent border-none outline-none shadow-none cursor-pointer"
                                        >
                                            <Plus size={14} style={{ color: 'rgb(255, 255, 255)' }} className="pointer-events-none" strokeWidth={1.5} />
                                            <span
                                                className="pointer-events-none"
                                                style={{
                                                    fontSize: '12px',
                                                    fontWeight: 400,
                                                    fontFamily: '"DM Sans", sans-serif',
                                                    color: 'rgb(255, 255, 255)',
                                                    paddingLeft: '8px'
                                                }}
                                            >
                                                Create New Workflow
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                saveWorkflow();
                                                setIsDropdownOpen(false);
                                            }}
                                            className="w-[184px] h-[24px] flex items-center px-[8px] rounded-[4px] hover:bg-[rgb(53,53,57)] transition-all gap-2 group bg-transparent border-none outline-none shadow-none cursor-pointer"
                                        >
                                            <Save size={14} style={{ color: 'rgb(255, 255, 255)', marginBottom: '8px' }} className={cn("pointer-events-none", isSaving && "animate-spin")} strokeWidth={1.5} />
                                            <span
                                                className="pointer-events-none"
                                                style={{
                                                    fontSize: '12px',
                                                    fontWeight: 400,
                                                    fontFamily: '"DM Sans", sans-serif',
                                                    color: 'rgb(255, 255, 255)',
                                                    paddingLeft: '8px',
                                                    marginBottom: '8px'
                                                }}
                                            >
                                                {isSaving ? 'Saving...' : 'Save Workflow'}
                                            </span>
                                        </button>
                                        <div className="w-[184px] h-[0.5px] bg-[#ffffff0a] my-[6px]" />

                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept=".json"
                                            onChange={handleImport}
                                        />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-[184px] h-[24px] flex items-center px-[8px] rounded-[4px] hover:bg-[rgb(53,53,57)] transition-all gap-2 group bg-transparent border-none outline-none shadow-none cursor-pointer"
                                        >
                                            <Download size={14} style={{ color: 'rgb(255, 255, 255)' }} className="pointer-events-none" strokeWidth={1.5} />
                                            <span
                                                className="pointer-events-none"
                                                style={{
                                                    fontSize: '12px',
                                                    fontWeight: 400,
                                                    fontFamily: '"DM Sans", sans-serif',
                                                    color: 'rgb(255, 255, 255)',
                                                    paddingLeft: '8px'
                                                }}
                                            >
                                                Import JSON
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                exportWorkflow();
                                                setIsDropdownOpen(false);
                                            }}
                                            className="w-[184px] h-[24px] flex items-center px-[8px] rounded-[4px] hover:bg-[rgb(53,53,57)] transition-all gap-2 group bg-transparent border-none outline-none shadow-none cursor-pointer mt-1"
                                        >
                                            <Upload size={14} style={{ color: 'rgb(255, 255, 255)' }} className="pointer-events-none" strokeWidth={1.5} />
                                            <span
                                                className="pointer-events-none"
                                                style={{
                                                    fontSize: '12px',
                                                    fontWeight: 400,
                                                    fontFamily: '"DM Sans", sans-serif',
                                                    color: 'rgb(255, 255, 255)',
                                                    paddingLeft: '8px'
                                                }}
                                            >
                                                Export JSON
                                            </span>
                                        </button>
                                    </div>
                                )}
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
                                            <div className="flex items-center gap-[4px]">
                                                {selectedInputs.length === 0 ? (
                                                    <button className="bg-[#2a2a30] px-1.5 h-[16px] rounded-[2px] border border-[#2a2a30] tracking-wide transition-all"
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
                                                ) : (
                                                    selectedInputs.map(input => (
                                                        <button
                                                            key={input}
                                                            onClick={() => toggleFilter('input', input)}
                                                            className="px-1.5 h-[16px] rounded-[2px] tracking-wide transition-all border-none"
                                                            style={{
                                                                backgroundColor: input === 'text' ? 'rgb(241, 160, 250)' : 'rgb(110, 221, 179)',
                                                                color: 'rgb(33, 33, 38)',
                                                                fontSize: '12px',
                                                                fontWeight: 400,
                                                                fontFamily: '"DM Mono", monospace',
                                                                lineHeight: 'normal'
                                                            }}
                                                        >
                                                            {input.charAt(0).toUpperCase() + input.slice(1)}
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                            <div className="absolute top-full left-0 mt-1 w-[103.2px] bg-[#212126] border border-[#ffffff14] rounded-lg shadow-xl opacity-0 invisible group-hover/input:opacity-100 group-hover/input:visible z-50 transition-all pt-[12px] pb-1.5 px-2 flex flex-col gap-2">
                                                <button
                                                    onClick={() => toggleFilter('input', 'text')}
                                                    className="w-full bg-transparent text-left px-2 py-2.5 rounded-[4px] hover:bg-[#2a2a30] transition-colors flex items-center justify-between group/item border-none outline-none ring-0 focus:outline-none"
                                                >
                                                    <span
                                                        className="px-1.5 h-[16px] rounded-[2px] flex items-center"
                                                        style={{
                                                            backgroundColor: 'rgb(241, 160, 250)',
                                                            color: 'rgb(33, 33, 38)',
                                                            fontSize: '12px',
                                                            fontFamily: '"DM Mono", monospace',
                                                            lineHeight: 'normal',
                                                            marginBottom: '8px',
                                                            paddingLeft: '8px',
                                                            paddingRight: '8px'
                                                        }}
                                                    >
                                                        Text
                                                    </span>
                                                    {selectedInputs.includes('text') && <Check size={16} color="white" strokeWidth={2} />}
                                                </button>
                                                <button
                                                    onClick={() => toggleFilter('input', 'image')}
                                                    className="w-full bg-transparent text-left px-2 py-2.5 rounded-[4px] hover:bg-[#2a2a30] transition-colors flex items-center justify-between group/item border-none outline-none ring-0 focus:outline-none"
                                                >
                                                    <span
                                                        className="px-1.5 h-[16px] rounded-[2px] flex items-center"
                                                        style={{
                                                            backgroundColor: 'rgb(110, 221, 179)',
                                                            color: 'rgb(33, 33, 38)',
                                                            fontSize: '12px',
                                                            fontFamily: '"DM Mono", monospace',
                                                            lineHeight: 'normal',
                                                            marginBottom: '8px',
                                                            paddingLeft: '8px',
                                                            paddingRight: '8px'
                                                        }}
                                                    >
                                                        Image
                                                    </span>
                                                    {selectedInputs.includes('image') && <Check size={16} color="white" strokeWidth={2} />}
                                                </button>
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
                                            <div className="flex items-center gap-[4px]">
                                                {selectedOutputs.length === 0 ? (
                                                    <button className="bg-[#2a2a30] px-1.5 h-[16px] rounded-[2px] border border-[#2a2a30] tracking-wide transition-all"
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
                                                ) : (
                                                    selectedOutputs.map(output => (
                                                        <button
                                                            key={output}
                                                            onClick={() => toggleFilter('output', output)}
                                                            className="px-1.5 h-[16px] rounded-[2px] tracking-wide transition-all border-none"
                                                            style={{
                                                                backgroundColor: output === 'text' ? 'rgb(241, 160, 250)' : 'rgb(110, 221, 179)',
                                                                color: 'rgb(33, 33, 38)',
                                                                fontSize: '12px',
                                                                fontWeight: 400,
                                                                fontFamily: '"DM Mono", monospace',
                                                                lineHeight: 'normal'
                                                            }}
                                                        >
                                                            {output.charAt(0).toUpperCase() + output.slice(1)}
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                            <div className="absolute top-full left-0 mt-1 w-[103.2px] bg-[#212126] border border-[#ffffff14] rounded-lg shadow-xl opacity-0 invisible group-hover/output:opacity-100 group-hover/output:visible z-50 transition-all pt-[12px] pb-1.5 px-2 flex flex-col gap-2">
                                                <button
                                                    onClick={() => toggleFilter('output', 'text')}
                                                    className="w-full bg-transparent text-left px-2 py-2.5 rounded-[4px] hover:bg-[#2a2a30] transition-colors flex items-center justify-between group/item border-none outline-none ring-0 focus:outline-none"
                                                >
                                                    <span
                                                        className="px-1.5 h-[16px] rounded-[2px] flex items-center"
                                                        style={{
                                                            backgroundColor: 'rgb(241, 160, 250)',
                                                            color: 'rgb(33, 33, 38)',
                                                            fontSize: '12px',
                                                            fontFamily: '"DM Mono", monospace',
                                                            lineHeight: 'normal',
                                                            marginBottom: '8px',
                                                            paddingLeft: '8px',
                                                            paddingRight: '8px'
                                                        }}
                                                    >
                                                        Text
                                                    </span>
                                                    {selectedOutputs.includes('text') && <Check size={16} color="white" strokeWidth={2} />}
                                                </button>
                                                <button
                                                    onClick={() => toggleFilter('output', 'image')}
                                                    className="w-full bg-transparent text-left px-2 py-2.5 rounded-[4px] hover:bg-[#2a2a30] transition-colors flex items-center justify-between group/item border-none outline-none ring-0 focus:outline-none"
                                                >
                                                    <span
                                                        className="px-1.5 h-[16px] rounded-[2px] flex items-center"
                                                        style={{
                                                            backgroundColor: 'rgb(110, 221, 179)',
                                                            color: 'rgb(33, 33, 38)',
                                                            fontSize: '12px',
                                                            fontFamily: '"DM Mono", monospace',
                                                            lineHeight: 'normal',
                                                            marginBottom: '8px',
                                                            paddingLeft: '8px',
                                                            paddingRight: '8px'
                                                        }}
                                                    >
                                                        Image
                                                    </span>
                                                    {selectedOutputs.includes('image') && <Check size={16} color="white" strokeWidth={2} />}
                                                </button>
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
                            {(!searchQuery && filteredItems.length > 0) && (
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
                                {filteredItems.length > 0 ? (
                                    filteredItems.map((item) => (
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
                                    ))
                                ) : (
                                    <div className="w-full flex flex-col items-center justify-center py-8 opacity-40">

                                        <span className="text-white text-[12px]">No results match for this search</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

            </aside>
        </div>
    );
}
