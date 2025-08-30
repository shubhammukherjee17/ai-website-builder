'use client';

import React, { useState, useRef } from 'react';
import { X, Copy, Download, Code, FileText, Globe, Monitor, ArrowUp, FileCode } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CanvasElement } from '@/types';

interface CodePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  generatedCode: {
    code: string;
    dependencies?: string[];
    instructions?: string;
    type: 'react' | 'html' | 'api' | 'database';
  };
  elements: CanvasElement[];
  title?: string;
}

export default function CodePreviewModal({
  isOpen,
  onClose,
  generatedCode,
  elements,
  title = 'Preview & Code'
}: CodePreviewModalProps) {
  const [viewMode, setViewMode] = useState<'website' | 'code'>('code');
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js' | 'dependencies' | 'instructions'>('html');
  const [copied, setCopied] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Handle scroll events for scroll-to-top button
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setShowScrollTop(scrollContainerRef.current.scrollTop > 200);
    }
  };

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

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


  // Generate HTML code from elements
  const generateHTMLCode = () => {
    if (elements.length === 0) {
      return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Website</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- Add components to see HTML code here -->
    <div class="empty-state">
        <h1>No components added yet</h1>
        <p>Add some components to your canvas to see the generated HTML code.</p>
    </div>
    
    <script src="script.js"></script>
</body>
</html>`;
    }

    let htmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Website</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
`;

    // Sort elements by Y position to maintain visual order
    const sortedElements = [...elements].sort((a, b) => a.position.y - b.position.y);
    
    sortedElements.forEach((element) => {
      htmlCode += generateElementHTML(element);
    });

    htmlCode += `
    <script src="script.js"></script>
</body>
</html>`;

    return htmlCode;
  };

  // Generate CSS code from elements
  const generateCSSCode = () => {
    if (elements.length === 0) {
      return `/* CSS Styles */
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0;
    padding: 0;
    line-height: 1.6;
}

.empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: #666;
}

.empty-state h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #333;
}`;
    }

    let cssCode = `/* CSS Styles for Your Website */
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0;
    padding: 0;
    line-height: 1.6;
    background-color: #ffffff;
}

/* Component Styles */
`;

    elements.forEach((element) => {
      cssCode += generateElementCSS(element);
    });

    return cssCode;
  };

  // Generate JavaScript code
  const generateJSCode = () => {
    return `// JavaScript for Your Website
document.addEventListener('DOMContentLoaded', function() {
    console.log('Website loaded successfully!');
    
    // Add your custom JavaScript functionality here
    
    // Example: Add click handlers to buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            console.log('Button clicked:', e.target.textContent);
        });
    });
    
    // Example: Form handling
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted');
            // Add your form submission logic here
        });
    });
});`;
  };

  // Generate HTML for a specific element
  const generateElementHTML = (element: CanvasElement): string => {
    const { type, props, styles } = element;
    const styleString = Object.entries(styles)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');

    switch (type) {
      case 'text':
        return `    <div class="${props.className || 'text-element'}"${styleString ? ` style="${styleString}"` : ''}>
        ${props.children || 'Text content'}
    </div>\n`;

      case 'image':
        return `    <img src="${props.src || 'https://via.placeholder.com/300x200'}" 
         alt="${props.alt || 'Image'}" 
         class="${props.className || 'image-element'}"${styleString ? ` style="${styleString}"` : ''}>
\n`;

      case 'button':
        return `    <button class="${props.className || 'button-element'}"${styleString ? ` style="${styleString}"` : ''}>
        ${props.children || 'Button'}
    </button>\n`;

      case 'input':
        return `    <input type="${props.type || 'text'}" 
         placeholder="${props.placeholder || 'Enter text...'}" 
         class="${props.className || 'input-element'}"${styleString ? ` style="${styleString}"` : ''}>\n`;

      case 'form':
        return `    <form class="${props.className || 'form-element'}"${styleString ? ` style="${styleString}"` : ''}>
        <div class="form-group">
            <label for="name">Name</label>
            <input type="text" id="name" name="name" required>
        </div>
        <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required>
        </div>
        <button type="submit">Submit</button>
    </form>\n`;

      case 'container':
        return `    <div class="${props.className || 'container-element'}"${styleString ? ` style="${styleString}"` : ''}>
        ${props.children || 'Container content'}
    </div>\n`;

      case 'header':
        return `    <header class="${props.className || 'header-element'}"${styleString ? ` style="${styleString}"` : ''}>
        <h1>${props.title || 'Website Header'}</h1>
        <nav>
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
        </nav>
    </header>\n`;

      case 'footer':
        return `    <footer class="${props.className || 'footer-element'}"${styleString ? ` style="${styleString}"` : ''}>
        <p>&copy; 2024 Your Website. All rights reserved.</p>
    </footer>\n`;

      case 'navbar':
        return `    <nav class="${props.className || 'navbar-element'}"${styleString ? ` style="${styleString}"` : ''}>
        <div class="nav-brand">Your Brand</div>
        <div class="nav-links">
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#services">Services</a>
            <a href="#contact">Contact</a>
        </div>
    </nav>\n`;

      case 'hero':
        return `    <section class="${props.className || 'hero-element'}"${styleString ? ` style="${styleString}"` : ''}>
        <h1>${props.title || 'Welcome to Your Website'}</h1>
        <p>${props.subtitle || 'Your compelling subtitle goes here'}</p>
        <button class="cta-button">Get Started</button>
    </section>\n`;

      case 'card':
        return `    <div class="${props.className || 'card-element'}"${styleString ? ` style="${styleString}"` : ''}>
        <h3>${props.title || 'Card Title'}</h3>
        <p>${props.content || 'Card content goes here'}</p>
    </div>\n`;

      case 'grid':
        return `    <div class="${props.className || 'grid-element'}"${styleString ? ` style="${styleString}"` : ''}>
        <div class="grid-item">Grid Item 1</div>
        <div class="grid-item">Grid Item 2</div>
        <div class="grid-item">Grid Item 3</div>
        <div class="grid-item">Grid Item 4</div>
    </div>\n`;

      case 'flex':
        return `    <div class="${props.className || 'flex-element'}"${styleString ? ` style="${styleString}"` : ''}>
        <div class="flex-item">Flex Item 1</div>
        <div class="flex-item">Flex Item 2</div>
        <div class="flex-item">Flex Item 3</div>
    </div>\n`;

      default:
        return `    <div class="unknown-element"${styleString ? ` style="${styleString}"` : ''}>
        Unknown Component: ${type}
    </div>\n`;
    }
  };

  // Generate CSS for a specific element
  const generateElementCSS = (element: CanvasElement): string => {
    const { type, position, size, props } = element;
    const className = props.className || `${type}-element`;

    let css = `/* ${type.charAt(0).toUpperCase() + type.slice(1)} Component */
.${className} {
    position: absolute;
    left: ${position.x}px;
    top: ${position.y}px;
    width: ${size.width}px;
    height: ${size.height}px;
`;

    // Add default styles based on component type
    switch (type) {
      case 'text':
        css += `    font-size: 16px;
    color: #333;
    line-height: 1.5;
`;
        break;
      case 'button':
        css += `    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.2s;
`;
        break;
      case 'input':
        css += `    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
`;
        break;
      case 'image':
        css += `    object-fit: cover;
    border-radius: 8px;
`;
        break;
      case 'container':
        css += `    background-color: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
`;
        break;
      case 'header':
        css += `    background-color: white;
    border-bottom: 1px solid #e5e7eb;
    padding: 16px 24px;
`;
        break;
      case 'footer':
        css += `    background-color: #1f2937;
    color: white;
    padding: 32px 24px;
    text-align: center;
`;
        break;
      case 'navbar':
        css += `    background-color: #1f2937;
    color: white;
    padding: 16px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;
        break;
      case 'hero':
        css += `    text-align: center;
    background-color: #f9fafb;
    padding: 80px 24px;
`;
        break;
      case 'card':
        css += `    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;
        break;
      case 'grid':
        css += `    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
`;
        break;
      case 'flex':
        css += `    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
`;
        break;
    }

    // Close the CSS rule
    css += `}\n\n`;

    // Add hover effects for interactive elements
    if (type === 'button') {
      css += `.${className}:hover {
    background-color: #2563eb;
}\n\n`;
    } else if (type === 'input') {
      css += `.${className}:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}\n\n`;
    }

    return css;
  };

  const renderWebsitePreview = () => {
    // Calculate the total height needed for all elements
    const maxY = elements.length > 0 
      ? Math.max(...elements.map(el => el.position.y + el.size.height))
      : 400;
    
    const containerHeight = Math.max(maxY + 100, 600); // Minimum 600px, or content height + 100px padding

    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600 ml-2">Website Preview</span>
          </div>
        </div>
        <div 
          ref={scrollContainerRef}
          className="bg-white relative" 
          style={{ height: '600px', overflow: 'auto' }}
          onScroll={handleScroll}
        >
          {/* Scroll indicator */}
          <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-75">
            Scroll to view full website
          </div>
          
          {/* Scroll to top button */}
          {showScrollTop && (
            <button
              onClick={scrollToTop}
              className="absolute bottom-4 right-4 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors z-10"
              title="Scroll to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          )}
          {elements.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Globe className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No elements to preview</p>
                <p className="text-sm">Add some components to see the preview</p>
              </div>
            </div>
          ) : (
            <div 
              className="relative bg-white mx-auto"
              style={{ 
                width: '100%',
                maxWidth: '1200px',
                height: `${containerHeight}px`,
                minHeight: '600px'
              }}
            >
              {elements.map((element) => (
                <div
                  key={element.id}
                  className="absolute"
                  style={{
                    left: element.position.x,
                    top: element.position.y,
                    width: element.size.width,
                    height: element.size.height,
                  }}
                >
                  {renderElement(element)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderElement = (element: CanvasElement) => {
    switch (element.type) {
      case 'text':
        return (
          <div 
            className={(element.props.className as string) || 'text-gray-900'}
            style={element.styles}
          >
            {(element.props.children as string) || 'Text'}
          </div>
        );

      case 'image':
        return (
          <img
            src={(element.props.src as string) || 'https://via.placeholder.com/300x200'}
            alt={(element.props.alt as string) || 'Image'}
            className={(element.props.className as string) || 'rounded-lg object-cover'}
            style={{
              width: '100%',
              height: '100%',
              ...element.styles,
            }}
          />
        );

      case 'button':
        return (
          <button
            className={(element.props.className as string) || 'px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors'}
            style={element.styles}
          >
            {(element.props.children as string) || 'Button'}
          </button>
        );

      case 'input':
        return (
          <input
            type={(element.props.type as string) || 'text'}
            placeholder={(element.props.placeholder as string) || 'Enter text...'}
            className={(element.props.className as string) || 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'}
            style={element.styles}
          />
        );

      case 'container':
        return (
          <div
            className={(element.props.className as string) || 'p-4 bg-gray-50 border border-gray-200 rounded-lg'}
            style={element.styles}
          >
            {(element.props.children as string) || 'Container'}
          </div>
        );

      case 'header':
        return (
          <header
            className={(element.props.className as string) || 'w-full py-4 px-6 bg-white border-b border-gray-200'}
            style={element.styles}
          >
            {(element.props.children as string) || 'Header'}
          </header>
        );

      case 'footer':
        return (
          <footer
            className={(element.props.className as string) || 'w-full py-8 px-6 bg-gray-900 text-white'}
            style={element.styles}
          >
            {(element.props.children as string) || 'Footer'}
          </footer>
        );

      case 'navbar':
        return (
          <nav
            className={(element.props.className as string) || 'w-full py-4 px-6 bg-gray-900 text-white'}
            style={element.styles}
          >
            {(element.props.children as string) || 'Navigation Bar'}
          </nav>
        );

      case 'hero':
        return (
          <div
            className={(element.props.className as string) || 'text-center py-20 bg-gray-50'}
            style={element.styles}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {(element.props.title as string) || 'Hero Title'}
            </h1>
            <p className="text-xl text-gray-600">
              {(element.props.subtitle as string) || 'Hero subtitle goes here'}
            </p>
          </div>
        );

      case 'card':
        return (
          <div
            className={(element.props.className as string) || 'p-6 bg-white border border-gray-200 rounded-lg shadow-sm'}
            style={element.styles}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {(element.props.title as string) || 'Card Title'}
            </h3>
            <p className="text-gray-600">
              {(element.props.content as string) || 'Card content goes here'}
            </p>
          </div>
        );

      case 'form':
        return (
          <form
            className={(element.props.className as string) || 'space-y-4 p-6 bg-white border border-gray-200 rounded-lg'}
            style={element.styles}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Submit
            </button>
          </form>
        );

      case 'grid':
        return (
          <div
            className={(element.props.className as string) || 'grid grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg'}
            style={element.styles}
          >
            <div className="bg-gray-100 p-4 rounded text-center">Grid Item 1</div>
            <div className="bg-gray-100 p-4 rounded text-center">Grid Item 2</div>
            <div className="bg-gray-100 p-4 rounded text-center">Grid Item 3</div>
            <div className="bg-gray-100 p-4 rounded text-center">Grid Item 4</div>
          </div>
        );

      case 'flex':
        return (
          <div
            className={(element.props.className as string) || 'flex items-center justify-center p-4 border border-gray-200 rounded-lg space-x-4'}
            style={element.styles}
          >
            <div className="bg-gray-100 p-4 rounded">Flex Item 1</div>
            <div className="bg-gray-100 p-4 rounded">Flex Item 2</div>
            <div className="bg-gray-100 p-4 rounded">Flex Item 3</div>
          </div>
        );

      default:
        return (
          <div 
            className="p-4 bg-gray-100 border border-gray-300 rounded-lg text-center"
            style={element.styles}
          >
            Unknown Component: {element.type}
          </div>
        );
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
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-7xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Monitor className="h-6 w-6 text-indigo-600" />
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

            {/* View Mode Toggle */}
            <div className="mt-4">
              <div className="flex items-center justify-center">
                <div className="bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('website')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'website'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <span>Website</span>
                  </button>
                  <button
                    onClick={() => setViewMode('code')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'code'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Code className="w-4 h-4" />
                    <span>Code</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Code View Tabs */}
            {viewMode === 'code' && (
              <div className="mt-4">
                <nav className="flex space-x-8" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab('html')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === 'html'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FileCode className="w-4 h-4" />
                    <span>HTML</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('css')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === 'css'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FileCode className="w-4 h-4" />
                    <span>CSS</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('js')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === 'js'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>JavaScript</span>
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
            )}
          </div>

          {/* Content */}
          <div className="px-4 pb-4 sm:px-6">
            {viewMode === 'website' && renderWebsitePreview()}

            {viewMode === 'code' && (
              <>
                {activeTab === 'html' && (
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">HTML Code</h4>
                      <button
                        onClick={() => copyToClipboard(generateHTMLCode())}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy HTML
                      </button>
                    </div>
                    <SyntaxHighlighter
                      language="html"
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
                      {generateHTMLCode()}
                    </SyntaxHighlighter>
                  </div>
                )}

                {activeTab === 'css' && (
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">CSS Code</h4>
                      <button
                        onClick={() => copyToClipboard(generateCSSCode())}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy CSS
                      </button>
                    </div>
                    <SyntaxHighlighter
                      language="css"
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
                      {generateCSSCode()}
                    </SyntaxHighlighter>
                  </div>
                )}

                {activeTab === 'js' && (
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">JavaScript Code</h4>
                      <button
                        onClick={() => copyToClipboard(generateJSCode())}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy JavaScript
                      </button>
                    </div>
                    <SyntaxHighlighter
                      language="javascript"
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
                      {generateJSCode()}
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
