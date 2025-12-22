import { useState, useRef, useEffect} from 'react';
import { createPortal } from 'react-dom';
import { Handle, Position, useReactFlow } from 'reactflow';
import { useWorkflowStore } from '@/store/workflowStore';
import { MoreHorizontal, Trash2, Edit2, X, Plus, Asterisk } from 'lucide-react';
import { cn } from '@/lib/utils';

const RenameModal = ({ 
  isOpen, 
  initialValue, 
  onClose, 
  onRename 
}: { 
  isOpen: boolean; 
  initialValue: string; 
  onClose: () => void; 
  onRename: (newName: string) => void; 
}) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (isOpen) setValue(initialValue);
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-[1px]">
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl w-[480px] p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-[#a1a1aa] hover:text-white transition-colors"
        >
            <X size={20} />
        </button>
        <h2 className="text-xl font-semibold text-white mb-6">Rename Node</h2>
        <input 
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full bg-[#1c1c1f] border border-[#27272a] rounded-lg h-12 px-4 text-[#e4e4e7] placeholder:text-[#52525b] focus:outline-none focus:border-[#52525b] transition-all text-[15px] mb-8"
            placeholder="Enter node name"
            autoFocus
            onKeyDown={(e) => {
                if (e.key === 'Enter') onRename(value);
                if (e.key === 'Escape') onClose();
            }}
        />
        <div className="flex justify-end items-center gap-3">
            <button 
                onClick={onClose}
                className="px-4 py-2 text-[#e4e4e7] font-medium hover:text-white transition-colors text-sm"
            >
                Cancel
            </button>
            <button 
                onClick={() => onRename(value)}
                className="px-6 py-2 bg-[#fef08a] hover:bg-[#fde047] text-black font-semibold rounded-lg transition-colors text-sm"
            >
                Rename
            </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Dropdown Portal
const DropdownPortal = ({ 
    isOpen, 
    position, 
    onClose, 
    onRename, 
    onDelete 
}: { 
    isOpen: boolean; 
    position: { x: number, y: number }; 
    onClose: () => void; 
    onRename: () => void;
    onDelete: () => void;
}) => {
    if (!isOpen) return null;

    return createPortal(
        <div 
            className="fixed inset-0 z-[9998]" 
            onClick={onClose} 
            onContextMenu={(e) => { e.preventDefault(); onClose(); }}
        >
            <div 
                className="absolute w-32 bg-[#212126] border border-[#3f3f46] rounded-lg shadow-xl overflow-hidden flex flex-col py-1 animate-in fade-in zoom-in-95 duration-75"
                style={{ top: position.y, left: position.x }}
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={() => { onRename(); onClose(); }}
                    className="flex items-center gap-2 px-3 py-2 text-[13px] text-[#e4e4e7] hover:bg-[#2a2a30] transition-colors w-full text-left"
                >
                    <Edit2 size={13} className="opacity-70" /> Rename
                </button>
                <button 
                    onClick={() => { onDelete(); onClose(); }}
                    className="flex items-center gap-2 px-3 py-2 text-[13px] text-red-400 hover:bg-[#3f1d1d] transition-colors w-full text-left"
                >
                    <Trash2 size={13} className="opacity-70" /> Delete
                </button>
            </div>
        </div>,
        document.body
    );
};


/**
 * TextNode - A React Flow node for manual text/prompt entry.
 */
export default function TextNode({ id, data, selected }: { id: string, data: any, selected: boolean }) {
  const { updateNodeData } = useWorkflowStore();
  const { deleteElements } = useReactFlow();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const handleDelete = () => {
      deleteElements({ nodes: [{ id }] });
  };

  const onRenameSubmit = (newName: string) => {
      updateNodeData(id, { label: newName });
      setIsRenameModalOpen(false);
  };
  
  const toggleMenu = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isMenuOpen && menuButtonRef.current) {
          const rect = menuButtonRef.current.getBoundingClientRect();
          setMenuPosition({ x: rect.right - 128, y: rect.bottom + 4 }); // Align right edge
      }
      setIsMenuOpen(!isMenuOpen);
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize logic
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [data.text]);

  return (
    <>
        <RenameModal 
            isOpen={isRenameModalOpen}
            initialValue={data.label || 'Prompt'}
            onClose={() => setIsRenameModalOpen(false)}
            onRename={onRenameSubmit}
        />
        
        <DropdownPortal 
            isOpen={isMenuOpen}
            position={menuPosition}
            onClose={() => setIsMenuOpen(false)}
            onRename={() => setIsRenameModalOpen(true)}
            onDelete={handleDelete}
        />

        <div 
            className={cn(
                "bg-[rgb(43,43,47)] border rounded-[16px] w-[460px] min-h-[267.2px] shadow-sm flex flex-col group transition-all relative overflow-visible box-border",
                selected ? "border-[#52525b]" : "border-[#4a4a4f] hover:border-[#52525b]"
            )}
        >
            <div className="flex items-center justify-between pl-[30px] pr-[16px] pt-[16px] mb-[12px] h-[20px] shrink-0">
                <input
                    type="text"
                    value={data.label ?? 'Prompt'}
                    onChange={(e) => updateNodeData(id, { label: e.target.value })}
                    onBlur={(e) => {
                        if (!e.target.value.trim()) {
                            updateNodeData(id, { label: 'Prompt' });
                        }
                    }}
                    className="text-[16px] font-semibold text-white tracking-tight leading-none bg-transparent border-none outline-none focus:outline-none ring-0 px-0 cursor-text"
                    style={{ width: 'auto', minWidth: '60px', maxWidth: '300px', color: 'white' }}
                    onFocus={(e) => e.target.select()}
                />
                
                <button 
                    ref={menuButtonRef}
                    onClick={toggleMenu}
                    className={cn(
                        "rounded-[4px] transition-all duration-200 flex items-center justify-center relative z-10 border-none outline-none focus:outline-none ring-0 shadow-none",
                        isMenuOpen ? "bg-[rgb(53,53,57)] text-white" : "bg-transparent text-[rgb(211,211,212)] hover:bg-[rgb(53,53,57)] hover:text-white"
                    )}
                    style={{ height: '28px', width: '28px' }}
                >
                    <MoreHorizontal size={20} strokeWidth={1} />
                </button>
            </div>
            
            <div className="px-[25.2px] pb-[27.2px] shrink-0">
                <div className="bg-[rgb(53,53,57)] rounded-[6px] w-[409.6px] min-h-[192px] flex flex-col box-border">
                    <textarea 
                        ref={textareaRef}
                        className="w-full bg-transparent border-0 px-[12px] py-[12px] text-[16px] font-medium text-[#FFFFFF] placeholder:text-[#71717a] resize-none focus:outline-none leading-[24px] nodrag overflow-hidden box-border"
                        placeholder="Enter your prompt here..."
                        value={data.text || ''}
                        onChange={(e) => updateNodeData(id, { text: e.target.value })}
                        style={{
                            minHeight: '192px',
                            fontFamily: '"DM Sans", sans-serif'
                        }}
                    />
                </div>
            </div>

            {/* Handle */}
            <Handle 
                type="source" 
                position={Position.Right} 
                className={cn(
                    "!w-3 !h-3 !border-4 !right-[-7px] z-50 transition-colors group/handle",
                    data.validationError ? "!bg-[rgb(241,160,250)] !border-[rgb(241,160,250)]" : "!bg-[#2b2b2f] !border-[rgb(241,160,250)]"
                )}
                style={{
                    borderColor: data.validationError ? 'rgb(241,160,250)' : 'rgb(241,160,250)',
                    backgroundColor: data.validationError ? 'rgb(241,160,250)' : '#2b2b2f'
                }}
            >
                {data.validationError && (
                    <>
                        <div className="absolute top-[-4px] left-[-4px] bottom-[-4px] right-[-4px] flex items-center justify-center pointer-events-none">
                            <Asterisk size={12} className="text-[rgb(232,85,85)] stroke-[4px]" />
                        </div>
                        <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 px-2 py-1 bg-[#18181b] text-white text-[12px] font-medium rounded-[4px] whitespace-nowrap opacity-0 group-hover/handle:opacity-100 transition-opacity shadow-xl border border-[#27272a] pointer-events-none z-[100]">
                            {data.validationError}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-[#18181b]"></div>
                        </div>
                    </>
                )}
            </Handle>
            {(selected || data.validationError) && (
                <div className="absolute right-[-70px] top-[50%] -translate-y-1/2 flex items-center pl-1 animate-in fade-in duration-200 z-50">
                    <span 
                        className="text-[14px] font-[500] leading-normal transition-colors" 
                        style={{ 
                            fontFamily: '"DM Mono", monospace', 
                            color: data.validationError ? 'rgb(232,85,85)' : 'rgb(241,160,250)' 
                        }}
                    >
                        Prompt
                    </span>
                </div>
            )}
        </div>
    </>
  );
}
