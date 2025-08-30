import { CanvasElement, GeneratedCode } from '@/types';

interface CodeGenerationOptions {
  framework: 'react' | 'html';
  includeStyles: boolean;
  responsive: boolean;
  exportFormat: 'component' | 'page' | 'full_app';
}

export class AICodeGenerator {
  private apiKey: string;

  constructor(apiKey: string = '') {
    this.apiKey = apiKey;
  }

  async generateReactComponent(elements: CanvasElement[], options: CodeGenerationOptions = {
    framework: 'react',
    includeStyles: true,
    responsive: true,
    exportFormat: 'component'
  }): Promise<GeneratedCode> {
    try {
      // For now, we'll use a template-based approach
      // In production, this would call an AI API like OpenAI or Claude
      const code = this.generateReactCodeFromElements(elements, options);
      
      return {
        type: 'react',
        code,
        dependencies: this.extractDependencies(elements),
        instructions: this.generateInstructions(elements, options),
      };
    } catch (error) {
      console.error('Code generation failed:', error);
      throw error;
    }
  }

  async generateBackendAPI(): Promise<GeneratedCode> {
    // Template for Next.js API routes
    const apiCode = `
// Generated API Route
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  
  try {
    // TODO: Implement your API logic here
    const { data, error } = await supabase
      .from('your_table')
      .select('*');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  
  try {
    const body = await request.json();
    
    // TODO: Validate and process the request body
    const { data, error } = await supabase
      .from('your_table')
      .insert(body)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
`;

    return {
      type: 'api',
      code: apiCode,
      dependencies: ['@supabase/supabase-js'],
      instructions: 'This API route provides basic CRUD operations. Customize the table name and logic based on your needs.',
    };
  }

  private generateReactCodeFromElements(elements: CanvasElement[], options: CodeGenerationOptions): string {
    const imports = `import React from 'react';${options.includeStyles ? "\nimport './styles.css';" : ''}`;
    
    const componentCode = elements.map(element => this.elementToReactCode(element, 0)).join('\n\n');
    
    const component = `
${imports}

export default function GeneratedComponent() {
  return (
    <div className="generated-page${options.responsive ? ' responsive' : ''}">
      ${componentCode}
    </div>
  );
}`;

    return component;
  }

