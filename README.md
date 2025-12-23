# 🌊 Weavy Workflow Builder

A powerful visual workflow builder for creating AI-powered automation pipelines with Google's Gemini AI. Build complex workflows by connecting nodes for text processing, image generation, and LLM interactions through an intuitive drag-and-drop interface.

![Workflow Builder](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![React Flow](https://img.shields.io/badge/React_Flow-11-purple?style=for-the-badge)
![Prisma](https://img.shields.io/badge/Prisma-ORM-teal?style=for-the-badge&logo=prisma)

## ✨ Features

### 🎨 Visual Workflow Design
- **Drag-and-Drop Interface**: Intuitive node-based workflow creation
- **Real-time Canvas**: Pan, zoom (1%-300%), and navigate your workflows with ease
- **Smart Connections**: Color-coded edges for different data types (purple for text, teal for images)
- **Dynamic Node Sizing**: Image nodes automatically resize to fit content

### 🧩 Node Types

#### 📝 Text Node
- Input text prompts and instructions
- Multi-line text editing
- Connect to multiple downstream nodes

#### 🖼️ Image Node
- Generate images from text prompts using Pollinations AI
- Image-to-image generation via Gemini vision
- Dynamic preview with aspect-ratio-aware resizing
- Support for multiple image inputs

#### 📤 Upload Node
- Upload local images (max 5MB)
- Base64 encoding for seamless integration
- Drag-and-drop or click to upload

#### 🤖 LLM Node (Run Any LLM)
- Powered by Google Gemini AI (2.5 Flash & Pro models)
- **System Prompt Support**: Define AI behavior with dedicated system prompt input
- **System Prompt Propagation**: Automatically inherits system prompts from upstream nodes
- Multiple image inputs for multimodal AI interactions
- Real-time response streaming
- Error handling with quota management

### 💾 Workflow Management
- **Persistent Storage**: Save workflows to PostgreSQL database
- **Import/Export**: JSON-based workflow portability
- **Auto-save**: Automatic workflow persistence
- **Version History**: Undo/Redo support (up to 20 steps)

### ⌨️ Keyboard Shortcuts
- `Cmd/Ctrl + Z`: Undo
- `Cmd/Ctrl + Shift + Z` or `Cmd/Ctrl + Y`: Redo
- `Cmd/Ctrl + +`: Zoom In
- `Cmd/Ctrl + -`: Zoom Out
- `Cmd/Ctrl + 0`: Reset Zoom
- `Cmd/Ctrl + 1`: Fit View
- `Backspace/Delete`: Delete selected nodes

## 🛠️ Tech Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)**: React framework with App Router
- **[React 19](https://react.dev/)**: UI library
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe development
- **[React Flow](https://reactflow.dev/)**: Node-based workflow visualization
- **[Zustand](https://zustand-demo.pmnd.rs/)**: Lightweight state management
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first styling
- **[Lucide React](https://lucide.dev/)**: Beautiful icon library

### Backend
- **[Prisma](https://www.prisma.io/)**: Next-generation ORM
- **[PostgreSQL](https://www.postgresql.org/)**: Relational database
- **[Zod](https://zod.dev/)**: TypeScript-first schema validation

### AI & APIs
- **[Google Gemini AI](https://ai.google.dev/)**: Advanced LLM capabilities
- **[Pollinations AI](https://pollinations.ai/)**: Free image generation
- **[@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai)**: Official Gemini SDK

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/weavy-workflow-builder.git
   cd weavy-workflow-builder
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

## 📖 Usage

### Creating Your First Workflow

1. **Add Nodes**: Drag nodes from the sidebar onto the canvas
2. **Connect Nodes**: Click and drag from output handles to input handles
3. **Configure**: Click nodes to edit their content and settings
4. **Run**: Click "Run Model" on any node to execute the workflow
5. **Save**: Your workflow auto-saves to the database

### Example Workflows

#### Text Generation
```
Text Node (prompt) → LLM Node → Output
```

#### Image Generation
```
Text Node (description) → Image Node → Generated Image
```

#### Multimodal AI
```
Upload Node (image) → LLM Node ← Text Node (question)
                         ↓
                      Response
```

#### System Prompt Propagation
```
Text Node (system prompt) → LLM Node 1 → LLM Node 2
                              ↓            ↓
                         (inherits)   (inherits)
```

## 🏗️ Project Structure

```
weavy-workflow-builder/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── gemini/run/      # Gemini AI endpoint
│   │   │   └── workflows/       # Workflow CRUD
│   │   ├── page.tsx             # Main application
│   │   └── layout.tsx
│   ├── components/
│   │   └── Workflow/
│   │       ├── Canvas.tsx       # Main workflow canvas
│   │       ├── Sidebar.tsx      # Node palette
│   │       └── nodes/           # Node components
│   ├── store/
│   │   └── workflowStore.ts     # Zustand state management
│   └── lib/
│       ├── prisma.ts            # Database client
│       └── utils.ts
├── prisma/
│   └── schema.prisma            # Database schema
└── public/
```

## 🔒 API Validation

All API endpoints use **Zod schemas** for request validation:
- Type-safe request/response handling
- Automatic validation error messages
- Detailed error reporting for debugging

## 🎨 Design Philosophy

- **Premium Aesthetics**: Modern, vibrant UI with smooth animations
- **User-Centric**: Intuitive interactions and clear visual feedback
- **Performance**: Optimized rendering and state management
- **Accessibility**: Keyboard shortcuts and clear visual indicators

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [React Flow](https://reactflow.dev/) for the amazing workflow visualization library
- [Google Gemini](https://ai.google.dev/) for powerful AI capabilities
- [Pollinations AI](https://pollinations.ai/) for free image generation
- [Vercel](https://vercel.com/) for Next.js and hosting platform

---

**Built with ❤️ using Next.js and Google Gemini AI**
