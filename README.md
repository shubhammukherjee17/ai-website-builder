# AI Website Builder 🚀

A powerful **AI-powered full-stack website and backend builder** designed for non-technical founders and entrepreneurs. Build, generate, and deploy complete web applications without writing a single line of code!

## ✨ Features

### 🎨 Visual Design Canvas
- **Drag & Drop Interface**: Intuitive component-based design system
- **Real-time Preview**: See your changes instantly as you build
- **Responsive Design**: Automatically adapts to mobile, tablet, and desktop
- **Component Library**: Pre-built UI components (buttons, forms, hero sections, etc.)

### 🤖 AI-Powered Code Generation
- **Smart Code Generation**: Convert visual designs to production-ready React components
- **Backend API Generation**: AI creates database schemas and API endpoints
- **Full-Stack Applications**: Complete Next.js apps with TypeScript support
- **Clean, Maintainable Code**: Professional-quality output you can customize

### 🚀 One-Click Deployment
- **Vercel Integration**: Deploy directly to Vercel with one click
- **Automatic Setup**: Complete project structure and dependencies
- **Environment Management**: Secure configuration and secrets handling
- **Live URLs**: Get your website online in minutes

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **DND Kit** - Beautiful drag and drop interactions
- **Lucide React** - Modern icon library

### Backend & Database
- **Supabase** - PostgreSQL database with real-time subscriptions
- **Row Level Security** - Secure, user-based data access
- **Authentication** - Built-in user management
- **API Routes** - Next.js serverless functions

### AI & Deployment
- **OpenAI/Claude** - AI code generation (configurable)
- **Vercel API** - Automated deployment pipeline
- **Monaco Editor** - Code editing capabilities
- **Syntax Highlighting** - Beautiful code preview

## 📋 Prerequisites

Before you begin, ensure you have:
- **Node.js 18+** installed
- **npm or yarn** package manager
- **Supabase account** (free tier available)
- **Vercel account** (optional, for deployment)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd ai-website-builder
npm install
```

### 2. Environment Setup

Copy the environment template:
```bash
cp .env.example .env.local
```

Configure your environment variables:
```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Configuration (Optional - for AI features)
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# Deployment Configuration (Optional - for one-click deploy)
VERCEL_API_KEY=your_vercel_api_key
VERCEL_TEAM_ID=your_team_id

# NextAuth Configuration
NEXTAUTH_SECRET=your_random_secret_key
NEXTAUTH_URL=http://localhost:3000
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the database schema:
   ```bash
   # Copy the contents of supabase/schema.sql
   # Paste into Supabase SQL Editor and run
   ```

### 4. Start Development

```bash
npm run dev
```

Visit `http://localhost:3000` and start building! 🎉

## 📖 How to Use

### 1. Create a New Project
- Visit the dashboard at `/dashboard`
- Click "New Project" to start building
- Give your project a name and description

### 2. Design Your Website
- **Drag components** from the left palette to the canvas
- **Customize properties** using the right panel
- **Preview your design** with the preview button
- **Adjust for different devices** with responsive controls

### 3. Generate Code
- Click "Generate Code" to convert your design to React
- **View the generated code** in the modal
- **Copy or download** the code for your project
- **See dependencies** and setup instructions

### 4. Deploy Your Website
- Click "Deploy" to publish your site
- **Automatic Vercel deployment** creates a live URL
- **Monitor deployment status** in real-time
- **Share your live website** with the world

## 🏗 Project Structure

```
ai-website-builder/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/            # API endpoints
│   │   ├── dashboard/      # Project management
│   │   └── editor/         # Visual editor
│   ├── components/         # React components
│   │   ├── editor/         # Drag & drop components
│   │   └── modals/         # Modal components
│   ├── lib/               # Utility libraries
│   │   ├── ai/            # AI code generation
│   │   ├── deployment/    # Deployment services
│   │   └── supabase/      # Database client
│   └── types/             # TypeScript definitions
├── supabase/              # Database schema
└── public/                # Static assets
```

## 🎯 Key Features Implemented

✅ **Visual Editor**: Complete drag-and-drop interface  
✅ **AI Code Generation**: Template-based React code generation  
✅ **Component Library**: 13 pre-built UI components  
✅ **Property Panel**: Real-time component customization  
✅ **Preview Mode**: Toggle between edit and preview  
✅ **Responsive Design**: Mobile, tablet, desktop views  
✅ **Code Preview**: Syntax highlighted generated code  
✅ **Database Schema**: Complete Supabase setup  
✅ **Deployment Ready**: Vercel integration framework  

## 🚦 Development Roadmap

- [x] ✅ Visual drag & drop editor
- [x] ✅ AI code generation system  
- [x] ✅ Vercel deployment integration
- [x] ✅ Component property panel
- [x] ✅ Real-time preview mode
- [ ] 🔄 AI chat assistant
- [ ] 📱 Authentication system
- [ ] 🎨 Template marketplace
- [ ] 🔗 Database visual designer
- [ ] 📊 Analytics integration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

---

**Ready to build your dream website?** Start the development server and visit `http://localhost:3000`! 🚀
