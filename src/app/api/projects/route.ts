import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { projectsServer } from '@/lib/database/projects';

// Helper function to check if Supabase is configured
function isSupabaseConfigured() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return supabaseUrl && supabaseAnonKey && 
         supabaseUrl !== 'your_supabase_url_here' && 
         supabaseAnonKey !== 'your_supabase_anon_key_here'
}

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Supabase not configured', data: [] },
        { status: 200 } // Return 200 so client can handle gracefully
      );
    }

    const supabase = createClient();
    
    // Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all projects for the authenticated user
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: projects || []
    });

  } catch (error) {
    console.error('Error in projects GET:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Supabase not configured' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    
    // Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, elements, metadata } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    // Create new project
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        title,
        description: description || '',
        elements: elements || [],
        metadata: metadata || {},
        user_id: user.id,
        status: 'draft'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create project' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: project
    });

  } catch (error) {
    console.error('Error in projects POST:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
