'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Loader2, Globe, Copy, ExternalLink, Download } from 'lucide-react';
import { downloadAsZip, generateReadme, type ProjectExportData } from '@/lib/export/zipExport';

interface DeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
}

type DeploymentStep = 'idle' | 'generating' | 'deploying' | 'success' | 'error';

interface DeploymentStatus {
  step: DeploymentStep;
  message: string;
  url?: string;
  deploymentId?: string;
}

export default function DeploymentModal({ isOpen, onClose, projectId, projectTitle }: DeploymentModalProps) {
  const [status, setStatus] = useState<DeploymentStatus>({ step: 'idle', message: '' });
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStatus({ step: 'idle', message: '' });
      setCopied(false);
    }
  }, [isOpen]);

  const startDeployment = async () => {
    try {
      setStatus({ step: 'generating', message: 'Generating code and preparing deployment...' });

      // First generate the code
      const generateResponse = await fetch('/api/generate/code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          options: {
            framework: 'react',
            includeStyles: true,
            responsive: true,
            exportFormat: 'nextjs'
          }
        }),
      });

      if (!generateResponse.ok) {
        throw new Error('Failed to generate code');
      }

      const generateResult = await generateResponse.json();
      
      if (!generateResult.success) {
        throw new Error(generateResult.error || 'Code generation failed');
      }

      setStatus({ step: 'deploying', message: 'Deploying to Vercel...' });

      // Then deploy the project
      const deployResponse = await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
      });

      if (!deployResponse.ok) {
        const errorData = await deployResponse.json();
        throw new Error(errorData.error || 'Deployment failed');
      }

      const deployResult = await deployResponse.json();

      if (deployResult.success) {
        setStatus({
          step: 'success',
          message: 'Website deployed successfully!',
          url: deployResult.data.url,
          deploymentId: deployResult.data.deploymentId
        });
      } else {
        throw new Error(deployResult.error || 'Deployment failed');
      }

    } catch (error) {
      console.error('Deployment error:', error);
      setStatus({
        step: 'error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleExportCode = async () => {
    try {
      setIsExporting(true);
      
      // Generate code first
      const generateResponse = await fetch('/api/generate/code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          options: {
            framework: 'react',
            includeStyles: true,
            responsive: true,
            exportFormat: 'nextjs'
          }
        }),
      });

      if (!generateResponse.ok) {
        throw new Error('Failed to generate code for export');
      }

      const generateResult = await generateResponse.json();
      
      if (!generateResult.success) {
        throw new Error(generateResult.error || 'Code generation failed');
      }

      // Create deployment files (same as deployment service)
      const files: Record<string, string> = {};

      // package.json
      files['package.json'] = JSON.stringify({
        name: projectTitle.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
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
          tailwindcss: '^3.0.0',
          autoprefixer: '^10.0.0',
          postcss: '^8.0.0',
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

      // postcss.config.js
      files['postcss.config.js'] = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
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
      files['src/app/page.tsx'] = generateResult.data.code || '// Generated code will appear here';

      // Layout
      files['src/app/layout.tsx'] = `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '${projectTitle}',
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

      // README
      files['README.md'] = generateReadme(projectTitle);

      const exportData: ProjectExportData = {
        projectName: projectTitle,
        files,
      };

      downloadAsZip(exportData);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export project: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    if (status.step === 'generating' || status.step === 'deploying') {
      // Don't allow closing during deployment
      return;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Deploy Website</h3>
          <button
            onClick={handleClose}
            disabled={status.step === 'generating' || status.step === 'deploying'}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-2">{projectTitle}</h4>
            <p className="text-sm text-gray-600">
              Deploy your website to Vercel for global hosting and automatic HTTPS.
            </p>
          </div>

          {/* Status */}
          <div className="space-y-4">
            {status.step === 'idle' && (
              <div className="text-center">
                <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-6">Ready to deploy your website?</p>
                <div className="space-y-3">
                  <button
                    onClick={startDeployment}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Start Deployment
                  </button>
                  <button
                    onClick={handleExportCode}
                    disabled={isExporting}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isExporting ? 'Exporting...' : 'Export Code'}</span>
                  </button>
                  <p className="text-xs text-gray-500">Export code to download and host it yourself</p>
                </div>
              </div>
            )}

            {(status.step === 'generating' || status.step === 'deploying') && (
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
                <p className="text-gray-700 font-medium mb-2">{status.message}</p>
                <p className="text-sm text-gray-500">This may take a few moments...</p>
              </div>
            )}

            {status.step === 'success' && (
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <p className="text-gray-700 font-medium mb-4">{status.message}</p>
                
                {status.url && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-600 mb-1">Your website is live at:</p>
                        <p className="text-sm font-mono text-gray-900 truncate">{status.url}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(status.url!)}
                        className="ml-2 p-2 text-gray-500 hover:text-gray-700"
                        title="Copy URL"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    {copied && (
                      <p className="text-xs text-green-600 mt-1">Copied to clipboard!</p>
                    )}
                  </div>
                )}

                <div className="flex space-x-3">
                  {status.url && (
                    <a
                      href={status.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium text-center flex items-center justify-center space-x-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Visit Website</span>
                    </a>
                  )}
                  <button
                    onClick={handleClose}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {status.step === 'error' && (
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <p className="text-red-700 font-medium mb-2">Deployment Failed</p>
                <p className="text-sm text-gray-600 mb-6">{status.message}</p>
                
                <div className="flex space-x-3">
                  <button
                    onClick={startDeployment}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
