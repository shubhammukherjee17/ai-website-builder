'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { 
  Type, 
  Image, 
  MousePointer, 
  Square, 
  FileText, 
  Layout,
  Navigation,
  CreditCard,
  Grid3X3,
  Minus
} from 'lucide-react';
import { ComponentType, DragDropItem } from '@/types';

interface DraggableComponentProps {
  item: DragDropItem;
}

function DraggableComponent({ item }: DraggableComponentProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: {
      type: item.type,
      name: item.name,
      defaultProps: item.defaultProps,
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const IconComponent = getIconForType(item.type);

  // Filter out aria-describedby to prevent hydration issues
  const { 'aria-describedby': ariaDescribedBy, ...safeAttributes } = attributes;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...safeAttributes}
      suppressHydrationWarning
      className={`
        flex flex-col items-center p-3 bg-white border border-gray-200 rounded-lg cursor-grab 
        hover:border-indigo-300 hover:shadow-sm transition-all duration-200
        ${isDragging ? 'opacity-50 scale-105' : 'opacity-100'}
      `}
    >
      <IconComponent className="w-6 h-6 text-gray-600 mb-2" />
      <span className="text-xs text-gray-700 text-center">{item.name}</span>
    </div>
  );
}

function getIconForType(type: ComponentType) {
  const icons = {
    text: Type,
    image: Image,
    button: MousePointer,
    input: Square,
    form: FileText,
    container: Layout,
    header: Navigation,
    footer: Minus,
    navbar: Navigation,
    hero: Layout,
    card: CreditCard,
    grid: Grid3X3,
    flex: Layout,
  };
  return icons[type] || Layout;
}

const componentCategories = {
  layout: [
    {
      id: 'container',
      type: 'container' as ComponentType,
      name: 'Container',
      icon: 'layout',
      category: 'layout' as const,
      defaultProps: {
        className: 'p-4 bg-gray-50 border border-gray-200 rounded-lg min-h-[100px]',
        children: 'Container'
      }
    },
    {
      id: 'grid',
      type: 'grid' as ComponentType,
      name: 'Grid',
      icon: 'grid',
      category: 'layout' as const,
      defaultProps: {
        className: 'grid grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg min-h-[100px]',
        children: 'Grid Layout'
      }
    },
    {
      id: 'flex',
      type: 'flex' as ComponentType,
      name: 'Flex',
      icon: 'layout',
      category: 'layout' as const,
      defaultProps: {
        className: 'flex items-center justify-center p-4 border border-gray-200 rounded-lg min-h-[100px]',
        children: 'Flex Layout'
      }
    }
  ],
  content: [
    {
      id: 'text',
      type: 'text' as ComponentType,
      name: 'Text',
      icon: 'type',
      category: 'content' as const,
      defaultProps: {
        children: 'Your text here',
        className: 'text-gray-900'
      }
    },
    {
      id: 'image',
      type: 'image' as ComponentType,
      name: 'Image',
      icon: 'image',
      category: 'content' as const,
      defaultProps: {
        src: 'https://via.placeholder.com/300x200',
        alt: 'Placeholder image',
        className: 'rounded-lg'
      }
    },
    {
      id: 'hero',
      type: 'hero' as ComponentType,
      name: 'Hero',
      icon: 'layout',
      category: 'content' as const,
      defaultProps: {
        title: 'Hero Section',
        subtitle: 'This is a hero section',
        className: 'text-center py-20 bg-gray-50'
      }
    },
    {
      id: 'card',
      type: 'card' as ComponentType,
      name: 'Card',
      icon: 'credit-card',
      category: 'content' as const,
      defaultProps: {
        title: 'Card Title',
        content: 'Card content goes here',
        className: 'p-6 bg-white border border-gray-200 rounded-lg shadow-sm'
      }
    }
  ],
  form: [
    {
      id: 'input',
      type: 'input' as ComponentType,
      name: 'Input',
      icon: 'square',
      category: 'form' as const,
      defaultProps: {
        type: 'text',
        placeholder: 'Enter text...',
        className: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
      }
    },
    {
      id: 'button',
      type: 'button' as ComponentType,
      name: 'Button',
      icon: 'mouse-pointer',
      category: 'form' as const,
      defaultProps: {
        children: 'Click me',
        className: 'px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors'
      }
    },
    {
      id: 'form',
      type: 'form' as ComponentType,
      name: 'Form',
      icon: 'file-text',
      category: 'form' as const,
      defaultProps: {
        className: 'space-y-4 p-6 bg-white border border-gray-200 rounded-lg',
        children: 'Form'
      }
    }
  ],
  navigation: [
    {
      id: 'header',
      type: 'header' as ComponentType,
      name: 'Header',
      icon: 'navigation',
      category: 'navigation' as const,
      defaultProps: {
        className: 'w-full py-4 px-6 bg-white border-b border-gray-200',
        children: 'Header'
      }
    },
    {
      id: 'navbar',
      type: 'navbar' as ComponentType,
      name: 'Navbar',
      icon: 'navigation',
      category: 'navigation' as const,
      defaultProps: {
        className: 'w-full py-4 px-6 bg-gray-900 text-white',
        children: 'Navigation Bar'
      }
    },
    {
      id: 'footer',
      type: 'footer' as ComponentType,
      name: 'Footer',
      icon: 'minus',
      category: 'navigation' as const,
      defaultProps: {
        className: 'w-full py-8 px-6 bg-gray-900 text-white mt-auto',
        children: 'Footer'
      }
    }
  ]
};

export default function ComponentPalette() {
  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto h-full">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Components</h2>
      
      {Object.entries(componentCategories).map(([category, items]) => (
        <div key={category} className="mb-6">
          <h3 className="text-sm font-medium text-gray-600 mb-3 capitalize">
            {category}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {items.map((item) => (
              <DraggableComponent key={item.id} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
