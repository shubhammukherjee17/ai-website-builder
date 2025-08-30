'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CanvasElement } from '@/types';
import { getOptimalTextSize, getTouchFriendlySize, isTouchDevice, useScreenSize } from '@/utils/responsive';

interface ButtonElementProps {
  element: CanvasElement;
  isSelected: boolean;
  isPreviewMode: boolean;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onSelect: () => void;
}

export default function ButtonElement({
  element,
  isSelected,
  isPreviewMode,
  onUpdate,
  onSelect
}: ButtonElementProps): React.ReactElement {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(
    (element.props?.children as string) || 
    (element.props?.text as string) || 
    'Button'
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const screenSize = useScreenSize();
  const isTouch = isTouchDevice();
  const touchSize = getTouchFriendlySize('button', isTouch);

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
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      setEditText((element.props?.children as string) || (element.props?.text as string) || 'Button');
      setIsEditing(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isPreviewMode) {
      // In preview mode, execute any click handlers
      const onClick = element.props?.onClick as (() => void) | undefined;
      if (onClick) {
        e.stopPropagation();
        onClick();
      }
    } else {
      onSelect();
    }
  };

  // Get button styling based on props and screen size
  const getButtonStyle = () => {
    const variant = element.props?.variant as string || 'primary';
    const size = element.props?.size as string || 'medium';
    const disabled = element.props?.disabled as boolean || false;
    
    // Base styles
    let baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    // Size variants - responsive
    const sizeStyles = {
      small: `px-3 py-1.5 ${getOptimalTextSize(screenSize, 'caption')} min-h-8`,
      medium: `px-4 py-2 ${getOptimalTextSize(screenSize, 'body')} min-h-10`,
      large: `px-6 py-3 ${getOptimalTextSize(screenSize, 'body')} min-h-12`,
    };
    
    // Touch-friendly adjustments
    if (isTouch) {
      baseStyles += ' min-h-11'; // Apple HIG minimum touch target
    }
    
    // Color variants
    const colorStyles = {
      primary: 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500',
      secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
      success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
      danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
      warning: 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500',
      outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white focus:ring-indigo-500',
      ghost: 'text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500',
      link: 'text-indigo-600 hover:text-indigo-500 underline-offset-4 hover:underline focus:ring-indigo-500',
    };
    
    // Disabled styles
    const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
    
    return `${baseStyles} ${sizeStyles[size as keyof typeof sizeStyles] || sizeStyles.medium} ${colorStyles[variant as keyof typeof colorStyles] || colorStyles.primary} ${disabledStyles}`;
  };

  // Get responsive padding and sizing
  const getResponsiveStyles = () => {
    const styles: React.CSSProperties = {
      ...element.styles,
      ...touchSize, // Apply touch-friendly sizing
    };
    
    // Responsive font size
    if (!element.styles?.fontSize) {
      const fontSize = {
        'xs': '14px',
        'sm': '14px',
        'md': '16px',
        'lg': '16px',
        'xl': '18px',
        '2xl': '18px',
        '3xl': '20px',
        '4xl': '20px',
        '5xl': '22px',
        '6xl': '24px',
        '7xl': '24px',
        '8xl': '26px',
      };
      styles.fontSize = fontSize[screenSize];
    }
    
    return styles;
  };

  const textContent = (element.props?.children as string) || (element.props?.text as string) || 'Button';

  if (isEditing && !isPreviewMode) {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <input
          ref={inputRef}
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`
            text-center border-2 border-blue-500 rounded-md bg-white
            ${getOptimalTextSize(screenSize, 'body')}
            ${isTouch ? 'py-3 px-4 text-base' : 'py-2 px-3'}
          `}
          style={{
            fontSize: (element.styles?.fontSize as string) || undefined,
            fontFamily: (element.styles?.fontFamily as string) || undefined,
          }}
          placeholder="Button text"
          autoFocus
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <button
        className={getButtonStyle()}
        style={getResponsiveStyles()}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        disabled={element.props?.disabled as boolean}
        type={element.props?.type as 'button' | 'submit' | 'reset' || 'button'}
      >
        <span className="flex items-center justify-center gap-2">
          <span className="truncate">{textContent}</span>
          {(element.props?.loading as boolean) && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current ml-2"></div>
          )}
        </span>
      </button>
      
      {/* Edit indicator */}
      {(isSelected && !isPreviewMode) ? (
        <div className="absolute -top-6 -right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs opacity-75 z-10">
          Double-click to edit
        </div>
      ) : null}

      {/* Click indicator for preview mode */}
      {(isPreviewMode && element.props?.onClick) ? (
        <div className="absolute inset-0 border-2 border-blue-300 border-dashed rounded-md pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
            Interactive
          </div>
        </div>
      ) : null}
    </div>
  );
}
