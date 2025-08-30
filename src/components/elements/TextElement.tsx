'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CanvasElement } from '@/types';
import { getOptimalTextSize, isTouchDevice, useScreenSize } from '@/utils/responsive';

interface TextElementProps {
  element: CanvasElement;
  isSelected: boolean;
  isPreviewMode: boolean;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onSelect: () => void;
}

export default function TextElement({
  element,
  isSelected,
  isPreviewMode,
  onUpdate,
  onSelect
}: TextElementProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(
    (element.props?.children as string) || 
    (element.props?.text as string) || 
    'Text'
  );
  const textRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const screenSize = useScreenSize();
  const isTouch = isTouchDevice();

  // Auto-focus when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isPreviewMode) return;
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onUpdate({
      props: {
        ...element.props,
        children: editText,
        text: editText
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      setEditText((element.props?.children as string) || (element.props?.text as string) || 'Text');
      setIsEditing(false);
    }
  };

  // Get text styling based on props
  const getTextStyle = () => {
    const fontSize = element.props?.fontSize as string || getOptimalTextSize(screenSize, 'body');
    const fontWeight = element.props?.fontWeight as string || 'font-normal';
    const textAlign = element.props?.textAlign as string || 'text-left';
    const color = element.props?.color as string || 'text-gray-900';
    const fontFamily = element.props?.fontFamily as string || 'font-sans';
    const lineHeight = element.props?.lineHeight as string || 'leading-normal';
    const letterSpacing = element.props?.letterSpacing as string || 'tracking-normal';
    
    return `${fontSize} ${fontWeight} ${textAlign} ${color} ${fontFamily} ${lineHeight} ${letterSpacing}`;
  };

  // Responsive padding based on screen size and touch capability
  const getPadding = () => {
    if (isTouch) return 'p-3'; // More padding for touch devices
    if (screenSize === 'xs' || screenSize === 'sm') return 'p-2';
    return 'p-2';
  };

  const textContent = (element.props?.children as string) || (element.props?.text as string) || 'Text';

  if (isEditing && !isPreviewMode) {
    return (
      <div className="relative w-full h-full">
        <textarea
          ref={inputRef}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`
            w-full h-full resize-none border-none outline-none bg-transparent
            ${getTextStyle()} ${getPadding()}
            ${isTouch ? 'text-base' : ''}
          `}
          style={{
            ...element.styles,
            fontFamily: (element.styles?.fontFamily as string) || undefined,
            fontSize: (element.styles?.fontSize as string) || undefined,
            color: (element.styles?.color as string) || undefined,
          }}
          placeholder="Enter your text..."
          autoFocus
        />
      </div>
    );
  }

  return (
    <div
      ref={textRef}
      className={`
        w-full h-full cursor-text relative overflow-hidden
        ${getTextStyle()} ${getPadding()}
        ${!isPreviewMode ? 'hover:bg-gray-50 hover:bg-opacity-50' : ''}
        ${isTouch ? 'min-h-11' : ''} // Touch-friendly minimum height
      `}
      style={{
        ...element.styles,
        fontFamily: (element.styles?.fontFamily as string) || undefined,
        fontSize: (element.styles?.fontSize as string) || undefined,
        color: (element.styles?.color as string) || undefined,
        userSelect: isPreviewMode ? 'text' : 'none',
      }}
      onDoubleClick={handleDoubleClick}
      onClick={!isPreviewMode ? onSelect : undefined}
    >
      {/* Text content with line break support */}
      <div className="whitespace-pre-wrap break-words leading-relaxed">
        {textContent}
      </div>
      
      {/* Edit indicator */}
      {isSelected && !isPreviewMode && (
        <div className="absolute -top-6 -right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs opacity-75">
          Double-click to edit
        </div>
      )}

      {/* Empty state */}
      {!textContent && !isPreviewMode && (
        <div className="text-gray-400 italic">
          Double-click to add text
        </div>
      )}
    </div>
  );
}
