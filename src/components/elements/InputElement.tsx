'use client';

import React, { useState, useRef } from 'react';
import { CanvasElement } from '@/types';
import { getOptimalTextSize, getTouchFriendlySize, isTouchDevice, useScreenSize } from '@/utils/responsive';
import { Eye, EyeOff, Calendar, Clock, Search, Mail, Phone, User, Lock, Link } from 'lucide-react';

interface InputElementProps {
  element: CanvasElement;
  isSelected: boolean;
  isPreviewMode: boolean;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onSelect: () => void;
}

export default function InputElement({
  element,
  isSelected,
  isPreviewMode,
  onUpdate,
  onSelect
}: InputElementProps): React.ReactElement {
  const [showPassword, setShowPassword] = useState(false);
  const [value, setValue] = useState((element.props?.value as string) || '');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const screenSize = useScreenSize();
  const isTouch = isTouchDevice();
  const touchSize = getTouchFriendlySize('input', isTouch);

  const inputType = element.props?.type as string || 'text';
  const placeholder = element.props?.placeholder as string || 'Enter text...';
  const label = element.props?.label as string;
  const required = element.props?.required as boolean || false;
  const disabled = element.props?.disabled as boolean || false;
  const variant = element.props?.variant as string || 'default';

  // Handle value changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    // Basic validation
    validateInput(newValue);
    
    if (isPreviewMode) {
      onUpdate({
        props: {
          ...element.props,
          value: newValue,
        }
      });
    }
  };

  // Basic input validation
  const validateInput = (value: string) => {
    if (required && !value.trim()) {
      setError('This field is required');
      return false;
    }

    switch (inputType) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
          setError('Please enter a valid email address');
          return false;
        }
        break;
      case 'tel':
        const phoneRegex = /^[\+]?[0-9\(\)\-\s\.]+$/;
        if (value && !phoneRegex.test(value)) {
          setError('Please enter a valid phone number');
          return false;
        }
        break;
      case 'url':
        try {
          if (value) new URL(value);
        } catch {
          setError('Please enter a valid URL');
          return false;
        }
        break;
    }

    setError(null);
    return true;
  };

  // Get input styling based on props and screen size
  const getInputStyle = () => {
    const baseStyles = 'w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1';
    
    // Size and spacing - responsive
    const sizeStyles = {
      small: `px-2 py-1 ${getOptimalTextSize(screenSize, 'caption')}`,
      medium: `px-3 py-2 ${getOptimalTextSize(screenSize, 'body')}`,
      large: `px-4 py-3 ${getOptimalTextSize(screenSize, 'body')}`,
    };
    
    // Variant styles
    const variantStyles = {
      default: 'border border-gray-300 rounded-md bg-white focus:ring-indigo-500 focus:border-indigo-500',
      filled: 'border-0 bg-gray-100 rounded-md focus:ring-indigo-500 focus:bg-white',
      underlined: 'border-0 border-b-2 border-gray-300 rounded-none bg-transparent focus:ring-0 focus:border-indigo-500',
      outlined: 'border-2 border-gray-400 rounded-lg bg-transparent focus:ring-indigo-500 focus:border-indigo-500',
    };

    // Error styles
    const errorStyles = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '';
    
    // Disabled styles
    const disabledStyles = disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : '';
    
    const size = element.props?.size as string || 'medium';
    
    return `${baseStyles} ${sizeStyles[size as keyof typeof sizeStyles] || sizeStyles.medium} ${variantStyles[variant as keyof typeof variantStyles] || variantStyles.default} ${errorStyles} ${disabledStyles}`;
  };

  // Get icon for input type
  const getInputIcon = () => {
    const iconMap = {
      email: Mail,
      password: Lock,
      search: Search,
      tel: Phone,
      url: Link,
      date: Calendar,
      time: Clock,
      text: User,
    };
    
    const IconComponent = iconMap[inputType as keyof typeof iconMap];
    return IconComponent ? <IconComponent className="w-4 h-4 text-gray-400" /> : null;
  };

  // Get responsive styles
  const getResponsiveStyles = () => {
    const styles: React.CSSProperties = {
      ...element.styles,
      ...touchSize, // Apply touch-friendly sizing
    };
    
    // Responsive font size
    if (!element.styles?.fontSize) {
      const fontSize = {
        'xs': '16px', // Prevent zoom on iOS
        'sm': '16px',
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

  return (
    <div 
      className="w-full h-full relative flex flex-col justify-center"
      onClick={() => !isPreviewMode && onSelect()}
    >
      {/* Label */}
      {label ? (
        <label className={`block font-medium text-gray-700 mb-1 ${getOptimalTextSize(screenSize, 'caption')}`}>
          {label}
          {required ? <span className="text-red-500 ml-1">*</span> : null}
        </label>
      ) : null}

      {/* Input container */}
      <div className="relative flex-1 flex items-center">
        {/* Leading icon */}
        {(element.props?.showIcon && getInputIcon()) ? (
          <div className="absolute left-3 z-10">
            {getInputIcon()}
          </div>
        ) : null}

        {/* Main input */}
        <input
          ref={inputRef}
          type={inputType === 'password' && showPassword ? 'text' : inputType}
          value={isPreviewMode ? value : (element.props?.placeholder as string || placeholder)}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            ${getInputStyle()}
            ${element.props?.showIcon && getInputIcon() ? 'pl-10' : ''}
            ${inputType === 'password' ? 'pr-10' : ''}
          `}
          style={getResponsiveStyles()}
          readOnly={!isPreviewMode}
          onFocus={() => isPreviewMode && inputRef.current?.select()}
          // Touch-specific attributes
          autoComplete={inputType === 'password' ? 'current-password' : 'off'}
          autoCapitalize={inputType === 'email' ? 'none' : 'sentences'}
          autoCorrect={inputType === 'email' ? 'off' : 'on'}
          spellCheck={inputType === 'email' || inputType === 'password' ? false : true}
        />

        {/* Password toggle */}
        {inputType === 'password' ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-gray-400 hover:text-gray-600 z-10"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        ) : null}

        {/* Loading spinner */}
        {element.props?.loading ? (
          <div className="absolute right-3 z-10">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
          </div>
        ) : null}
      </div>

      {/* Helper text or error */}
      {(error || element.props?.helperText) ? (
        <div className={`mt-1 ${getOptimalTextSize(screenSize, 'caption')}`}>
          {error ? (
            <span className="text-red-600">{error}</span>
          ) : (
            <span className="text-gray-500">{element.props?.helperText as string}</span>
          )}
        </div>
      ) : null}

      {/* Edit indicator */}
      {(isSelected && !isPreviewMode) ? (
        <div className="absolute -top-6 -right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs opacity-75 z-20">
          Configure in properties
        </div>
      ) : null}

      {/* Touch indicator for mobile */}
      {(isTouch && !isPreviewMode) ? (
        <div className="absolute bottom-0 right-0 bg-green-500 text-white px-1 py-0.5 rounded-tl text-xs opacity-75">
          Touch optimized
        </div>
      ) : null}
    </div>
  );
}
