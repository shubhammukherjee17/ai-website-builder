'use client';

import React, { useState, useCallback } from 'react';
import { Trash2, Move, Copy, RotateCcw } from 'lucide-react';
import { CanvasElement, ComponentType } from '@/types';

interface CanvasComponentProps {
  element: CanvasElement;
  isSelected: boolean;
  isPreviewMode: boolean;
  interactionMode?: 'drag' | 'click';
  onSelect: () => void;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onDelete: () => void;
}

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export default function CanvasComponent({
  element,
  isSelected,
  isPreviewMode,
  interactionMode = 'drag',
  onSelect,
  onUpdate,
  onDelete
}: CanvasComponentProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPreviewMode) {
      onSelect();
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isPreviewMode) return;
    
    // In click mode, only allow selection on click, not dragging
    if (interactionMode === 'click') {
      e.stopPropagation();
      onSelect();
      return;
    }
    
    // In drag mode, handle dragging
    e.preventDefault();
    e.stopPropagation();
    
    // Select the element first
    onSelect();
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - element.position.x,
      y: e.clientY - element.position.y,
    });

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      onUpdate({
        position: {
          x: Math.max(0, e.clientX - dragStart.x),
          y: Math.max(0, e.clientY - dragStart.y),
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
  }, [element.position.x, element.position.y, isDragging, dragStart, onUpdate, onSelect, interactionMode]);

  const handleResizeStart = useCallback((e: React.MouseEvent, handle: ResizeHandle) => {
    if (isPreviewMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startPosition = { ...element.position };
    const startSize = { ...element.size };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      let newPosition = { ...startPosition };
      let newSize = { ...startSize };
      
      switch (handle) {
        case 'nw':
          newPosition.x = startPosition.x + deltaX;
          newPosition.y = startPosition.y + deltaY;
          newSize.width = Math.max(50, startSize.width - deltaX);
          newSize.height = Math.max(30, startSize.height - deltaY);
          break;
        case 'n':
          newPosition.y = startPosition.y + deltaY;
          newSize.height = Math.max(30, startSize.height - deltaY);
          break;
        case 'ne':
          newPosition.y = startPosition.y + deltaY;
          newSize.width = Math.max(50, startSize.width + deltaX);
          newSize.height = Math.max(30, startSize.height - deltaY);
          break;
        case 'e':
          newSize.width = Math.max(50, startSize.width + deltaX);
          break;
        case 'se':
          newSize.width = Math.max(50, startSize.width + deltaX);
          newSize.height = Math.max(30, startSize.height + deltaY);
          break;
        case 's':
          newSize.height = Math.max(30, startSize.height + deltaY);
          break;
        case 'sw':
          newPosition.x = startPosition.x + deltaX;
          newSize.width = Math.max(50, startSize.width - deltaX);
          newSize.height = Math.max(30, startSize.height + deltaY);
          break;
        case 'w':
          newPosition.x = startPosition.x + deltaX;
          newSize.width = Math.max(50, startSize.width - deltaX);
          break;
      }
      
      onUpdate({
        position: newPosition,
        size: newSize,
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [element.position, element.size, isResizing, onUpdate]);

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

  // Determine cursor style based on interaction mode
  const getCursorStyle = () => {
    if (isPreviewMode) return '';
    if (interactionMode === 'click') return 'cursor-pointer';
    return 'cursor-move';
  };

  return (
    <div
      className={`
        absolute group select-none
        ${isSelected && !isPreviewMode ? 'ring-2 ring-indigo-500 ring-opacity-75' : ''}
        ${!isPreviewMode ? `hover:ring-2 hover:ring-indigo-300 hover:ring-opacity-50 ${getCursorStyle()}` : ''}
        ${isDragging ? 'ring-2 ring-indigo-400 ring-opacity-90 shadow-lg' : ''}
        ${isResizing ? 'ring-2 ring-purple-400 ring-opacity-90' : ''}
        transition-all duration-200
      `}
      style={{
        left: element.position.x,
        top: element.position.y,
        width: element.size.width,
        height: element.size.height,
        zIndex: isSelected ? 1000 : isDragging || isResizing ? 1001 : 1,
      }}
      onClick={handleClick}
    >
      {/* Drag overlay - makes entire component draggable/clickable */}
      {!isPreviewMode && (
        <div
          className={`absolute inset-0 z-10 ${getCursorStyle()}`}
          onMouseDown={handleMouseDown}
        />
      )}

      {/* Selection controls */}
      {isSelected && !isPreviewMode && (
        <>
          {/* Drag handle label with mode indicator */}
          <div className="absolute -top-8 left-0 bg-indigo-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center space-x-1 shadow-md z-20">
            <Move className="w-3 h-3" />
            <span>{element.type}</span>
            <span className="text-indigo-200">|</span>
            <span className="text-indigo-200 text-[10px]">{element.size.width}×{element.size.height}</span>
            {interactionMode === 'click' && (
              <>
                <span className="text-indigo-200">|</span>
                <span className="text-indigo-200 text-[10px]">Click mode</span>
              </>
            )}
          </div>

          {/* Move handle for click mode */}
          {interactionMode === 'click' && (
            <div
              className="absolute top-1/2 -left-8 transform -translate-y-1/2 bg-green-600 text-white p-2 rounded cursor-move shadow-md z-30 hover:bg-green-700 transition-colors"
              onMouseDown={(e) => {
                // In click mode, this handle allows dragging
                e.preventDefault();
                e.stopPropagation();
                
                const startDrag = {
                  x: e.clientX - element.position.x,
                  y: e.clientY - element.position.y,
                };
                
                setIsDragging(true);
                setDragStart(startDrag);

                const handleMouseMove = (e: MouseEvent) => {
                  onUpdate({
                    position: {
                      x: Math.max(0, e.clientX - startDrag.x),
                      y: Math.max(0, e.clientY - startDrag.y),
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
              }}
              title="Drag to move element"
            >
              <Move className="w-4 h-4" />
            </div>
          )}

          {/* Action buttons */}
          <div className="absolute -top-8 right-0 flex space-x-1 z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Implement copy functionality
                console.log('Copy element:', element.id);
              }}
              className="bg-gray-600 text-white p-1 rounded hover:bg-gray-700 transition-colors shadow-md"
              title="Duplicate"
            >
              <Copy className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="bg-red-600 text-white p-1 rounded hover:bg-red-700 transition-colors shadow-md"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>

          {/* Corner resize handles */}
          <div
            className="absolute -top-1 -left-1 w-3 h-3 bg-indigo-600 cursor-nw-resize rounded-full border border-white shadow-sm z-30 hover:bg-indigo-700"
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
            title="Resize"
          />
          <div
            className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-600 cursor-ne-resize rounded-full border border-white shadow-sm z-30 hover:bg-indigo-700"
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
            title="Resize"
          />
          <div
            className="absolute -bottom-1 -left-1 w-3 h-3 bg-indigo-600 cursor-sw-resize rounded-full border border-white shadow-sm z-30 hover:bg-indigo-700"
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
            title="Resize"
          />
          <div
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-indigo-600 cursor-se-resize rounded-full border border-white shadow-sm z-30 hover:bg-indigo-700"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
            title="Resize"
          />

          {/* Edge resize handles */}
          <div
            className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-indigo-600 cursor-n-resize rounded-full border border-white shadow-sm z-30 hover:bg-indigo-700"
            onMouseDown={(e) => handleResizeStart(e, 'n')}
            title="Resize"
          />
          <div
            className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-indigo-600 cursor-s-resize rounded-full border border-white shadow-sm z-30 hover:bg-indigo-700"
            onMouseDown={(e) => handleResizeStart(e, 's')}
            title="Resize"
          />
          <div
            className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-4 bg-indigo-600 cursor-w-resize rounded-full border border-white shadow-sm z-30 hover:bg-indigo-700"
            onMouseDown={(e) => handleResizeStart(e, 'w')}
            title="Resize"
          />
          <div
            className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-4 bg-indigo-600 cursor-e-resize rounded-full border border-white shadow-sm z-30 hover:bg-indigo-700"
            onMouseDown={(e) => handleResizeStart(e, 'e')}
            title="Resize"
          />
        </>
      )}

      {/* Component content */}
      <div className={`w-full h-full overflow-hidden relative ${
        !isPreviewMode ? 'pointer-events-none' : ''
      }`}>
        {renderComponent()}
      </div>
    </div>
  );
}
