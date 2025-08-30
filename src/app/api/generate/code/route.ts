import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AICodeGenerator } from '@/lib/ai/codeGenerator';
import { CanvasElement } from '@/types';

// Helper function to check if Supabase is configured
function isSupabaseConfigured() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return supabaseUrl && supabaseAnonKey && 
         supabaseUrl !== 'your_supabase_url_here' && 
         supabaseAnonKey !== 'your_supabase_anon_key_here'
}

export async function POST(request: NextRequest) {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase not configured' },
      { status: 400 }
    );
  }

  const supabase = createClient();
  
  try {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, elements, options } = body;

    // Validate input
    if (!projectId || !elements || !Array.isArray(elements)) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    // Verify user owns the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, user_id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Initialize code generator
    const generator = new AICodeGenerator(process.env.OPENAI_API_KEY);

    // Generate code
    const generatedCode = await generator.generateReactComponent(
      elements as CanvasElement[],
      options || {
        framework: 'react',
        includeStyles: true,
        responsive: true,
        exportFormat: 'component'
      }
    );

    // Save AI generation record
    const { data: aiGeneration, error: aiError } = await supabase
      .from('ai_generations')
      .insert({
        project_id: projectId,
        user_id: user.id,
        prompt: `Generate React component from ${elements.length} elements`,
        generation_type: 'frontend',
        input_data: { elements, options },
        output_data: generatedCode,
        generated_code: generatedCode.code,
        status: 'completed'
      })
      .select()
      .single();

    if (aiError) {
      console.error('Failed to save AI generation:', aiError);
      // Don't fail the request if we can't save the record
    }

    // Update project with generated code
    const { error: updateError } = await supabase
      .from('projects')
      .update({ 
        generated_code: generatedCode.code,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

    if (updateError) {
      console.error('Failed to update project:', updateError);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...generatedCode,
        generationId: aiGeneration?.id
      }
    });

  } catch (error) {
    console.error('Code generation failed:', error);
    return NextResponse.json(
      { error: 'Code generation failed' },
      { status: 500 }
    );
  }
}

// Generate backend API code
export async function PUT(request: NextRequest) {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase not configured' },
      { status: 400 }
    );
  }

  const supabase = createClient();
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, description, databaseSchema } = body;

    if (!projectId || !description) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    // Verify user owns the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, user_id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Initialize code generator
    const generator = new AICodeGenerator(process.env.OPENAI_API_KEY);

    // Generate backend API code
    const generatedCode = await generator.generateBackendAPI(description, databaseSchema);

    // Save AI generation record
    const { data: aiGeneration, error: aiError } = await supabase
      .from('ai_generations')
      .insert({
        project_id: projectId,
        user_id: user.id,
        prompt: description,
        generation_type: 'backend',
        input_data: { description, databaseSchema },
        output_data: generatedCode,
        generated_code: generatedCode.code,
        status: 'completed'
      })
      .select()
      .single();

    if (aiError) {
      console.error('Failed to save AI generation:', aiError);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...generatedCode,
        generationId: aiGeneration?.id
      }
    });

  } catch (error) {
    console.error('Backend generation failed:', error);
    return NextResponse.json(
      { error: 'Backend generation failed' },
      { status: 500 }
    );
  }
}
