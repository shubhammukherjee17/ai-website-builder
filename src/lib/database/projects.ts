import { createClient } from '@/lib/supabase/client';
import { createClient as createServerClient } from '@/lib/supabase/server';

export interface Project {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'building' | 'deployed' | 'failed';
  user_id: string;
  elements?: any[];
  created_at: string;
  updated_at: string;
  deployment_url?: string;
  preview_url?: string;
  metadata?: any;
}

export interface CreateProjectData {
  title: string;
  description?: string;
  elements?: any[];
  metadata?: any;
}

export interface UpdateProjectData {
  title?: string;
  description?: string;
  status?: 'draft' | 'building' | 'deployed' | 'failed';
  elements?: any[];
  deployment_url?: string;
  preview_url?: string;
  metadata?: any;
}

// Client-side database operations
export class ProjectsClient {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  async getAllProjects(): Promise<Project[]> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  }

  async getProject(id: string): Promise<Project | null> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching project:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching project:', error);
      return null;
    }
  }

  async createProject(projectData: CreateProjectData): Promise<Project | null> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        return null;
      }

      const { data, error } = await this.supabase
        .from('projects')
        .insert({
          ...projectData,
          user_id: user.id,
          status: 'draft',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      return null;
    }
  }

  async updateProject(id: string, updates: UpdateProjectData): Promise<Project | null> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating project:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating project:', error);
      return null;
    }
  }

  async deleteProject(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting project:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  }

  async saveProjectElements(id: string, elements: any[]): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('projects')
        .update({
          elements,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error('Error saving project elements:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error saving project elements:', error);
      return false;
    }
  }

  // Subscribe to project changes
  subscribeToProjects(callback: (projects: Project[]) => void) {
    const channel = this.supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        () => {
          // Refetch projects when changes occur
          this.getAllProjects().then(callback);
        }
      )
      .subscribe();

    return () => {
      this.supabase.removeChannel(channel);
    };
  }
}

// Server-side database operations
export class ProjectsServer {
  private supabase;

  constructor() {
    this.supabase = createServerClient();
  }

  async getAllProjects(): Promise<Project[]> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  }

  async getProject(id: string): Promise<Project | null> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching project:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching project:', error);
      return null;
    }
  }

  async createProject(projectData: CreateProjectData, userId: string): Promise<Project | null> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .insert({
          ...projectData,
          user_id: userId,
          status: 'draft',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      return null;
    }
  }
}

// Export singleton instances
export const projectsClient = new ProjectsClient();
export const projectsServer = new ProjectsServer();
