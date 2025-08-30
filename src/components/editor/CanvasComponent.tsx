'use client';

import React, { useRef, useState } from 'react';
import { Trash2, Move, Copy } from 'lucide-react';
import { CanvasElement } from '@/types';

interface CanvasComponentProps {
  element: CanvasElement;
  isSelected: boolean;
  isPreviewMode: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onDelete: () => void;
}

export default function CanvasComponent({
  element,
  isSelected,
  isPreviewMode,
  onSelect,
  onUpdate,
  onDelete
}: CanvasComponentProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPreviewMode) {
      onSelect();
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPreviewMode) {
      onSelect();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPreviewMode || !isSelected) return;

    // Check if clicking on resize handle
    const target = e.target as HTMLElement;
    if (target.classList.contains('resize-handle')) {
      return; // Let resize handler deal with it
    }

    setIsDragging(true);
    const startX = e.clientX - element.position.x;
    const startY = e.clientY - element.position.y;

    const handleMouseMove = (e: MouseEvent) => {
      onUpdate({
        position: {
          x: e.clientX - startX,
          y: e.clientY - startY,
        },
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    if (isPreviewMode) return;

    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = element.size.width;
    const startHeight = element.size.height;
    const startLeft = element.position.x;
    const startTop = element.position.y;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newLeft = startLeft;
      let newTop = startTop;

      // Handle different resize directions
      switch (direction) {
        case 'se': // bottom-right
          newWidth = Math.max(50, startWidth + deltaX);
          newHeight = Math.max(50, startHeight + deltaY);
          break;
        case 'sw': // bottom-left
          newWidth = Math.max(50, startWidth - deltaX);
          newHeight = Math.max(50, startHeight + deltaY);
          newLeft = startLeft + startWidth - newWidth;
          break;
        case 'ne': // top-right
          newWidth = Math.max(50, startWidth + deltaX);
          newHeight = Math.max(50, startHeight - deltaY);
          newTop = startTop + startHeight - newHeight;
          break;
        case 'nw': // top-left
          newWidth = Math.max(50, startWidth - deltaX);
          newHeight = Math.max(50, startHeight - deltaY);
          newLeft = startLeft + startWidth - newWidth;
          newTop = startTop + startHeight - newHeight;
          break;
        case 'n': // top
          newHeight = Math.max(50, startHeight - deltaY);
          newTop = startTop + startHeight - newHeight;
          break;
        case 's': // bottom
          newHeight = Math.max(50, startHeight + deltaY);
          break;
        case 'e': // right
          newWidth = Math.max(50, startWidth + deltaX);
          break;
        case 'w': // left
          newWidth = Math.max(50, startWidth - deltaX);
          newLeft = startLeft + startWidth - newWidth;
          break;
      }

      onUpdate({
        position: { x: newLeft, y: newTop },
        size: { width: newWidth, height: newHeight },
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const renderComponent = () => {
    switch (element.type) {
      case 'text':
        return (
          <div 
            className={element.props.className || 'text-gray-900'}
            style={element.styles}
          >
            {element.props.children || 'Text'}
          </div>
        );

      case 'image':
        return (
          <img
            src={element.props.src || 'https://via.placeholder.com/300x200'}
            alt={element.props.alt || 'Image'}
            className={element.props.className || 'rounded-lg object-cover'}
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
            className={element.props.className || 'px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors'}
            style={element.styles}
            onClick={isPreviewMode ? element.props.onClick : undefined}
          >
            {element.props.children || 'Button'}
          </button>
        );

      case 'input':
        return (
          <input
            type={element.props.type || 'text'}
            placeholder={element.props.placeholder || 'Enter text...'}
            className={element.props.className || 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'}
            style={element.styles}
          />
        );

      case 'container':
        return (
          <div
            className={element.props.className || 'p-4 bg-gray-50 border border-gray-200 rounded-lg'}
            style={element.styles}
          >
            {element.props.children || 'Container'}
          </div>
        );

      case 'header':
        return (
          <header
            className={element.props.className || 'w-full py-4 px-6 bg-white border-b border-gray-200'}
            style={element.styles}
          >
            {element.props.children || 'Header'}
          </header>
        );

      case 'footer':
        return (
          <footer
            className={element.props.className || 'w-full py-8 px-6 bg-gray-900 text-white'}
            style={element.styles}
          >
            {element.props.children || 'Footer'}
          </footer>
        );

      case 'navbar':
        return (
          <nav
            className={element.props.className || 'w-full py-4 px-6 bg-gray-900 text-white'}
            style={element.styles}
          >
            {element.props.children || 'Navigation Bar'}
          </nav>
        );

      case 'hero':
        return (
          <div
            className={element.props.className || 'text-center py-20 bg-gray-50'}
            style={element.styles}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {element.props.title || 'Hero Title'}
            </h1>
            <p className="text-xl text-gray-600">
              {element.props.subtitle || 'Hero subtitle goes here'}
            </p>
          </div>
        );

      case 'card':
        return (
          <div
            className={element.props.className || 'p-6 bg-white border border-gray-200 rounded-lg shadow-sm'}
            style={element.styles}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {element.props.title || 'Card Title'}
            </h3>
            <p className="text-gray-600">
              {element.props.content || 'Card content goes here'}
            </p>
          </div>
        );

      case 'form':
        return (
          <form
            className={element.props.className || 'space-y-4 p-6 bg-white border border-gray-200 rounded-lg'}
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
            className={element.props.className || 'grid grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg'}
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
            className={element.props.className || 'flex items-center justify-center p-4 border border-gray-200 rounded-lg space-x-4'}
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
    <div
      ref={elementRef}
      className={`
        absolute group
        ${isSelected && !isPreviewMode ? 'ring-2 ring-indigo-500 ring-opacity-50' : ''}
        ${!isPreviewMode ? 'hover:ring-2 hover:ring-indigo-300 hover:ring-opacity-50' : ''}
        ${isSelected && !isPreviewMode ? 'cursor-move' : ''}
        ${isDragging ? 'cursor-grabbing' : ''}
        ${isResizing ? 'cursor-grabbing' : ''}
      `}
      style={{
        left: element.position.x,
        top: element.position.y,
        width: element.size.width,
        height: element.size.height,
        zIndex: isSelected ? 1000 : 1,
        userSelect: isDragging || isResizing ? 'none' : 'auto',
      }}
             onClick={handleClick}
       onDoubleClick={handleDoubleClick}
       onMouseDown={handleMouseDown}
    >
      {/* Selection controls */}
      {isSelected && !isPreviewMode && (
        <>
          {/* Element type indicator */}
          <div className="absolute -top-8 left-0 bg-indigo-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center space-x-1">
            <Move className="w-3 h-3" />
            <span>{element.type}</span>
          </div>

          {/* Action buttons */}
          <div className="absolute -top-8 right-0 flex space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Implement copy functionality
              }}
              className="bg-gray-600 text-white p-1 rounded hover:bg-gray-700 transition-colors"
              title="Duplicate"
            >
              <Copy className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="bg-red-600 text-white p-1 rounded hover:bg-red-700 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>

          {/* Resize handles */}
          <div 
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-indigo-600 cursor-se-resize resize-handle" 
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />
          <div 
            className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-600 cursor-ne-resize resize-handle" 
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
          />
          <div 
            className="absolute -bottom-1 -left-1 w-3 h-3 bg-indigo-600 cursor-sw-resize resize-handle" 
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
          />
          <div 
            className="absolute -top-1 -left-1 w-3 h-3 bg-indigo-600 cursor-nw-resize resize-handle" 
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
          />
          
          {/* Edge resize handles */}
          <div 
            className="absolute top-1/2 -left-1 w-3 h-3 bg-indigo-600 cursor-w-resize resize-handle transform -translate-y-1/2" 
            onMouseDown={(e) => handleResizeStart(e, 'w')}
          />
          <div 
            className="absolute top-1/2 -right-1 w-3 h-3 bg-indigo-600 cursor-e-resize resize-handle transform -translate-y-1/2" 
            onMouseDown={(e) => handleResizeStart(e, 'e')}
          />
          <div 
            className="absolute -top-1 left-1/2 w-3 h-3 bg-indigo-600 cursor-n-resize resize-handle transform -translate-x-1/2" 
            onMouseDown={(e) => handleResizeStart(e, 'n')}
          />
          <div 
            className="absolute -bottom-1 left-1/2 w-3 h-3 bg-indigo-600 cursor-s-resize resize-handle transform -translate-x-1/2" 
            onMouseDown={(e) => handleResizeStart(e, 's')}
          />
        </>
      )}

      {/* Component content */}
      <div className="w-full h-full overflow-hidden">
        {renderComponent()}
      </div>
    </div>
  );
}
