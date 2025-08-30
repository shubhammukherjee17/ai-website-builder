interface VercelDeploymentConfig {
  projectName: string;
  files: Record<string, string>;
  env?: Record<string, string>;
  framework?: string;
}

interface VercelDeployment {
  id: string;
  url: string;
  status: 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED';
  createdAt: number;
}

export class VercelDeploymentService {
  private apiKey: string;
  private teamId?: string;

  constructor(apiKey: string, teamId?: string) {
    this.apiKey = apiKey;
    this.teamId = teamId;
  }

  async deployProject(config: VercelDeploymentConfig): Promise<VercelDeployment> {
    try {
      // Create deployment payload
      const payload = {
        name: config.projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        files: Object.entries(config.files).map(([path, content]) => ({
          file: path,
          data: Buffer.from(content).toString('base64'),
          encoding: 'base64'
        })),
        projectSettings: {
          framework: config.framework || 'nextjs',
        },
        env: config.env ? Object.entries(config.env).map(([key, value]) => ({
          key,
          value,
          type: 'encrypted'
        })) : [],
      };

      const response = await fetch('https://api.vercel.com/v13/deployments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...(this.teamId && { 'Vercel-Team-Id': this.teamId }),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Deployment failed: ${error.message || response.statusText}`);
      }

      const deployment = await response.json();
      return {
        id: deployment.id,
        url: deployment.url,
        status: deployment.readyState,
        createdAt: deployment.createdAt,
      };

    } catch (error) {
      console.error('Vercel deployment error:', error);
      throw error;
    }
  }

  async getDeploymentStatus(deploymentId: string): Promise<VercelDeployment> {
    try {
      const response = await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          ...(this.teamId && { 'Vercel-Team-Id': this.teamId }),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get deployment status: ${response.statusText}`);
      }

      const deployment = await response.json();
      return {
        id: deployment.id,
        url: deployment.url,
        status: deployment.readyState,
        createdAt: deployment.createdAt,
      };

    } catch (error) {
      console.error('Failed to get deployment status:', error);
      throw error;
    }
  }

  async generateDeploymentFiles(generatedCode: string, projectName: string): Promise<Record<string, string>> {
    // Generate complete Next.js project structure
    const files: Record<string, string> = {};

    // package.json
    files['package.json'] = JSON.stringify({
      name: projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      version: '1.0.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint',
      },
      dependencies: {
        next: '^14.0.0',
        react: '^18.0.0',
        'react-dom': '^18.0.0',
        '@types/node': '^20.0.0',
        '@types/react': '^18.0.0',
        '@types/react-dom': '^18.0.0',
        typescript: '^5.0.0',
      },
    }, null, 2);

    // next.config.js
    files['next.config.js'] = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig`;

    // tsconfig.json
    files['tsconfig.json'] = JSON.stringify({
      compilerOptions: {
        target: 'es5',
        lib: ['dom', 'dom.iterable', 'es6'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        incremental: true,
        plugins: [
          {
            name: 'next',
          },
        ],
        paths: {
          '@/*': ['./src/*'],
        },
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules'],
    }, null, 2);

    // tailwind.config.js
    files['tailwind.config.js'] = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;

    // globals.css
    files['src/app/globals.css'] = `@tailwind base;
@tailwind components;
@tailwind utilities;

.responsive {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

.generated-page {
  @apply relative min-h-screen;
}`;

    // Main page
    files['src/app/page.tsx'] = generatedCode;

    // Layout
    files['src/app/layout.tsx'] = `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '${projectName}',
  description: 'Generated by AI Website Builder',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}`;

    return files;
  }
}

// Mock deployment service for development
export class MockDeploymentService {
  async deployProject(config: VercelDeploymentConfig): Promise<VercelDeployment> {
    // Simulate deployment process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const mockId = `mock_${Date.now()}`;
    const mockUrl = `https://${config.projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-')}-${mockId.slice(-8)}.vercel.app`;
    
    return {
      id: mockId,
      url: mockUrl,
      status: 'READY',
      createdAt: Date.now(),
    };
  }

  async getDeploymentStatus(deploymentId: string): Promise<VercelDeployment> {
    return {
      id: deploymentId,
      url: `https://mock-deployment-${deploymentId.slice(-8)}.vercel.app`,
      status: 'READY',
      createdAt: Date.now(),
    };
  }

  async generateDeploymentFiles(generatedCode: string, projectName: string): Promise<Record<string, string>> {
    const service = new VercelDeploymentService('');
    return service.generateDeploymentFiles(generatedCode, projectName);
  }
}
