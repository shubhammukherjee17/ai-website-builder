# Setup Guide - AI Website Builder

This guide will help you get the AI Website Builder up and running on your local machine.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] npm or yarn package manager
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

## Step-by-Step Setup

### 1. Project Installation

The project has already been created and dependencies installed. Your project structure should look like this:

```
ai-website-builder/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   ├── lib/                # Utilities and services
│   └── types/              # TypeScript definitions
├── supabase/               # Database schema
├── .env.local              # Environment variables
└── package.json            # Dependencies
```

### 2. Environment Configuration

#### 2.1 Supabase Setup (Required for full functionality)

1. **Create a Supabase project**:
   - Go to [supabase.com](https://supabase.com)
   - Click "Start your project"
   - Create a new organization and project

2. **Get your API keys**:
   - Go to Project Settings > API
   - Copy the Project URL and anon public key

3. **Set up the database**:
   - Go to SQL Editor in your Supabase dashboard
   - Copy the contents of `supabase/schema.sql`
   - Paste and run the SQL commands

4. **Update .env.local**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

#### 2.2 AI Configuration (Optional)

For AI code generation features:

```env
# Choose one or both
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-your-claude-key
```

#### 2.3 Deployment Configuration (Optional)

For one-click Vercel deployment:

```env
VERCEL_API_KEY=your_vercel_token
VERCEL_TEAM_ID=your_team_id  # Optional
```

### 3. Enable Middleware (After Supabase Setup)

Once you have Supabase configured, enable the authentication middleware:

1. Open `src/middleware.ts`
2. Uncomment the matcher pattern:
   ```typescript
   export const config = {
     matcher: [
       '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
     ],
   }
   ```

### 4. Start the Development Server

```bash
npm run dev
```

The application will start on `http://localhost:3000`

## Testing the Application

### Without Supabase (Basic Testing)
- Navigate to `/dashboard` to see the project management interface
- Go to `/editor/test-project` to test the visual editor
- Drag and drop components from the left panel
- Use the property panel to customize components
- Test the preview mode and responsive views

### With Supabase (Full Functionality)
- Create user accounts and authentication
- Save and load projects from the database
- Generate and store AI-generated code
- Track deployment history

### With AI APIs (Advanced Features)
- Generate React code from visual designs
- Create backend API routes
- Get AI assistance with chat interface

### With Vercel API (Deployment)
- One-click deployment to live URLs
- Automatic project structure generation
- Environment variable management

## Feature Overview

### ✅ Currently Working

1. **Visual Editor**
   - Drag and drop 13 different UI components
   - Real-time property editing
   - Preview mode with responsive breakpoints
   - Canvas with grid overlay and selection controls

2. **Code Generation**
   - Template-based React component generation
   - Syntax highlighting and code preview
   - Export functionality with dependencies
   - Backend API template generation

3. **Project Management**
   - Dashboard with project listing
   - Project status tracking
   - Quick action shortcuts

4. **AI Chat Assistant**
   - Contextual help and guidance
   - Intent recognition and suggestions
   - Quick prompt buttons

### 🔄 Requires Configuration

1. **Database Operations** (needs Supabase)
   - User authentication
   - Project persistence
   - Component library storage

2. **AI Code Generation** (needs AI API keys)
   - Advanced code generation
   - Natural language processing
   - Smart component suggestions

3. **Deployment** (needs Vercel API)
   - Live website deployment
   - Automatic project setup
   - Environment management

## Troubleshooting

### Common Issues

**Error: "Invalid URL" in middleware**
- Supabase environment variables are not set
- Temporarily disable middleware matcher (already done)
- Set up Supabase configuration

**Components not dragging**
- Ensure `@dnd-kit` packages are installed
- Check browser console for JavaScript errors
- Refresh the page

**Code generation not working**
- Check if API routes are accessible
- Verify API key configuration
- Check browser network tab for errors

**Deployment failing**
- Ensure Vercel API key is valid
- Check project has generated code
- Verify network connectivity

### Getting Help

1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed: `npm install`
4. Try restarting the development server: `npm run dev`

## Next Steps

Once you have the basic setup working:

1. **Configure Supabase** for full database functionality
2. **Add AI API keys** for advanced code generation
3. **Set up Vercel integration** for deployment
4. **Customize components** to match your needs
5. **Extend the AI prompts** for better code generation

## Development Tips

- Use the browser dev tools to inspect generated code
- Test responsive design with device simulation
- Save frequently when working on complex designs
- Use the AI assistant for guidance and help

---

Happy building! 🚀 Your AI-powered website builder is ready to create amazing web applications!
