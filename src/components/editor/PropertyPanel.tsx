/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { CanvasElement } from '@/types';
import { Settings, Palette, Layout, Type } from 'lucide-react';

interface PropertyPanelProps {
  selectedElement: CanvasElement | undefined;
  onElementUpdate: (id: string, updates: Partial<CanvasElement>) => void;
}

export default function PropertyPanel({
  selectedElement,
  onElementUpdate
}: PropertyPanelProps) {
  const [activeTab, setActiveTab] = useState<'properties' | 'styles' | 'layout'>('properties');

  if (!selectedElement) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Element Selected</h3>
          <p className="text-sm">Select an element on the canvas to edit its properties</p>
        </div>
      </div>
    );
  }

  const updateProps = (newProps: Record<string, any>) => {
    onElementUpdate(selectedElement.id, {
      props: { ...selectedElement.props, ...newProps }
    });
  };

  const updateStyles = (newStyles: Record<string, any>) => {
    onElementUpdate(selectedElement.id, {
      styles: { ...selectedElement.styles, ...newStyles }
    });
  };

  const updatePosition = (position: { x: number; y: number }) => {
    onElementUpdate(selectedElement.id, { position });
  };

  const updateSize = (size: { width: number; height: number }) => {
    onElementUpdate(selectedElement.id, { size });
  };

  const renderPropertiesTab = () => {
    switch (selectedElement.type) {
      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Content
              </label>
              <textarea
                value={(selectedElement.props.children as string) || ''}
                onChange={(e) => updateProps({ children: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Size
              </label>
              <select
                value={(selectedElement.props.fontSize as string) || 'text-base'}
                onChange={(e) => updateProps({ fontSize: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="text-xs">Extra Small</option>
                <option value="text-sm">Small</option>
                <option value="text-base">Base</option>
                <option value="text-lg">Large</option>
                <option value="text-xl">Extra Large</option>
                <option value="text-2xl">2X Large</option>
                <option value="text-3xl">3X Large</option>
                <option value="text-4xl">4X Large</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Alignment
              </label>
              <select
                value={(selectedElement.props.textAlign as string) || 'text-left'}
                onChange={(e) => updateProps({ textAlign: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="text-left">Left</option>
                <option value="text-center">Center</option>
                <option value="text-right">Right</option>
                <option value="text-justify">Justify</option>
              </select>
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={(selectedElement.props.src as string) || ''}
                onChange={(e) => updateProps({ src: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alt Text
              </label>
              <input
                type="text"
                value={(selectedElement.props.alt as string) || ''}
                onChange={(e) => updateProps({ alt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Describe the image"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Object Fit
              </label>
              <select
                value={(selectedElement.props.objectFit as string) || 'object-cover'}
                onChange={(e) => updateProps({ objectFit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="object-cover">Cover</option>
                <option value="object-contain">Contain</option>
                <option value="object-fill">Fill</option>
                <option value="object-scale-down">Scale Down</option>
              </select>
            </div>
          </div>
        );

      case 'button':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Button Text
              </label>
              <input
                type="text"
                value={(selectedElement.props.children as string) || ''}
                onChange={(e) => updateProps({ children: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Button Style
              </label>
              <select
                value={(selectedElement.props.variant as string) || 'primary'}
                onChange={(e) => {
                  const variant = e.target.value;
                  let className = '';
                  switch (variant) {
                    case 'primary':
                      className = 'px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors';
                      break;
                    case 'secondary':
                      className = 'px-4 py-2 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300 transition-colors';
                      break;
                    case 'outline':
                      className = 'px-4 py-2 border-2 border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-600 hover:text-white transition-colors';
                      break;
                    case 'danger':
                      className = 'px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors';
                      break;
                  }
                  updateProps({ variant, className });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="outline">Outline</option>
                <option value="danger">Danger</option>
              </select>
            </div>
          </div>
        );

      case 'input':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Input Type
              </label>
              <select
                value={(selectedElement.props.type as string) || 'text'}
                onChange={(e) => updateProps({ type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="password">Password</option>
                <option value="number">Number</option>
                <option value="tel">Phone</option>
                <option value="url">URL</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Placeholder
              </label>
              <input
                type="text"
                value={(selectedElement.props.placeholder as string) || ''}
                onChange={(e) => updateProps({ placeholder: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        );

      case 'hero':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hero Title
              </label>
              <input
                type="text"
                value={(selectedElement.props.title as string) || ''}
                onChange={(e) => updateProps({ title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hero Subtitle
              </label>
              <textarea
                value={(selectedElement.props.subtitle as string) || ''}
                onChange={(e) => updateProps({ subtitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
              />
            </div>
          </div>
        );

      case 'card':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Title
              </label>
              <input
                type="text"
                value={(selectedElement.props.title as string) || ''}
                onChange={(e) => updateProps({ title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Content
              </label>
              <textarea
                value={(selectedElement.props.content as string) || ''}
                onChange={(e) => updateProps({ content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={4}
              />
            </div>
          </div>
        );

      case 'navbar':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand/Logo Text
              </label>
              <input
                type="text"
                value={(selectedElement.props.brand as string) || ''}
                onChange={(e) => updateProps({ brand: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Your Brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Navigation Links (one per line)
              </label>
              <textarea
                value={(selectedElement.props.links as string) || 'Home\nAbout\nServices\nContact'}
                onChange={(e) => updateProps({ links: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={4}
                placeholder="Home\nAbout\nServices\nContact"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Navigation Style
              </label>
              <select
                value={(selectedElement.props.variant as string) || 'default'}
                onChange={(e) => updateProps({ variant: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="default">Default</option>
                <option value="transparent">Transparent</option>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
          </div>
        );

      case 'form':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Form Title
              </label>
              <input
                type="text"
                value={(selectedElement.props.title as string) || ''}
                onChange={(e) => updateProps({ title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Contact Us"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Form Fields (one per line)
              </label>
              <textarea
                value={(selectedElement.props.fields as string) || 'name:text:Your Name\nemail:email:Your Email\nmessage:textarea:Your Message'}
                onChange={(e) => updateProps({ fields: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={5}
                placeholder="name:text:Your Name\nemail:email:Your Email\nmessage:textarea:Your Message"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Submit Button Text
              </label>
              <input
                type="text"
                value={(selectedElement.props.submitText as string) || 'Submit'}
                onChange={(e) => updateProps({ submitText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        );

      case 'header':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Header Title
              </label>
              <input
                type="text"
                value={(selectedElement.props.title as string) || ''}
                onChange={(e) => updateProps({ title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Header Level
              </label>
              <select
                value={(selectedElement.props.level as string) || 'h1'}
                onChange={(e) => updateProps({ level: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="h1">H1 - Main Title</option>
                <option value="h2">H2 - Section Title</option>
                <option value="h3">H3 - Subsection</option>
                <option value="h4">H4 - Small Header</option>
              </select>
            </div>
          </div>
        );

      case 'footer':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Footer Content
              </label>
              <textarea
                value={(selectedElement.props.content as string) || ''}
                onChange={(e) => updateProps({ content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                placeholder="© 2024 Your Company. All rights reserved."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Footer Links (one per line)
              </label>
              <textarea
                value={(selectedElement.props.links as string) || 'Privacy Policy\nTerms of Service\nContact'}
                onChange={(e) => updateProps({ links: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
              />
            </div>
          </div>
        );

      case 'container':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Container Type
              </label>
              <select
                value={(selectedElement.props.containerType as string) || 'div'}
                onChange={(e) => updateProps({ containerType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="div">Generic Container</option>
                <option value="section">Section</option>
                <option value="article">Article</option>
                <option value="aside">Sidebar</option>
                <option value="main">Main Content</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Layout Direction
              </label>
              <select
                value={(selectedElement.props.direction as string) || 'column'}
                onChange={(e) => updateProps({ direction: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="column">Vertical (Column)</option>
                <option value="row">Horizontal (Row)</option>
              </select>
            </div>
          </div>
        );

      case 'grid':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grid Columns
              </label>
              <select
                value={(selectedElement.props.columns as string) || '3'}
                onChange={(e) => updateProps({ columns: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="1">1 Column</option>
                <option value="2">2 Columns</option>
                <option value="3">3 Columns</option>
                <option value="4">4 Columns</option>
                <option value="6">6 Columns</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grid Gap
              </label>
              <select
                value={(selectedElement.props.gap as string) || 'md'}
                onChange={(e) => updateProps({ gap: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="none">No Gap</option>
                <option value="sm">Small Gap</option>
                <option value="md">Medium Gap</option>
                <option value="lg">Large Gap</option>
                <option value="xl">Extra Large Gap</option>
              </select>
            </div>
          </div>
        );

      case 'flex':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flex Direction
              </label>
              <select
                value={(selectedElement.props.direction as string) || 'row'}
                onChange={(e) => updateProps({ direction: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="row">Horizontal (Row)</option>
                <option value="column">Vertical (Column)</option>
                <option value="row-reverse">Reverse Horizontal</option>
                <option value="column-reverse">Reverse Vertical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Justify Content
              </label>
              <select
                value={(selectedElement.props.justify as string) || 'start'}
                onChange={(e) => updateProps({ justify: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="start">Start</option>
                <option value="center">Center</option>
                <option value="end">End</option>
                <option value="between">Space Between</option>
                <option value="around">Space Around</option>
                <option value="evenly">Space Evenly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Align Items
              </label>
              <select
                value={(selectedElement.props.align as string) || 'start'}
                onChange={(e) => updateProps({ align: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="start">Start</option>
                <option value="center">Center</option>
                <option value="end">End</option>
                <option value="stretch">Stretch</option>
                <option value="baseline">Baseline</option>
              </select>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={(selectedElement.props.children as string) || ''}
                onChange={(e) => updateProps({ children: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
              />
            </div>
          </div>
        );
    }
  };

  const renderStylesTab = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Background Color
        </label>
        <div className="flex space-x-2">
          <input
            type="color"
            value={(selectedElement.styles.backgroundColor as string) || '#ffffff'}
            onChange={(e) => updateStyles({ backgroundColor: e.target.value })}
            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="text"
            value={(selectedElement.styles.backgroundColor as string) || ''}
            onChange={(e) => updateStyles({ backgroundColor: e.target.value })}
            placeholder="#ffffff"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {/* Quick background presets */}
        <div className="grid grid-cols-6 gap-1">
          {['#ffffff', '#f3f4f6', '#e5e7eb', '#1f2937', '#4f46e5', '#10b981'].map(color => (
            <button
              key={color}
              onClick={() => updateStyles({ backgroundColor: color })}
              className="w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-400"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Text Color
        </label>
        <div className="flex space-x-2">
          <input
            type="color"
            value={(selectedElement.styles.color as string) || '#000000'}
            onChange={(e) => updateStyles({ color: e.target.value })}
            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="text"
            value={(selectedElement.styles.color as string) || ''}
            onChange={(e) => updateStyles({ color: e.target.value })}
            placeholder="#000000"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {/* Quick text color presets */}
        <div className="grid grid-cols-6 gap-1">
          {['#000000', '#374151', '#6b7280', '#ef4444', '#3b82f6', '#059669'].map(color => (
            <button
              key={color}
              onClick={() => updateStyles({ color })}
              className="w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-400"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Border
        </label>
        <div className="space-y-2">
          <div className="flex space-x-2">
            <input
              type="number"
              min="0"
              max="10"
              value={parseInt((selectedElement.styles.borderWidth as string)) || 0}
              onChange={(e) => updateStyles({ borderWidth: `${e.target.value}px` })}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="0"
            />
            <input
              type="color"
              value={(selectedElement.styles.borderColor as string) || '#d1d5db'}
              onChange={(e) => updateStyles({ borderColor: e.target.value })}
              className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
            />
            <select
              value={(selectedElement.styles.borderStyle as string) || 'solid'}
              onChange={(e) => updateStyles({ borderStyle: e.target.value })}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Border Radius
        </label>
        <input
          type="range"
          min="0"
          max="50"
          value={parseInt((selectedElement.styles.borderRadius as string)) || 0}
          onChange={(e) => updateStyles({ borderRadius: `${e.target.value}px` })}
          className="w-full"
        />
        <div className="text-sm text-gray-500 text-center mt-1">
          {(selectedElement.styles.borderRadius as string) || '0px'}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Shadow
        </label>
        <select
          value={(selectedElement.styles.boxShadow as string) || 'none'}
          onChange={(e) => updateStyles({ boxShadow: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="none">No Shadow</option>
          <option value="0 1px 2px 0 rgb(0 0 0 / 0.05)">Small</option>
          <option value="0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)">Medium</option>
          <option value="0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)">Large</option>
          <option value="0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)">Extra Large</option>
          <option value="0 25px 50px -12px rgb(0 0 0 / 0.25)">2X Large</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Opacity
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={(selectedElement.styles.opacity as number) || 1}
          onChange={(e) => updateStyles({ opacity: parseFloat(e.target.value) })}
          className="w-full"
        />
        <div className="text-sm text-gray-500 text-center mt-1">
          {Math.round(((selectedElement.styles.opacity as number) || 1) * 100)}%
        </div>
      </div>
    </div>
  );

  const renderLayoutTab = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Position
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">X</label>
            <input
              type="number"
              value={selectedElement.position.x}
              onChange={(e) => updatePosition({ ...selectedElement.position, x: parseInt(e.target.value) || 0 })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Y</label>
            <input
              type="number"
              value={selectedElement.position.y}
              onChange={(e) => updatePosition({ ...selectedElement.position, y: parseInt(e.target.value) || 0 })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Size
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Width</label>
            <input
              type="number"
              value={selectedElement.size.width}
              onChange={(e) => updateSize({ ...selectedElement.size, width: parseInt(e.target.value) || 0 })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Height</label>
            <input
              type="number"
              value={selectedElement.size.height}
              onChange={(e) => updateSize({ ...selectedElement.size, height: parseInt(e.target.value) || 0 })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Padding
        </label>
        <input
          type="range"
          min="0"
          max="50"
          value={parseInt((selectedElement.styles.padding as string)) || 0}
          onChange={(e) => updateStyles({ padding: `${e.target.value}px` })}
          className="w-full"
        />
        <div className="text-sm text-gray-500 text-center mt-1">
          {(selectedElement.styles.padding as string) || '0px'}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-80 bg-white border-l border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)} Properties
        </h2>
        
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('properties')}
            className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'properties'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings className="w-4 h-4 mx-auto mb-1" />
            Props
          </button>
          <button
            onClick={() => setActiveTab('styles')}
            className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'styles'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Palette className="w-4 h-4 mx-auto mb-1" />
            Style
          </button>
          <button
            onClick={() => setActiveTab('layout')}
            className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'layout'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Layout className="w-4 h-4 mx-auto mb-1" />
            Layout
          </button>
        </div>
      </div>

      <div className="p-4 overflow-y-auto" style={{ height: 'calc(100vh - 200px)' }}>
        {activeTab === 'properties' && renderPropertiesTab()}
        {activeTab === 'styles' && renderStylesTab()}
        {activeTab === 'layout' && renderLayoutTab()}
      </div>
    </div>
  );
}
