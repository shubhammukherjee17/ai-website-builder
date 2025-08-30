import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { VercelDeploymentService, MockDeploymentService } from '@/lib/deployment/vercel';
import { AICodeGenerator } from '@/lib/ai/codeGenerator';

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

  const supabase = await createClient();
  
  try {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId } = body;

    // Validate input
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Get project data
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check if project has generated code
    if (!project.generated_code) {
      return NextResponse.json({ 
        error: 'Please generate code for your project before deploying' 
      }, { status: 400 });
    }

    // Update project status to building
    await supabase
      .from('projects')
      .update({ status: 'building' })
      .eq('id', projectId);

    // Initialize deployment service
    const deploymentService = process.env.VERCEL_API_KEY 
      ? new VercelDeploymentService(process.env.VERCEL_API_KEY, process.env.VERCEL_TEAM_ID)
      : new MockDeploymentService();

    // Generate deployment files
    const files = await deploymentService.generateDeploymentFiles(
      project.generated_code,
      project.title
    );

    // Deploy to Vercel
    const deployment = await deploymentService.deployProject({
      projectName: project.title,
      files,
      framework: 'nextjs',
      env: {
        // Add any environment variables needed for the generated app
      }
    });

    // Save deployment record
    const { data: deploymentRecord, error: deploymentError } = await supabase
      .from('deployments')
      .insert({
        project_id: projectId,
        user_id: user.id,
        deployment_platform: 'vercel',
        deployment_url: `https://${deployment.url}`,
        status: deployment.status === 'READY' ? 'success' : 'building',
        build_logs: JSON.stringify(deployment)
      })
      .select()
      .single();

    if (deploymentError) {
      console.error('Failed to save deployment record:', deploymentError);
    }

    // Update project with deployment info
    await supabase
      .from('projects')
      .update({
        status: deployment.status === 'READY' ? 'deployed' : 'building',
        deployment_url: `https://${deployment.url}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

    return NextResponse.json({
      success: true,
      data: {
        deploymentId: deployment.id,
        url: `https://${deployment.url}`,
        status: deployment.status,
        deploymentRecordId: deploymentRecord?.id
      }
    });

  } catch (error) {
    console.error('Deployment failed:', error);

    // Update project status to failed if we have the projectId
    const body = await request.clone().json().catch(() => ({}));
    if (body.projectId) {
      await supabase
        .from('projects')
        .update({ status: 'failed' })
        .eq('id', body.projectId);
    }

    return NextResponse.json(
      { error: 'Deployment failed. Please try again.' },
      { status: 500 }
    );
  }
}

// Check deployment status
export async function GET(request: NextRequest) {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase not configured' },
      { status: 400 }
    );
  }

      const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const deploymentId = searchParams.get('deploymentId');

  if (!deploymentId) {
    return NextResponse.json({ error: 'Deployment ID is required' }, { status: 400 });
  }

  try {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get deployment record from database
    const { data: deploymentRecord, error: recordError } = await supabase
      .from('deployments')
      .select('*')
      .eq('id', deploymentId)
      .eq('user_id', user.id)
      .single();

    if (recordError || !deploymentRecord) {
      return NextResponse.json({ error: 'Deployment not found' }, { status: 404 });
    }

    // If deployment is still building, check status with Vercel
    if (deploymentRecord.status === 'building' || deploymentRecord.status === 'pending') {
      const deploymentService = process.env.VERCEL_API_KEY 
        ? new VercelDeploymentService(process.env.VERCEL_API_KEY, process.env.VERCEL_TEAM_ID)
        : new MockDeploymentService();

      try {
        const logs = JSON.parse(deploymentRecord.build_logs || '{}');
        const vercelDeploymentId = logs.id;

        if (vercelDeploymentId) {
          const status = await deploymentService.getDeploymentStatus(vercelDeploymentId);
          
          // Update deployment record if status changed
          if (status.status !== deploymentRecord.status) {
            await supabase
              .from('deployments')
              .update({
                status: status.status === 'READY' ? 'success' : 
                       status.status === 'ERROR' ? 'failed' : 'building'
              })
              .eq('id', deploymentId);

            // Also update project status
            await supabase
              .from('projects')
              .update({
                status: status.status === 'READY' ? 'deployed' : 
                       status.status === 'ERROR' ? 'failed' : 'building'
              })
              .eq('id', deploymentRecord.project_id);
          }

          return NextResponse.json({
            success: true,
            data: {
              id: deploymentRecord.id,
              status: status.status === 'READY' ? 'success' : 
                     status.status === 'ERROR' ? 'failed' : 'building',
              url: deploymentRecord.deployment_url,
              createdAt: deploymentRecord.created_at
            }
          });
        }
      } catch (statusError) {
        console.error('Failed to check deployment status:', statusError);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: deploymentRecord.id,
        status: deploymentRecord.status,
        url: deploymentRecord.deployment_url,
        createdAt: deploymentRecord.created_at
      }
    });

  } catch (error) {
    console.error('Failed to get deployment status:', error);
    return NextResponse.json(
      { error: 'Failed to get deployment status' },
      { status: 500 }
    );
  }
}
