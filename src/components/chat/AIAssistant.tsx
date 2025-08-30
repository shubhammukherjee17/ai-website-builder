/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Minimize2, Maximize2, Loader } from 'lucide-react';
import { ChatMessage, ChatContext } from '@/types';

interface AIAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
  context?: ChatContext;
  onCodeGenerate?: (prompt: string) => void;
  currentElements?: any[];
  onElementAdd?: (elementType: string, position?: { x: number; y: number }) => void;
  projectTitle?: string;
  onDeploy?: () => void;
}

export default function AIAssistant({
  isOpen,
  onToggle,
  onCodeGenerate,
  currentElements = [],
  onElementAdd,
  projectTitle = 'Website Project',
  onDeploy
}: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi! I'm your AI assistant for building ${projectTitle}. I can help you:\n\n🎨 Design your layout with drag-and-drop components\n🔧 Customize component properties and styles\n💻 Generate clean, production-ready React code\n🚀 Deploy your website to Vercel\n🤖 Answer questions about web development\n\nWhat would you like to work on first?`,
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Process the user's request
      const response = await processAIRequest(inputMessage);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Execute any actions
      if (response.action) {
        await executeAction(response.action, response.actionData);
      }

    } catch {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const processAIRequest = async (message: string) => {
    // Enhanced AI processing with context awareness
    const lowercaseMessage = message.toLowerCase();
    const elementCount = currentElements.length;
    
    // Analyze current project context
    const hasHero = currentElements.some(el => el.type === 'hero');
    const hasNavbar = currentElements.some(el => el.type === 'navbar');
    const hasForm = currentElements.some(el => el.type === 'form');
    const hasButton = currentElements.some(el => el.type === 'button');
    
    // Context-aware responses based on current project state
    if (elementCount === 0) {
      return {
        content: `I notice your canvas is empty. Let's start building! Here are some great first components to add:\n\n🏆 **Hero Section** - Perfect for landing pages\n🧭 **Navigation Bar** - Essential for site navigation\n📝 **Text Block** - For content and descriptions\n🎯 **Button** - For calls-to-action\n\nWhat type of website are you building? I can suggest the best starting components!`,
        action: 'suggest_layout',
        actionData: { components: ['hero', 'navbar', 'text', 'button'] }
      };
    }

    // Intent detection with context awareness
    if (lowercaseMessage.includes('generate') || lowercaseMessage.includes('create')) {
      if (lowercaseMessage.includes('button')) {
        const buttonSuggestion = hasButton ? 
          'I see you already have a button! Would you like to add another one or modify the existing button? I can help with different styles like primary, secondary, outline, or ghost.' :
          'Perfect! Buttons are essential for user interaction. I\'ll help you add a button. What should it say and what action should it perform?';
        return {
          content: buttonSuggestion,
          action: 'suggest_component',
          actionData: { type: 'button', hasExisting: hasButton }
        };
      }
      
      if (lowercaseMessage.includes('form') || lowercaseMessage.includes('contact')) {
        const formSuggestion = hasForm ?
          'I see you already have a form! Would you like to add another form or modify the existing one? I can help with contact forms, newsletter signups, or custom forms.' :
          'Great choice! Forms are crucial for user engagement. What type of form do you need? Contact form, newsletter signup, login form, or something custom?';
        return {
          content: formSuggestion,
          action: 'suggest_component',
          actionData: { type: 'form', hasExisting: hasForm }
        };
      }
      
      if (lowercaseMessage.includes('hero') || lowercaseMessage.includes('landing')) {
        const heroSuggestion = hasHero ?
          'You already have a hero section! Would you like to modify it or create another hero section for a different page?' :
          'Excellent! A hero section will make a great first impression. What\'s your main headline? I can help you create an impactful hero section.';
        return {
          content: heroSuggestion,
          action: 'suggest_component',
          actionData: { type: 'hero', hasExisting: hasHero }
        };
      }
      
      if (lowercaseMessage.includes('navigation') || lowercaseMessage.includes('navbar') || lowercaseMessage.includes('menu')) {
        const navSuggestion = hasNavbar ?
          'You already have navigation! Would you like to modify it or add additional navigation elements?' :
          'Smart! Navigation helps users explore your site. I\'ll add a navigation bar. What pages or sections should it include?';
        return {
          content: navSuggestion,
          action: 'suggest_component',
          actionData: { type: 'navbar', hasExisting: hasNavbar }
        };
      }
      
      if (lowercaseMessage.includes('code')) {
        if (elementCount === 0) {
          return {
            content: 'I\'d love to generate code for you! However, I notice your canvas is empty. Add some components first, then I\'ll generate beautiful React code from your design.',
            action: null,
            actionData: null
          };
        }
        return {
          content: `Perfect! I can generate React code from your ${elementCount} component${elementCount > 1 ? 's' : ''}. The generated code will be production-ready and include all your styling and responsive design. Ready to see your creation as code?`,
          action: 'suggest_action',
          actionData: { action: 'generate_code' }
        };
      }
    }

    if (lowercaseMessage.includes('deploy') || lowercaseMessage.includes('publish') || lowercaseMessage.includes('live')) {
      if (elementCount === 0) {
        return {
          content: 'I\'d love to help you deploy! But first, let\'s add some components to your website. Once you have a design ready, I can deploy it to Vercel with just one click!',
          action: null,
          actionData: null
        };
      }
      return {
        content: `Great! Your website with ${elementCount} component${elementCount > 1 ? 's' : ''} is ready for deployment. I\'ll generate the code and deploy it to Vercel, giving you a live URL to share. The process takes about 1-2 minutes. Ready to go live?`,
        action: 'suggest_action',
        actionData: { action: 'deploy' }
      };
    }

    if (lowercaseMessage.includes('help') || lowercaseMessage.includes('how') || lowercaseMessage.includes('guide')) {
      const contextHelp = elementCount === 0 ?
        'Since you\'re just starting, here\'s what I recommend:\n\n1️⃣ **Start with a Hero** - Great for landing pages\n2️⃣ **Add Navigation** - Help users explore\n3️⃣ **Include Content** - Text blocks, images, cards\n4️⃣ **Add Interaction** - Buttons, forms, links\n5️⃣ **Generate & Deploy** - Turn it into a real website!' :
        `Great progress with ${elementCount} components! Here\'s what you can do next:\n\n🎨 **Customize** - Select any component to edit properties\n📱 **Responsive** - Test different screen sizes\n🤖 **Generate** - Create React code from your design\n🚀 **Deploy** - Make it live on the internet`;
      
      return {
        content: `I'm here to help! ${contextHelp}\n\nWhat specific task would you like help with?`,
        action: null,
        actionData: null
      };
    }

    if (lowercaseMessage.includes('color') || lowercaseMessage.includes('style') || lowercaseMessage.includes('design')) {
      const stylingHelp = elementCount > 0 ?
        `To customize your ${elementCount} component${elementCount > 1 ? 's' : ''}, click on any component to select it, then use the Properties panel on the right. You can change:\n\n🎨 Colors (background, text, border)\n📏 Spacing (padding, margins)\n✏️ Typography (font size, weight)\n🖼️ Layout (alignment, positioning)` :
        'Once you add components to your canvas, you\'ll be able to style them! Click any component to select it, then use the Properties panel to customize colors, fonts, spacing, and more.';
      
      return {
        content: stylingHelp,
        action: null,
        actionData: null
      };
    }

    if (lowercaseMessage.includes('responsive') || lowercaseMessage.includes('mobile')) {
      return {
        content: `Your website is automatically responsive! Use the viewport controls (📱 📟 🖥️) in the toolbar to test different screen sizes. All components adapt beautifully from mobile (4.7") to desktop. Want me to show you how it looks on different devices?`,
        action: 'suggest_action',
        actionData: { action: 'preview' }
      };
    }

    if (lowercaseMessage.includes('undo') || lowercaseMessage.includes('delete') || lowercaseMessage.includes('remove')) {
      return {
        content: `To remove components, select them and press Delete, or use the trash icon. To undo changes, you can refresh the page (your work auto-saves). Need help with specific editing tasks?`,
        action: null,
        actionData: null
      };
    }

    // Analyze message for component suggestions
    const componentKeywords = {
      'image': 'image',
      'photo': 'image',
      'picture': 'image',
      'text': 'text',
      'paragraph': 'text',
      'content': 'text',
      'card': 'card',
      'box': 'card',
      'container': 'container',
      'section': 'container',
      'input': 'input',
      'field': 'input',
      'textbox': 'input',
      'grid': 'grid',
      'layout': 'grid',
      'footer': 'footer',
      'header': 'header'
    };

    for (const [keyword, componentType] of Object.entries(componentKeywords)) {
      if (lowercaseMessage.includes(keyword)) {
        return {
          content: `I can help you add a ${componentType} component! ${getComponentDescription(componentType)} Would you like me to add one to your design?`,
          action: 'suggest_component',
          actionData: { type: componentType }
        };
      }
    }

    // Contextual default response
    const contextualResponse = elementCount === 0 ?
      `I'd love to help you get started! Since your canvas is empty, let's add some components. Try:\n\n• Dragging a Hero section for a striking header\n• Adding a Navbar for navigation\n• Including Text blocks for content\n\nWhat type of website are you building?` :
      `I see you're working with ${elementCount} component${elementCount > 1 ? 's' : ''} - great progress! I can help with:\n\n• Adding more components\n• Customizing existing ones\n• Generating code\n• Deploying your site\n\nWhat would you like to work on next?`;

    return {
      content: contextualResponse,
      action: null,
      actionData: null
    };
  };

  const getComponentDescription = (type: string): string => {
    const descriptions: Record<string, string> = {
      'hero': 'Perfect for creating impactful landing sections with titles and calls-to-action.',
      'navbar': 'Essential for site navigation with menu items and branding.',
      'button': 'Great for calls-to-action, links, and user interactions.',
      'form': 'Ideal for collecting user information, contact forms, and sign-ups.',
      'text': 'Perfect for paragraphs, headings, and content blocks.',
      'image': 'Great for photos, illustrations, and visual content.',
      'card': 'Excellent for displaying information in organized blocks.',
      'container': 'Useful for grouping and organizing other components.',
      'input': 'Perfect for text fields, email inputs, and form elements.',
      'grid': 'Great for creating structured layouts and organizing content.',
      'footer': 'Essential for copyright, links, and contact information.',
      'header': 'Perfect for page titles and introductory content.'
    };
    return descriptions[type] || 'A versatile component for your website.';
  };

  const executeAction = async (action: string, actionData: any) => {
    switch (action) {
      case 'suggest_component':
        console.log('Suggesting component:', actionData.type);
        // In a full implementation, this could highlight the component in the palette
        // or automatically add it to the canvas
        if (onElementAdd && !actionData.hasExisting) {
          // Auto-add component if the callback is available
          onElementAdd(actionData.type, { x: 50, y: 50 });
        }
        break;
      case 'generate_code':
        if (onCodeGenerate) {
          onCodeGenerate('Generate code from current design');
        }
        break;
      case 'suggest_action':
        if (actionData.action === 'deploy' && onDeploy) {
          onDeploy();
        } else if (actionData.action === 'generate_code' && onCodeGenerate) {
          onCodeGenerate('Generate code from AI suggestion');
        }
        console.log('Suggesting action:', actionData.action);
        break;
      case 'suggest_layout':
        console.log('Suggesting layout with components:', actionData.components);
        // In a full implementation, this could show a layout template picker
        break;
      default:
        console.log('Unknown action:', action, actionData);
        break;
    }
  };

  const getContextualPrompts = (): string[] => {
    const elementCount = currentElements.length;
    
    if (elementCount === 0) {
      return [
        'Add a hero section',
        'Create navigation',
        'Start with a button',
        'How do I begin?',
        'Add some text',
        'Show me layouts'
      ];
    } else if (elementCount >= 1 && elementCount < 3) {
      return [
        'Add more components',
        'Style my elements',
        'Create a form',
        'Add images',
        'Generate code',
        'Make it responsive'
      ];
    } else {
      return [
        'Generate code',
        'Deploy my site',
        'Change colors',
        'Add final touches',
        'Preview website',
        'Export code'
      ];
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-200 flex items-center justify-center z-50 hover:scale-105"
        title="Open AI Assistant"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div 
      className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-xl border border-gray-200 z-50 transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-indigo-50 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">AI Assistant</h3>
            <p className="text-xs text-gray-600">Here to help you build</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onToggle}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: '360px' }}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.metadata?.generated_code && (
                    <div className="mt-2 p-2 bg-gray-800 rounded text-xs text-green-400 font-mono">
                      Code generated ✓
                    </div>
                  )}
                  <p className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 rounded-lg p-3 flex items-center space-x-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about building your website..."
                className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={2}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="self-end p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {getContextualPrompts().map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(prompt)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
                  disabled={isLoading}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const quickPrompts = [
  'Add a hero section',
  'Create a contact form',
  'Generate code',
  'How do I deploy?',
  'Add a button',
  'Change colors',
];
