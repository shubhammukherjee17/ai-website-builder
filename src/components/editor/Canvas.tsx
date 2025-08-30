'use client';

import React, { useEffect, useRef, useState } from 'react';
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
}

export default function Canvas({
  elements,
  onElementAdd,
  onElementUpdate,
  onElementDelete,
  onElementSelect,
  selectedElementId,
  isPreviewMode = false
}: CanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas',
  });
  const canvasRef = useRef<HTMLDivElement>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Calculate dynamic canvas height based on elements
  const getCanvasHeight = () => {
    if (elements.length === 0) return 800;
    
    const maxY = Math.max(...elements.map(el => el.position.y + el.size.height));
    const minHeight = 800;
    const calculatedHeight = maxY + 200; // Add 200px padding at bottom
    
    return Math.max(calculatedHeight, minHeight);
  };

  // Auto-scroll to bottom when new elements are added
  useEffect(() => {
    if (elements.length > 0 && canvasRef.current) {
      const maxY = Math.max(...elements.map(el => el.position.y + el.size.height));
      const containerHeight = canvasRef.current.scrollHeight;
      const viewportHeight = canvasRef.current.clientHeight;
      
      // If the new element is below the current viewport, scroll to it
      if (maxY > viewportHeight) {
        canvasRef.current.scrollTo({
          top: maxY - viewportHeight + 100,
          behavior: 'smooth'
        });
      }
    }
  }, [elements.length]);

  // Handle scroll events for scroll indicators
  const handleScroll = () => {
    if (canvasRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = canvasRef.current;
      
      // Show scroll indicator if content is scrollable
      setShowScrollIndicator(scrollHeight > clientHeight);
      
      // Show scroll to top button when scrolled down
      setShowScrollToTop(scrollTop > 200);
    }
  };

  // Scroll to top function
  const scrollToTop = () => {
    if (canvasRef.current) {
      canvasRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (canvasRef.current) {
      canvasRef.current.scrollTo({
        top: canvasRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onElementSelect(null);
    }
  };

  const generateId = () => `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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
    <div 
      ref={canvasRef} 
      className="flex-1 relative bg-gray-50 overflow-auto"
      onScroll={handleScroll}
    >
      <div
        ref={setNodeRef}
        data-canvas
        className={`
          relative w-full bg-white mx-auto shadow-lg
          ${isOver ? 'ring-2 ring-indigo-400 ring-opacity-50' : ''}
          ${isPreviewMode ? '' : 'cursor-crosshair'}
        `}
        style={{
          minHeight: '800px',
          maxWidth: '1200px',
          height: getCanvasHeight(),
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

        {/* Scroll indicator */}
        {showScrollIndicator && !isPreviewMode && (
          <div className="absolute top-4 right-4 bg-indigo-600 text-white text-xs px-3 py-2 rounded-lg shadow-lg opacity-90 pointer-events-none">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>Scroll to build long pages</span>
            </div>
          </div>
        )}

        {/* Scroll to top button */}
        {showScrollToTop && !isPreviewMode && (
          <button
            onClick={scrollToTop}
            className="absolute bottom-4 right-4 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-200 z-10 hover:scale-110"
            title="Scroll to top"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        )}

        {/* Scroll to bottom button */}
        {showScrollIndicator && !isPreviewMode && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-4 right-16 bg-gray-600 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-all duration-200 z-10 hover:scale-110"
            title="Scroll to bottom"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        )}

        {/* Canvas Elements */}
        {elements.map((element) => (
          <CanvasComponent
            key={element.id}
            element={element}
            isSelected={selectedElementId === element.id}
            isPreviewMode={isPreviewMode}
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
              <p className="text-gray-500">
                Drag and drop components from the left panel to get started
              </p>
              <p className="text-sm text-gray-400 mt-2">
                You can scroll down to build longer single-page websites
              </p>
            </div>
          </div>
        )}

        {/* Bottom spacing indicator for long pages */}
        {elements.length > 0 && !isPreviewMode && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
        )}
      </div>
    </div>
  );
}
