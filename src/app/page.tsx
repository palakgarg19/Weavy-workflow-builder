import Sidebar from '@/components/Workflow/Sidebar';
import Canvas from '@/components/Workflow/Canvas';

export default function Home() {
  return (
    <main className="flex h-screen w-screen overflow-hidden bg-[#0a0a0a] p-0 m-0 border-none">
      <Sidebar />
      <div className="flex-1 h-full relative">
         {/* Dotted background is inside Canvas/ReactFlow */}
         <Canvas />
      </div>
    </main>
  );
}
