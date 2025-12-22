import { createPortal } from 'react-dom';
import { Edit2, Trash2 } from 'lucide-react';

export const DropdownMenu = ({ 
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
