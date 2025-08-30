'use client';

import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { CanvasElement, ComponentType } from '@/types';
import CanvasComponent from './CanvasComponent';

interface CanvasProps {
  elements: CanvasElement[];
  onElementAdd: (element: CanvasElement) => void;
  onElementUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onElementDelete: (id: string) => void;
  onElementSelect: (id: string | null) => void;
  selectedElementId: string | null;
  isPreviewMode?: boolean;
  interactionMode?: 'drag' | 'click';
}

export default function Canvas({
  elements,
  onElementAdd,
  onElementUpdate,
  onElementDelete,
  onElementSelect,
  selectedElementId,
  isPreviewMode = false,
  interactionMode = 'drag'
}: CanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas',
  });

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onElementSelect(null);
    }
  };

  const generateId = () => `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleDrop = (componentData: any, position: { x: number; y: number }) => {
    const newElement: CanvasElement = {
      id: generateId(),
      type: componentData.type as ComponentType,
      position: {
        x: Math.max(0, position.x - 20), // Offset for better UX
        y: Math.max(0, position.y - 20),
      },
      size: {
        width: getDefaultWidth(componentData.type),
        height: getDefaultHeight(componentData.type),
      },
      props: componentData.defaultProps || {},
      styles: {},
    };

    onElementAdd(newElement);
  };

  const getDefaultWidth = (type: ComponentType): number => {
    const widths = {
      text: 200,
      image: 300,
      button: 120,
      input: 250,
      form: 400,
      container: 300,
      header: 800,
      footer: 800,
      navbar: 800,
      hero: 800,
      card: 300,
      grid: 600,
      flex: 400,
    };
    return widths[type] || 200;
  };

  const getDefaultHeight = (type: ComponentType): number => {
    const heights = {
      text: 40,
      image: 200,
      button: 40,
      input: 40,
      form: 200,
      container: 150,
      header: 80,
      footer: 120,
      navbar: 60,
      hero: 400,
      card: 200,
      grid: 300,
      flex: 200,
    };
    return heights[type] || 100;
  };

  return (
    <div className="flex-1 relative bg-gray-50 overflow-auto">
      <div
        ref={setNodeRef}
        className={`
          relative min-h-full w-full bg-white mx-auto shadow-lg
          ${isOver ? 'ring-2 ring-indigo-400 ring-opacity-50' : ''}
          ${isPreviewMode ? '' : 'cursor-crosshair'}
        `}
        style={{
          minHeight: '800px',
          maxWidth: '1200px',
        }}
        onClick={handleCanvasClick}
      >
        {/* Grid overlay for better positioning (only in edit mode) */}
        {!isPreviewMode && (
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #666 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
        )}

        {/* Drop zone indicator */}
        {isOver && !isPreviewMode && (
          <div className="absolute inset-0 bg-indigo-100 bg-opacity-30 flex items-center justify-center pointer-events-none">
            <div className="text-indigo-600 text-lg font-medium">
              Drop component here
            </div>
          </div>
        )}

        {/* Canvas Elements */}
        {elements.map((element) => (
          <CanvasComponent
            key={element.id}
            element={element}
            isSelected={selectedElementId === element.id}
            isPreviewMode={isPreviewMode}
            interactionMode={interactionMode}
            onSelect={() => onElementSelect(element.id)}
            onUpdate={(updates) => onElementUpdate(element.id, updates)}
            onDelete={() => onElementDelete(element.id)}
          />
        ))}

        {/* Empty state */}
        {elements.length === 0 && !isPreviewMode && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                Start Building Your Website
              </h3>
              <p className="text-gray-500 mb-2">
                Drag and drop components from the left panel to get started
              </p>
              <p className="text-sm text-gray-400">
                Current mode: <span className="font-medium">{interactionMode === 'drag' ? 'Drag Mode' : 'Click Mode'}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {interactionMode === 'drag' 
                  ? 'Click and drag elements anywhere to move them'
                  : 'Click elements to select, use green handle to move'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