  private elementToReactCode(element: CanvasElement, depth: number): string {
    const indent = '  '.repeat(depth + 2);
    const styleProps = this.stylesToReactProps(element.styles);
    const positionStyle = `left: ${element.position.x}px; top: ${element.position.y}px; width: ${element.size.width}px; height: ${element.size.height}px;`;
    
    switch (element.type) {
      case 'text':
        return `${indent}<div
${indent}  className="${element.props?.className || 'text-gray-900'}"
${indent}  style={{ position: 'absolute', ${positionStyle} ${styleProps} }}
${indent}>
${indent}  ${element.props?.children || element.props?.text || 'Text'}
${indent}</div>`;

      case 'image':
        return `${indent}<img
${indent}  src="${element.props?.src || 'https://via.placeholder.com/300x200'}"
${indent}  alt="${element.props?.alt || 'Image'}"
${indent}  className="${element.props?.className || 'rounded-lg object-cover'}"
${indent}  style={{ position: 'absolute', ${positionStyle} ${styleProps} }}
${indent}/>`;

      case 'button':
        return `${indent}<button
${indent}  className="${element.props?.className || 'px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors'}"
${indent}  style={{ position: 'absolute', ${positionStyle} ${styleProps} }}
${indent}  onClick={() => {
${indent}    // TODO: Add your click handler
${indent}  }}
${indent}>
${indent}  ${element.props?.children || element.props?.text || 'Button'}
${indent}</button>`;

      case 'input':
        return `${indent}<input
${indent}  type="${element.props?.type || 'text'}"
${indent}  placeholder="${element.props?.placeholder || 'Enter text...'}"
${indent}  className="${element.props?.className || 'w-full px-3 py-2 border border-gray-300 rounded-md'}"
${indent}  style={{ position: 'absolute', ${positionStyle} ${styleProps} }}
${indent}/>`;

      case 'container':
        return `${indent}<div
${indent}  className="${element.props?.className || 'p-4 bg-gray-50 border border-gray-200 rounded-lg'}"
${indent}  style={{ position: 'absolute', ${positionStyle} ${styleProps} }}
${indent}>
${indent}  ${element.props?.children || 'Container'}
${indent}</div>`;

      case 'hero':
        return `${indent}<div
${indent}  className="${element.props?.className || 'text-center py-20 bg-gray-50'}"
${indent}  style={{ position: 'absolute', ${positionStyle} ${styleProps} }}
${indent}>
${indent}  <h1 className="text-4xl font-bold text-gray-900 mb-4">
${indent}    ${element.props?.title || 'Hero Title'}
${indent}  </h1>
${indent}  <p className="text-xl text-gray-600">
${indent}    ${element.props?.subtitle || 'Hero subtitle goes here'}
${indent}  </p>
${indent}</div>`;

      case 'card':
        return `${indent}<div
${indent}  className="${element.props?.className || 'p-6 bg-white border border-gray-200 rounded-lg shadow-sm'}"
${indent}  style={{ position: 'absolute', ${positionStyle} ${styleProps} }}
${indent}>
${indent}  <h3 className="text-lg font-semibold text-gray-900 mb-2">
${indent}    ${element.props?.title || 'Card Title'}
${indent}  </h3>
${indent}  <p className="text-gray-600">
${indent}    ${element.props?.content || 'Card content goes here'}
${indent}  </p>
${indent}</div>`;

      case 'header':
        return `${indent}<header
${indent}  className="${element.props?.className || 'w-full py-4 px-6 bg-white border-b border-gray-200'}"
${indent}  style={{ position: 'absolute', ${positionStyle} ${styleProps} }}
${indent}>
${indent}  ${element.props?.children || 'Header'}
${indent}</header>`;

      case 'footer':
        return `${indent}<footer
${indent}  className="${element.props?.className || 'w-full py-8 px-6 bg-gray-900 text-white'}"
${indent}  style={{ position: 'absolute', ${positionStyle} ${styleProps} }}
${indent}>
${indent}  ${element.props?.children || 'Footer'}
${indent}</footer>`;

      case 'navbar':
        return `${indent}<nav
${indent}  className="${element.props?.className || 'w-full py-4 px-6 bg-gray-900 text-white'}"
${indent}  style={{ position: 'absolute', ${positionStyle} ${styleProps} }}
${indent}>
${indent}  ${element.props?.children || 'Navigation Bar'}
${indent}</nav>`;

      case 'form':
        return `${indent}<form
${indent}  className="${element.props?.className || 'space-y-4 p-6 bg-white border border-gray-200 rounded-lg'}"
${indent}  style={{ position: 'absolute', ${positionStyle} ${styleProps} }}
${indent}>
${indent}  <div>
${indent}    <label className="block text-sm font-medium text-gray-700 mb-1">
${indent}      Name
${indent}    </label>
${indent}    <input
${indent}      type="text"
${indent}      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
${indent}    />
${indent}  </div>
${indent}  <div>
${indent}    <label className="block text-sm font-medium text-gray-700 mb-1">
${indent}      Email
${indent}    </label>
${indent}    <input
${indent}      type="email"
${indent}      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
${indent}    />
${indent}  </div>
${indent}  <button
${indent}    type="submit"
${indent}    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
${indent}  >
${indent}    Submit
${indent}  </button>
${indent}</form>`;

      case 'grid':
        return `${indent}<div
${indent}  className="${element.props?.className || 'grid grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg'}"
${indent}  style={{ position: 'absolute', ${positionStyle} ${styleProps} }}
${indent}>
${indent}  <div className="bg-gray-100 p-4 rounded text-center">Grid Item 1</div>
${indent}  <div className="bg-gray-100 p-4 rounded text-center">Grid Item 2</div>
${indent}  <div className="bg-gray-100 p-4 rounded text-center">Grid Item 3</div>
${indent}  <div className="bg-gray-100 p-4 rounded text-center">Grid Item 4</div>
${indent}</div>`;

      case 'flex':
        return `${indent}<div
${indent}  className="${element.props?.className || 'flex items-center justify-center p-4 border border-gray-200 rounded-lg space-x-4'}"
${indent}  style={{ position: 'absolute', ${positionStyle} ${styleProps} }}
${indent}>
${indent}  <div className="bg-gray-100 p-4 rounded">Flex Item 1</div>
${indent}  <div className="bg-gray-100 p-4 rounded">Flex Item 2</div>
${indent}  <div className="bg-gray-100 p-4 rounded">Flex Item 3</div>
${indent}</div>`;

      default:
        return `${indent}<div
${indent}  className="p-4 bg-gray-100 border border-gray-300 rounded-lg"
${indent}  style={{ position: 'absolute', ${positionStyle} ${styleProps} }}
${indent}>
${indent}  {/* ${element.type} component */}
${indent}  ${element.props?.children || 'Component'}
${indent}</div>`;
    }
  }

