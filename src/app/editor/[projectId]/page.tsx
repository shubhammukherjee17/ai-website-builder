'use client';

import React, { useState, useEffect, use } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { 
  Play, 
  Save, 
  Download, 
  Settings, 
  Zap,
  Eye,
  Code,
  Smartphone,
  Tablet,
  Monitor,
  Menu,
  X,
  ArrowLeft
} from 'lucide-react';
import ComponentPalette from '@/components/editor/ComponentPalette';
import Canvas from '@/components/editor/Canvas';
import PropertyPanel from '@/components/editor/PropertyPanel';
import CodePreviewModal from '@/components/modals/CodePreviewModal';
import AIAssistant from '@/components/chat/AIAssistant';
import { CanvasElement, ComponentType } from '@/types';

interface EditorPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default function EditorPage({ params }: EditorPageProps) {
  const resolvedParams = use(params);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [viewportSize, setViewportSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [project, setProject] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<any>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showMobilePalette, setShowMobilePalette] = useState(false);
  const [showMobileProperties, setShowMobileProperties] = useState(false);

  // Load project data
  useEffect(() => {
    if (resolvedParams.projectId === 'new') {
      // Create new project
      setProject({
        id: 'new',
        title: 'New Website Project',
        elements: []
      });
    } else {
      // Load existing project from Supabase
      loadProject(resolvedParams.projectId);
    }
  }, [resolvedParams.projectId]);

  const loadProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const result = await response.json();

