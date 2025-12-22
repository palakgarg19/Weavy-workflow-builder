import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export const RenameModal = ({ 
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
                onClick={() => {
                    if (value.trim()) {
                        onRename(value.trim());
                    }
                }}
                disabled={!value.trim()}
                className="px-6 py-2 bg-[#fef08a] hover:bg-[#fde047] disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-lg transition-colors text-sm"
            >
                Rename
            </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
