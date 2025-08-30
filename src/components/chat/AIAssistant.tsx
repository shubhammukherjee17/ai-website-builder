/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Minimize2, Maximize2, Loader } from 'lucide-react';
import { ChatMessage, ChatContext, CanvasElement } from '@/types';

interface AIAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
  context?: ChatContext;
  onCodeGenerate?: (prompt: string) => void;
  onElementUpdate?: (elementId: string, updates: any) => void;
}

export default function AIAssistant({
  isOpen,
  onToggle,
  context,
  onCodeGenerate,
  onElementUpdate
}: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m your AI assistant. I can help you build your website, generate code, and answer any questions you have. What would you like to create today?',
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
      const response = await processAIRequest(inputMessage, context);
      
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

    } catch (error) {
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

  const processAIRequest = async (message: string, context?: ChatContext) => {
    // This is a simplified AI processing function
    // In a real implementation, this would call an AI API like OpenAI or Claude

    const lowercaseMessage = message.toLowerCase();

    // Intent detection based on keywords
    if (lowercaseMessage.includes('generate') || lowercaseMessage.includes('create')) {
      if (lowercaseMessage.includes('button')) {
        return {
          content: 'I\'ll help you create a button! You can drag the Button component from the Components panel on the left, or I can add one for you. What style would you like - primary, secondary, or outline?',
          action: 'suggest_component',
          actionData: { type: 'button' }
        };
      }
      if (lowercaseMessage.includes('form')) {
        return {
          content: 'Great! I can help you create a form. You can drag the Form component from the Components panel, or I can generate a custom form based on your requirements. What fields do you need?',
          action: 'suggest_component',
          actionData: { type: 'form' }
        };
      }
      if (lowercaseMessage.includes('hero')) {
        return {
          content: 'Perfect! A hero section is a great way to start. I can add a hero component with a title and subtitle. Would you like me to create one for you?',
          action: 'suggest_component',
          actionData: { type: 'hero' }
        };
      }
      if (lowercaseMessage.includes('code')) {
        return {
          content: 'I can generate React code from your current design! Click the "Generate Code" button in the toolbar, or I can help you with specific coding questions. What would you like to know?',
          action: 'suggest_action',
          actionData: { action: 'generate_code' }
        };
      }
    }

    if (lowercaseMessage.includes('deploy') || lowercaseMessage.includes('publish')) {
      return {
        content: 'To deploy your website, first make sure you have some components on the canvas, then click "Generate Code" followed by "Deploy". This will create a live website on Vercel. Would you like me to guide you through the process?',
        action: 'suggest_action',
        actionData: { action: 'deploy' }
      };
    }

    if (lowercaseMessage.includes('help') || lowercaseMessage.includes('how')) {
      return {
        content: `I'm here to help! Here's what you can do:

🎨 **Design**: Drag components from the left panel to build your layout
⚙️ **Customize**: Select any component to edit its properties on the right
👀 **Preview**: Click the Preview button to see how your site looks
🤖 **Generate**: Use "Generate Code" to create React components
🚀 **Deploy**: Click Deploy to publish your site live

What specific task would you like help with?`,
        action: null,
        actionData: null
      };
    }

    if (lowercaseMessage.includes('color') || lowercaseMessage.includes('style')) {
      return {
        content: 'To change colors and styles, select any component on the canvas, then use the Style tab in the Properties panel on the right. You can adjust background colors, text colors, borders, and more!',
        action: null,
        actionData: null
      };
    }

    // Default response
    return {
      content: `I understand you want to work on "${message}". Here are some suggestions:

• Try dragging components from the left panel to start building
• Select any component to customize its properties
• Use the Generate Code button to see your design as React code
• Ask me specific questions about design, components, or deployment

What would you like to try first?`,
      action: null,
      actionData: null
    };
  };

  const executeAction = async (action: string, actionData: any) => {
    switch (action) {
      case 'suggest_component':
        // Highlight the suggested component in the palette
        console.log('Suggesting component:', actionData.type);
        break;
      case 'generate_code':
        if (onCodeGenerate) {
          onCodeGenerate('Generate code from current design');
        }
        break;
      case 'suggest_action':
        console.log('Suggesting action:', actionData.action);
        break;
      default:
        break;
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
              {quickPrompts.map((prompt, index) => (
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
