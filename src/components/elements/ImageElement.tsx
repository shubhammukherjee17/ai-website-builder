'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { CanvasElement } from '@/types';
import { getResponsiveImageSizes, useScreenSize, isTouchDevice } from '@/utils/responsive';
import { Upload, Image as ImageIcon, Link, X } from 'lucide-react';

interface ImageElementProps {
  element: CanvasElement;
  isSelected: boolean;
  isPreviewMode: boolean;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onSelect: () => void;
}

export default function ImageElement({
  element,
  isSelected,
  isPreviewMode,
  onUpdate,
  onSelect
}: ImageElementProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [uploadUrl, setUploadUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const screenSize = useScreenSize();
  const isTouch = isTouchDevice();
  const imageSizes = getResponsiveImageSizes(screenSize);

  const handleImageClick = (e: React.MouseEvent) => {
    if (!isPreviewMode) {
      e.stopPropagation();
      onSelect();
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isPreviewMode) return;
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create a data URL for the image
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onUpdate({
          props: {
            ...element.props,
            src: result,
            alt: file.name.split('.')[0],
          }
        });
        setIsEditing(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setError('Failed to upload image');
    } finally {
      setIsLoading(false);
    }
  }, [element.props, onUpdate]);

  const handleUrlSubmit = () => {
    if (!uploadUrl.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(uploadUrl);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    onUpdate({
      props: {
        ...element.props,
        src: uploadUrl,
        alt: element.props?.alt || 'Image',
      }
    });
    setUploadUrl('');
    setIsEditing(false);
    setError(null);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (isPreviewMode) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileUpload(imageFile);
    }
  }, [handleFileUpload, isPreviewMode]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const imageSrc = element.props?.src as string;
  const imageAlt = element.props?.alt as string || 'Image';
  const objectFit = element.props?.objectFit as string || 'cover';
  const borderRadius = element.props?.borderRadius as string || 'rounded-lg';
  
  // Get responsive classes
  const getResponsiveClasses = () => {
    let classes = `${borderRadius} transition-all duration-200 `;
    
    if (!isPreviewMode) {
      classes += 'hover:shadow-lg hover:scale-105 ';
    }
    
    if (isTouch) {
      classes += 'touch-manipulation ';
    }
    
    return classes;
  };

  // Edit mode - image selection interface
  if (isEditing && !isPreviewMode) {
    return (
      <div className="w-full h-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg relative">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          {/* Close button */}
          <button
            onClick={() => {
              setIsEditing(false);
              setError(null);
              setUploadUrl('');
            }}
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {isLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Uploading image...</p>
            </div>
          ) : (
            <div className="text-center space-y-4 w-full max-w-sm">
              {/* Upload from file */}
              <div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    w-full flex flex-col items-center justify-center py-4 px-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors
                    ${isTouch ? 'py-6' : ''}
                  `}
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-600">Upload Image</span>
                  <span className="text-xs text-gray-500 mt-1">
                    {isTouch ? 'Tap to select' : 'Click to browse'}
                  </span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
              </div>

              {/* Divider */}
              <div className="flex items-center">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-3 text-sm text-gray-500">or</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* URL input */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Link className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={uploadUrl}
                    onChange={(e) => setUploadUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                    className={`
                      flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500
                      ${isTouch ? 'py-3 text-base' : ''}
                    `}
                  />
                </div>
                <button
                  onClick={handleUrlSubmit}
                  disabled={!uploadUrl.trim()}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Use URL
                </button>
              </div>

              {/* Error message */}
              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                  {error}
                </div>
              )}

              {/* Drag and drop hint */}
              <p className="text-xs text-gray-500 mt-4">
                You can also drag and drop an image here
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Display mode
  return (
    <div 
      className="w-full h-full relative group"
      onClick={handleImageClick}
      onDoubleClick={handleDoubleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {imageSrc ? (
        <>
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className={`${getResponsiveClasses()} object-${objectFit}`}
            style={{
              ...element.styles,
              objectFit: objectFit as React.CSSProperties['objectFit'],
            }}
            sizes={`(max-width: ${screenSize}) 100vw, ${imageSizes.large}px`}
            priority={element.props?.priority as boolean}
            quality={element.props?.quality as number || 85}
            placeholder={(element.props?.placeholder as 'blur' | 'empty') || 'blur'}
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx4f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyVPMyRULzTE9FdNUl0pu2xOHuBjUlhe3oJx/0A"
            onError={() => setError('Failed to load image')}
          />
          
          {/* Overlay for selected state */}
          {isSelected && !isPreviewMode && (
            <div className="absolute inset-0 bg-blue-500 bg-opacity-20 border-2 border-blue-500 rounded-lg">
              <div className="absolute -top-6 -right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                Double-click to change
              </div>
            </div>
          )}

          {/* Image info overlay */}
          {!isPreviewMode && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-xs truncate">{imageAlt}</p>
              <p className="text-xs text-gray-300">
                {element.size.width} × {element.size.height}
              </p>
            </div>
          )}
        </>
      ) : (
        // Placeholder when no image
        <div className="w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center">
          <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
          <span className="text-sm text-gray-500 text-center">
            {!isPreviewMode ? 'Double-click to add image' : 'No image'}
          </span>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}
    </div>
  );
}
