'use client';

import React, { useState } from 'react';
import { X, Copy, Download, Code, FileText } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  generatedCode: {
    code: string;
    dependencies?: string[];
    instructions?: string;
    type: 'react' | 'html' | 'api' | 'database';
  };
  title?: string;
}

export default function CodePreviewModal({
  isOpen,
  onClose,
  generatedCode,
  title = 'Generated Code'
}: CodePreviewModalProps) {
  const [activeTab, setActiveTab] = useState<'code' | 'dependencies' | 'instructions'>('code');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const downloadCode = () => {
    const extension = generatedCode.type === 'react' ? 'tsx' : 
                    generatedCode.type === 'html' ? 'html' : 
                    generatedCode.type === 'api' ? 'ts' : 'sql';
    
    const filename = `generated-code.${extension}`;
    const blob = new Blob([generatedCode.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLanguage = () => {
    switch (generatedCode.type) {
      case 'react':
        return 'tsx';
      case 'html':
        return 'html';
      case 'api':
        return 'typescript';
      case 'database':
        return 'sql';
      default:
        return 'javascript';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Code className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {title}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => copyToClipboard(generatedCode.code)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={downloadCode}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-4">
              <nav className="flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('code')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'code'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Code
                </button>
                {generatedCode.dependencies && generatedCode.dependencies.length > 0 && (
                  <button
                    onClick={() => setActiveTab('dependencies')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'dependencies'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Dependencies ({generatedCode.dependencies.length})
                  </button>
                )}
                {generatedCode.instructions && (
                  <button
                    onClick={() => setActiveTab('instructions')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'instructions'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Instructions
                  </button>
                )}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 pb-4 sm:px-6">
            {activeTab === 'code' && (
              <div className="relative">
                <SyntaxHighlighter
                  language={getLanguage()}
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    borderRadius: '8px',
                    fontSize: '14px',
                    lineHeight: '1.5',
                  }}
                  showLineNumbers
                  wrapLines
                  lineProps={{
                    style: { wordBreak: 'break-all', whiteSpace: 'pre-wrap' }
                  }}
                >
                  {generatedCode.code}
                </SyntaxHighlighter>
              </div>
            )}

            {activeTab === 'dependencies' && generatedCode.dependencies && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Required Dependencies
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2">
                      {generatedCode.dependencies.map((dep, index) => (
                        <div key={index} className="flex items-center justify-between py-2 px-3 bg-white rounded border">
                          <code className="text-sm font-mono text-gray-800">{dep}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Installation Command
                  </h4>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <code className="text-green-400 text-sm">
                      npm install {generatedCode.dependencies.join(' ')}
                    </code>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'instructions' && generatedCode.instructions && (
              <div className="prose prose-sm max-w-none">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex">
                    <FileText className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800 mb-2">
                        Usage Instructions
                      </h4>
                      <div className="text-sm text-blue-700 whitespace-pre-wrap">
                        {generatedCode.instructions}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
