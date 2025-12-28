import React, { useState, createContext, useContext } from 'react';
import { MoreHorizontal, Trash2, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BaseNodeMenuContextType {
    closeMenu: () => void;
}

const BaseNodeMenuContext = createContext<BaseNodeMenuContextType | null>(null);

export const useBaseNodeMenu = () => {
    const context = useContext(BaseNodeMenuContext);
    if (!context) {
        throw new Error('useBaseNodeMenu must be used within a BaseNodeMenuProvider');
    }
    return context;
};

interface BaseNodeMenuProps {
    id: string;
    onNodesChange: (changes: any[]) => void;
    labelInputRef?: React.RefObject<HTMLInputElement | null>;
    children?: React.ReactNode; // For model selection submenus
}

/**
 * BaseNodeMenu - A shared menu component for all workflow nodes.
 * Handles common actions like Rename and Delete, with support for custom submenus.
 */
export const BaseNodeMenu: React.FC<BaseNodeMenuProps> = ({
    id,
    onNodesChange,
    labelInputRef,
    children
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const closeMenu = () => setIsMenuOpen(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={cn(
                    "rounded-[4px] transition-all duration-200 flex items-center justify-center relative z-10 border-none outline-none focus:outline-none ring-0 shadow-none",
                    "bg-transparent text-[rgb(211,211,212)] hover:bg-[rgb(53,53,57)] hover:text-white",
                    isMenuOpen ? "bg-[rgb(53,53,57)] text-white" : ""
                )}
                style={{ height: '28px', width: '28px' }}
            >
                <MoreHorizontal size={20} strokeWidth={1} />
            </button>

            {isMenuOpen && (
                <>
                    <div
                        className="fixed inset-0 z-[9997]"
                        onClick={closeMenu}
                    />
                    <div
                        className="absolute bottom-full mb-2 right-0 bg-[rgb(33,33,38)] rounded-[8px] z-[9998] py-[8px] flex flex-col items-center justify-center border border-[rgb(53,53,57)] shadow-xl"
                        style={{
                            width: '190.4px',
                            fontFamily: '"DM Sans", system-ui, -apple-system, Arial, sans-serif'
                        }}
                    >
                        {/* Custom Content (e.g., Model Selection Submenu) */}
                        {children && (
                            <BaseNodeMenuContext.Provider value={{ closeMenu }}>
                                <div className="w-full">
                                    {children}
                                </div>
                            </BaseNodeMenuContext.Provider>
                        )}

                        {/* Rename */}
                        {labelInputRef && (
                            <div className="w-full px-[3px]">
                                <button
                                    onClick={() => {
                                        closeMenu();
                                        setTimeout(() => {
                                            labelInputRef.current?.focus();
                                            labelInputRef.current?.select();
                                        }, 50);
                                    }}
                                    className="px-[12px] w-[184px] flex items-center justify-between hover:bg-[rgb(53,53,57)] ml-[3px] transition-colors bg-transparent border-none outline-none shadow-none ring-0 rounded-[4px]"
                                    style={{ height: '24px', fontSize: '12px', fontWeight: 400, color: 'rgb(255,255,255)' }}
                                >
                                    <span>Rename</span>
                                    <Pencil size={12} className="opacity-50" />
                                </button>
                            </div>
                        )}

                        {/* Delete */}
                        <div className="w-full px-[3px]">
                            <button
                                onClick={() => {
                                    onNodesChange([{ id, type: 'remove' }]);
                                    closeMenu();
                                }}
                                className="px-[12px] w-[184px] flex items-center justify-between hover:bg-[rgb(53,53,57)] ml-[3px] transition-colors bg-transparent border-none outline-none shadow-none ring-0 rounded-[4px] group/delete"
                                style={{ height: '24px', fontSize: '12px', fontWeight: 400, color: 'rgb(255,255,255)' }}
                            >
                                <span className="group-hover/delete:text-red-400 transition-colors">Delete</span>
                                <Trash2 size={12} className="opacity-50 group-hover/delete:text-red-400 transition-colors" />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