  private stylesToReactProps(styles: Record<string, unknown>): string {
    const styleEntries = Object.entries(styles)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${key}: '${value}'`)
      .join(', ');
    
    return styleEntries ? `, ${styleEntries}` : '';
  }

  private extractDependencies(elements: CanvasElement[]): string[] {
    const dependencies = new Set(['react']);
    
    // Add dependencies based on component types
    elements.forEach(element => {
      switch (element.type) {
        case 'image':
          dependencies.add('next/image');
          break;
        case 'form':
          dependencies.add('react-hook-form');
          break;
        // Add more dependencies as needed
      }
    });

    return Array.from(dependencies);
  }

  private generateInstructions(elements: CanvasElement[], options: CodeGenerationOptions): string {
    let instructions = 'Generated React component with the following features:\n\n';
    
    const componentTypes = [...new Set(elements.map(el => el.type))];
    instructions += `• Components used: ${componentTypes.join(', ')}\n`;
    
    if (options.responsive) {
      instructions += '• Responsive design enabled\n';
    }
    
    if (options.includeStyles) {
      instructions += '• Custom styles included\n';
    }

    instructions += '\nTo use this component:\n';
    instructions += '1. Copy the code to a new .tsx file\n';
    instructions += '2. Install any required dependencies\n';
    instructions += '3. Import and use the component in your application\n';
    
    return instructions;
  }

  async generateWithAI(prompt: string): Promise<string> {
    // This would call an actual AI API like OpenAI or Claude
    // For now, we'll return a mock response
    
    if (!this.apiKey) {
      throw new Error('AI API key not configured');
    }

    // Mock AI response
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return `
// AI Generated Component based on: "${prompt}"
import React from 'react';

export default function AIGeneratedComponent() {
  return (
    <div className="ai-generated-component">
      <h2>AI Generated Content</h2>
      <p>This would be generated based on your prompt: {prompt}</p>
      {/* More AI-generated content would go here */}
    </div>
  );
}`;
  }
}

// Utility functions for code generation
export function generateProjectStructure(): {
  pages: string[];
  components: string[];
  utils: string[];
} {
  return {
    pages: ['index.tsx', 'about.tsx'],
    components: ['Header.tsx', 'Footer.tsx', 'Button.tsx'],
    utils: ['helpers.ts', 'constants.ts'],
  };
}

export function generatePackageJson(dependencies: string[]): string {
  const packageJson = {
    name: 'generated-website',
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
      ...dependencies.reduce((acc, dep) => ({ ...acc, [dep]: 'latest' }), {}),
    },
    devDependencies: {
      '@types/node': '^20.0.0',
      '@types/react': '^18.0.0',
      '@types/react-dom': '^18.0.0',
      typescript: '^5.0.0',
      tailwindcss: '^3.0.0',
      autoprefixer: '^10.0.0',
      postcss: '^8.0.0',
    },
  };

  return JSON.stringify(packageJson, null, 2);
}
