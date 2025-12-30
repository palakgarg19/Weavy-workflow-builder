# Weavy Workflow Builder

A powerful visual workflow builder for creating AI-powered automation pipelines with Google's Gemini AI and Hugging Face. Build complex workflows by connecting nodes for text processing, image generation, and LLM interactions through an intuitive drag-and-drop interface.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![React Flow](https://img.shields.io/badge/React_Flow-11-purple?style=for-the-badge)
![Zustand](https://img.shields.io/badge/Zustand-State-orange?style=for-the-badge)
![Prisma](https://img.shields.io/badge/Prisma-5-teal?style=for-the-badge&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🎨 Visual Workflow Design
- **Drag-and-Drop Interface**: Intuitive node-based workflow creation.
- **Real-time Canvas**: Pan, zoom (1%–300%), and navigate your workflows with ease.
- **Smart Connections**: Color-coded edges for different data types (purple for text, teal for images).
- **Dynamic Node Sizing**: Image/Import nodes automatically resize to fit content.

### 🧩 Node Types

#### 📝 Prompt Node
- Input text prompts and instructions.
- Multi-line text editing.
- Connect to multiple downstream nodes.

#### 🖼️ Image Node
- Generate images from text prompts using **Hugging Face (FLUX.1-schnell)**.
- **Multimodal Flux**: Connect image inputs to use Gemini to describe visual styles and subjects, combining them into a cohesive prompt for high-quality image generation.
- Dynamic preview with aspect-ratio-aware resizing.

#### 📥 Import Node
- Upload local images (PNG, JPEG).
- Base64 encoding for seamless integration with AI models.
- Click to upload interface.

#### 🤖 Run Any LLM Node
- Powered by **Google Gemini 2.5 Flash**.
- **System Prompt Propagation**: Automatically inherits or manually defines behaviors via upstream text connections.
- Supports multimodal interactions (text + multiple images).
- Real-time output streaming and error handling.

### 💾 Workflow Management
- **Persistent Storage**: Save and manage multiple workflows using Prisma and PostgreSQL.
- **Import/Export**: Full JSON-based portability for sharing and backing up workflows.
- **Version History**: Robust undo/redo support (up to 20 steps).
- **Auto-save snapshots**: Keeps your progress safe during editing.

### ⌨️ Keyboard Shortcuts
- `Cmd/Ctrl + Z`: Undo
- `Cmd/Ctrl + Shift + Z` or `Cmd/Ctrl + Y`: Redo
- `Cmd/Ctrl + +`: Zoom In
- `Cmd/Ctrl + -`: Zoom Out
- `Cmd/Ctrl + 0`: Reset Zoom (100%)
- `Cmd/Ctrl + 1`: Fit View
- `Backspace/Delete`: Delete selected nodes

## 🛠️ Tech Stack

### Frontend
- **[Next.js 16](https://nextjs.org/)**: React framework with App Router
- **[React 19](https://react.dev/)**: UI library
- **[React Flow](https://reactflow.dev/)**: Node-based workflow engine
- **[Zustand](https://zustand-demo.pmnd.rs/)**: State management
- **[Tailwind CSS 4](https://tailwindcss.com/)**: Modern utility-first styling
- **[Lucide React](https://lucide.dev/)**: Icon set

### Backend
- **[Prisma 5](https://www.prisma.io/)**: Type-safe ORM
- **[PostgreSQL](https://www.postgresql.org/)**: Relational database
- **[Zod](https://zod.dev/)**: Schema validation

### AI & APIs
- **[Google Gemini AI](https://ai.google.dev/)**: Multi-modal LLM (2.5 Flash)
- **[Hugging Face](https://huggingface.co/)**: Image generation (FLUX.1-schnell)
- **[@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai)**: Official Gemini SDK

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database
- Google Gemini API key
- Hugging Face Token (`HF_TOKEN`)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/weavy-workflow-builder.git
   cd Weavy-workflow-builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/weavy"

   # Google Gemini API
   GEMINI_API_KEY="your-gemini-api-key-here"

   # Hugging Face Token (for Image Generation)
   HF_TOKEN="your-huggingface-token-here"
   ```

4. **Initialize the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
weavy-workflow-builder/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── gemini/run/      # Gemini LLM execution
│   │   │   ├── huggingface/run/ # Flux image generation
│   │   │   └── workflows/       # CRUD for workflows
│   │   ├── layout.tsx
│   │   └── page.tsx             # Main application entry
│   ├── components/
│   │   └── Workflow/
│   │       ├── Canvas.tsx       # Core React Flow implementation
│   │       ├── Sidebar.tsx      # Node palette and persistence UI
│   │       ├── nodes/           # Custom node components
│   │       └── shared/          # Shared UI components (menus, handles)
│   ├── lib/
│   │   ├── prisma.ts            # Client singleton
│   │   └── utils.ts             # Shared utilities
│   └── store/
│       └── workflowStore.ts     # Zustand state and execution logic
├── prisma/
│   └── schema.prisma            # Database schema
└── public/
```

## 🙏 Acknowledgments

- [React Flow](https://reactflow.dev/) for the amazing workflow visualization library.
- [Google Gemini](https://ai.google.dev/) for state-of-the-art AI capabilities.
- [Hugging Face](https://huggingface.co/) for making FLUX.1 models accessible.
- [Vercel](https://vercel.com/) for the Next.js framework.