      if (result.success) {
        setProject({
          id: result.data.id,
          title: result.data.title,
          description: result.data.description,
          elements: result.data.elements || []
        });
        setElements(result.data.elements || []);
      } else {
        console.error('Failed to load project:', result.error);
        // Fall back to default project
        setProject({
          id: projectId,
          title: 'Website Project',
          elements: []
        });
      }
    } catch (error) {
      console.error('Error loading project:', error);
      setProject({
        id: projectId,
        title: 'Website Project',
        elements: []
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || over.id !== 'canvas') return;

    // Calculate drop position
    const canvasElement = document.querySelector('[data-canvas]');
    if (!canvasElement) return;

    const canvasRect = canvasElement.getBoundingClientRect();
    
    // Add null check for active.rect.current.translated
    if (!active.rect.current.translated) return;
    
    const dropPosition = {
      x: event.delta.x + active.rect.current.translated.left - canvasRect.left,
      y: event.delta.y + active.rect.current.translated.top - canvasRect.top,
    };

    handleElementAdd(active.data.current, dropPosition);
  };

  const handleElementAdd = (componentData: any, position: { x: number; y: number }) => {
    const generateId = () => `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newElement: CanvasElement = {
      id: generateId(),
      type: componentData.type as ComponentType,
      position: {
        x: Math.max(0, position.x - 20),
        y: Math.max(0, position.y - 20),
      },
      size: {
        width: getDefaultWidth(componentData.type),
        height: getDefaultHeight(componentData.type),
      },
      props: componentData.defaultProps || {},
      styles: {},
    };

    setElements(prev => [...prev, newElement]);
    setSelectedElementId(newElement.id);
  };

  const handleElementUpdate = (id: string, updates: Partial<CanvasElement>) => {
    setElements(prev =>
      prev.map(element =>
        element.id === id ? { ...element, ...updates } : element
      )
    );
  };

  const handleElementDelete = (id: string) => {
    setElements(prev => prev.filter(element => element.id !== id));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const projectId = resolvedParams.projectId;
      
      if (projectId === 'new') {
        // Create new project
        const title = project?.title || 'New Website Project';
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            description: project?.description || '',
            elements,
            metadata: {}
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Update project state with new ID
          setProject((prev: any) => ({ ...prev, id: result.data.id }));
          // Update URL to reflect the new project ID
          window.history.replaceState(null, '', `/editor/${result.data.id}`);
          console.log('New project created and saved');
        } else {
          throw new Error(result.error || 'Failed to create project');
        }
      } else {
        // Update existing project
        const response = await fetch(`/api/projects/${projectId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            elements,
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          console.log('Project saved successfully');
        } else {
          throw new Error(result.error || 'Failed to save project');
        }
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save project: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    setIsPreviewMode(!isPreviewMode);
    setSelectedElementId(null);
  };

  const handleGenerateCode = async () => {
    if (elements.length === 0) {
      alert('Please add some components to the canvas before generating code.');
      return;
    }

    setIsGenerating(true);
    try {
      // Use project id, but handle 'new' case
      const projectId = project?.id === 'new' ? 'demo-project' : (project?.id || resolvedParams.projectId);
      
      const response = await fetch('/api/generate/code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          elements,
          options: {
            framework: 'react',
            includeStyles: true,
            responsive: true,
            exportFormat: 'component'
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success || result.data) {
        setGeneratedCode(result.data || result);
        setShowCodeModal(true);
      } else {
        console.error('Code generation failed:', result.error);
        alert('Code generation failed: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Code generation error:', error);
      alert('Code generation failed: ' + (error instanceof Error ? error.message : 'Network error'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeploy = async () => {
    // TODO: Implement deployment
    console.log('Deploying project:', resolvedParams.projectId);
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

  const selectedElement = elements.find(el => el.id === selectedElementId) || undefined;

  const getCanvasWidth = () => {
    switch (viewportSize) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      case 'desktop': return '1200px';
      default: return '1200px';
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            {/* Back Button on Mobile */}
            <button className="lg:hidden p-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-2 min-w-0">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 flex-shrink-0" />
              <h1 className="text-base sm:text-xl font-semibold text-gray-900 truncate">
                {project?.title || 'Website Builder'}
              </h1>
            </div>
            
            {/* Viewport size controls - Desktop Only */}
            <div className="hidden lg:flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewportSize('mobile')}
                className={`p-2 rounded ${viewportSize === 'mobile' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600'}`}
                title="Mobile View"
              >
                <Smartphone className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewportSize('tablet')}
                className={`p-2 rounded ${viewportSize === 'tablet' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600'}`}
                title="Tablet View"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewportSize('desktop')}
                className={`p-2 rounded ${viewportSize === 'desktop' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600'}`}
                title="Desktop View"
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Mobile Menu Buttons */}
            <div className="lg:hidden flex items-center space-x-1">
              {!isPreviewMode && (
                <>
                  <button
                    onClick={() => setShowMobilePalette(true)}
                    className="p-2 text-gray-600 hover:text-gray-900"
                    title="Components"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                  {selectedElement && (
                    <button
                      onClick={() => setShowMobileProperties(true)}
                      className="p-2 text-gray-600 hover:text-gray-900"
                      title="Properties"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Preview Button */}
            <button
              onClick={handlePreview}
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                isPreviewMode
                  ? 'bg-gray-200 text-gray-900'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">{isPreviewMode ? 'Edit' : 'Preview'}</span>
            </button>

            {/* Action Buttons - Hidden on smaller screens */}
            <div className="hidden sm:flex items-center space-x-2">
              <button
                onClick={handleGenerateCode}
                disabled={isGenerating}
                className="flex items-center space-x-2 px-3 lg:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm"
              >
                <Code className="w-4 h-4" />
                <span className="hidden lg:inline">{isGenerating ? 'Generating...' : 'Generate'}</span>
              </button>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-2 px-3 lg:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm"
              >
                <Save className="w-4 h-4" />
                <span className="hidden lg:inline">{isSaving ? 'Saving...' : 'Save'}</span>
              </button>

              <button
                onClick={handleDeploy}
                className="flex items-center space-x-2 px-3 lg:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Play className="w-4 h-4" />
                <span className="hidden lg:inline">Deploy</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Viewport Controls */}
        <div className="lg:hidden flex items-center justify-center space-x-2 bg-gray-50 border-t border-gray-200 px-4 py-2">
          <button
            onClick={() => setViewportSize('mobile')}
            className={`flex items-center space-x-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewportSize === 'mobile' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Mobile</span>
          </button>
          <button
            onClick={() => setViewportSize('tablet')}
            className={`flex items-center space-x-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewportSize === 'tablet' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Tablet className="w-4 h-4" />
            <span>Tablet</span>
          </button>
          <button
            onClick={() => setViewportSize('desktop')}
            className={`flex items-center space-x-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewportSize === 'desktop' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Desktop</span>
          </button>
        </div>
      </header>

      {/* Main Editor */}
      <div className="flex-1 flex overflow-hidden relative">
        <DndContext onDragEnd={handleDragEnd}>
          {/* Desktop Component Palette */}
          {!isPreviewMode && (
            <div className="hidden lg:block h-full">
              <ComponentPalette />
            </div>
          )}

          {/* Canvas Area */}
          <div className="flex-1 flex justify-center p-2 sm:p-4 lg:p-8 overflow-auto" data-canvas>
            <div 
              className="relative bg-white shadow-lg rounded-lg overflow-hidden sm:min-h-[800px]"
              style={{ 
                width: getCanvasWidth(),
                minHeight: '600px',
                maxWidth: '100%'
              }}
            >
              <Canvas
                elements={elements}
                onElementAdd={() => {}} // Handled by DndContext
                onElementUpdate={handleElementUpdate}
                onElementDelete={handleElementDelete}
                onElementSelect={setSelectedElementId}
                selectedElementId={selectedElementId}
                isPreviewMode={isPreviewMode}
              />
            </div>
          </div>

          {/* Desktop Property Panel */}
          {!isPreviewMode && (
            <div className="hidden lg:block h-full">
              <PropertyPanel
                selectedElement={selectedElement}
                onElementUpdate={handleElementUpdate}
              />
            </div>
          )}

          {/* Mobile Component Palette Modal */}
          {showMobilePalette && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowMobilePalette(false)}>
              <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl p-4 max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Components</h3>
                  <button
                    onClick={() => setShowMobilePalette(false)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <ComponentPalette />
              </div>
            </div>
          )}

          {/* Mobile Property Panel Modal */}
          {showMobileProperties && selectedElement && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowMobileProperties(false)}>
              <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Properties</h3>
                  <button
                    onClick={() => setShowMobileProperties(false)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <PropertyPanel
                  selectedElement={selectedElement}
                  onElementUpdate={handleElementUpdate}
                />
              </div>
            </div>
          )}
        </DndContext>
      </div>

      {/* Mobile Action Bar */}
      <div className="sm:hidden bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-around space-x-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm flex-1"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
          
          <button
            onClick={handleGenerateCode}
            disabled={isGenerating}
            className="flex items-center space-x-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm flex-1"
          >
            <Code className="w-4 h-4" />
            <span>{isGenerating ? 'Code' : 'Code'}</span>
          </button>
          
          <button
            onClick={handleDeploy}
            className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex-1"
          >
            <Play className="w-4 h-4" />
            <span>Deploy</span>
          </button>
        </div>
      </div>

      {/* Code Preview Modal */}
      {showCodeModal && generatedCode && (
        <CodePreviewModal
          isOpen={showCodeModal}
          onClose={() => setShowCodeModal(false)}
          generatedCode={generatedCode}
          title="Generated React Component"
        />
      )}

      {/* AI Assistant */}
      <AIAssistant
        isOpen={showAIAssistant}
        onToggle={() => setShowAIAssistant(!showAIAssistant)}
        context={{
          current_project: project,
          selected_element: selectedElement,
        }}
        onCodeGenerate={() => handleGenerateCode()}
        onElementUpdate={handleElementUpdate}
      />
    </div>
  );
}
