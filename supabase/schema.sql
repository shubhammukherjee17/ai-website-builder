-- Create custom types
CREATE TYPE component_type AS ENUM (
  'text',
  'image',
  'button',
  'input',
  'form',
  'container',
  'header',
  'footer',
  'navbar',
  'hero',
  'card',
  'grid',
  'flex'
);

CREATE TYPE project_status AS ENUM (
  'draft',
  'building',
  'deployed',
  'failed'
);

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status project_status DEFAULT 'draft',
  canvas_data JSONB DEFAULT '{}', -- Store canvas/design data
  generated_code TEXT, -- Generated frontend code
  backend_config JSONB DEFAULT '{}', -- Backend configuration
  deployment_url TEXT,
  preview_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Components library table
CREATE TABLE public.components (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type component_type NOT NULL,
  props JSONB DEFAULT '{}',
  styles JSONB DEFAULT '{}',
  code TEXT NOT NULL, -- Component code (React/HTML)
  preview_image TEXT, -- Preview image URL
  is_public BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project components (many-to-many relationship)
CREATE TABLE public.project_components (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  component_id UUID REFERENCES public.components(id) ON DELETE CASCADE NOT NULL,
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  width INTEGER DEFAULT 100,
  height INTEGER DEFAULT 100,
  z_index INTEGER DEFAULT 1,
  custom_props JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI generations history
CREATE TABLE public.ai_generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  prompt TEXT NOT NULL,
  generation_type TEXT NOT NULL, -- 'frontend', 'backend', 'component', 'full_stack'
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  generated_code TEXT,
  status TEXT DEFAULT 'processing', -- 'processing', 'completed', 'failed'
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Database schemas for generated projects
CREATE TABLE public.generated_schemas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  schema_name TEXT NOT NULL,
  table_definitions JSONB NOT NULL, -- Store table schemas
  relationships JSONB DEFAULT '{}', -- Store relationships between tables
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project deployments
CREATE TABLE public.deployments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  deployment_platform TEXT DEFAULT 'vercel', -- 'vercel', 'netlify', 'custom'
  deployment_url TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'building', 'success', 'failed'
  build_logs TEXT,
  environment_variables JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_components_user_id ON public.components(user_id);
CREATE INDEX idx_components_type ON public.components(type);
CREATE INDEX idx_project_components_project_id ON public.project_components(project_id);
CREATE INDEX idx_ai_generations_project_id ON public.ai_generations(project_id);
CREATE INDEX idx_ai_generations_user_id ON public.ai_generations(user_id);
CREATE INDEX idx_deployments_project_id ON public.deployments(project_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_schemas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- Components policies
CREATE POLICY "Users can view own and public components" ON public.components
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own components" ON public.components
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own components" ON public.components
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own components" ON public.components
  FOR DELETE USING (auth.uid() = user_id);

-- Project components policies
CREATE POLICY "Users can manage project components" ON public.project_components
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_components.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- AI generations policies
CREATE POLICY "Users can view own AI generations" ON public.ai_generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI generations" ON public.ai_generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Generated schemas policies
CREATE POLICY "Users can manage project schemas" ON public.generated_schemas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = generated_schemas.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Deployments policies
CREATE POLICY "Users can view own deployments" ON public.deployments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own deployments" ON public.deployments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deployments" ON public.deployments
  FOR UPDATE USING (auth.uid() = user_id);

-- Create functions
-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.components
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.generated_schemas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.deployments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
