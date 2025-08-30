'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Eye, Trash2, Calendar, Globe, Filter, Search, SortAsc, Menu, X } from 'lucide-react';
import { projectsClient, Project } from '@/lib/database/projects';
import { createClient } from '@/lib/supabase/client';

type ProjectStatus = 'draft' | 'building' | 'deployed' | 'failed';
type SortBy = 'latest' | 'name' | 'status';

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supabaseConfigured, setSupabaseConfigured] = useState(true);
  
  // Check if Supabase is configured on component mount
  useEffect(() => {
    try {
      createClient();
      setSupabaseConfigured(true);
    } catch (error) {
      console.warn('Supabase not configured, using demo mode');
      setSupabaseConfigured(false);
    }
  }, []);

  // Filter and sort projects
  const applyFiltersAndSort = () => {
    let filtered = [...projects];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(query) ||
        (project.description && project.description.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'latest':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

    setFilteredProjects(filtered);
  };

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Apply filters whenever dependencies change
  useEffect(() => {
    applyFiltersAndSort();
  }, [projects, statusFilter, sortBy, searchQuery]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // If Supabase is not configured, use demo data
      if (!supabaseConfigured) {
        // Mock demo projects
        const demoProjects = [
          {
            id: 'demo-1',
            title: 'Landing Page Demo',
            description: 'A beautiful landing page for your startup',
            status: 'draft' as const,
            user_id: 'demo-user',
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-20T14:30:00Z',
            deployment_url: null,
            preview_url: null,
            elements: [],
            metadata: {}
          },
          {
            id: 'demo-2', 
            title: 'Portfolio Website Demo',
            description: 'Personal portfolio showcasing your work',
            status: 'deployed' as const,
            user_id: 'demo-user',
            created_at: '2024-01-10T08:00:00Z',
            updated_at: '2024-01-18T16:45:00Z',
            deployment_url: 'https://example.com/demo-portfolio',
            preview_url: null,
            elements: [],
            metadata: {}
          },
          {
            id: 'demo-3',
            title: 'E-commerce Store Demo',
            description: 'Online store for selling products', 
            status: 'building' as const,
            user_id: 'demo-user',
            created_at: '2024-01-05T12:00:00Z',
            updated_at: '2024-01-22T09:15:00Z',
            deployment_url: null,
            preview_url: null,
            elements: [],
            metadata: {}
          }
        ];
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProjects(demoProjects);
        setIsLoading(false);
        return;
      }
      
      const response = await fetch('/api/projects');
      const result = await response.json();
      
      if (result.success) {
        setProjects(result.data);
      } else {
        // Handle different error scenarios
        if (result.error === 'Supabase not configured') {
          // If Supabase not configured, the API returns empty array but we're already handling demo mode
          setProjects([]);
          setError(null);
        } else if (result.error === 'Unauthorized') {
          // User not authenticated, show empty state
          setProjects([]);
          setError(null);
        } else {
          setError(result.error || 'Failed to fetch projects');
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects');
      setProjects([]); // Use empty array as fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: 'DELETE',
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Remove project from local state
          setProjects(prev => prev.filter(p => p.id !== projectId));
        } else {
          alert('Failed to delete project: ' + (result.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project. Please try again.');
      }
    }
  };

  const handleCreateProject = async () => {
    const title = prompt('Enter project title:');
    if (!title) return;
    
    const description = prompt('Enter project description (optional):') || '';
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          elements: [],
          metadata: {}
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setProjects(prev => [result.data, ...prev]);
      } else {
        alert('Failed to create project: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'building':
        return 'bg-blue-100 text-blue-800';
      case 'deployed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 sm:py-6">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">Dashboard</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base hidden sm:block">Manage your website projects</p>
            </div>
            <div className="flex-shrink-0 ml-4">
              <Link
                href="/editor/new"
                className="bg-indigo-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden xs:inline">New Project</span>
                <span className="xs:hidden">New</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Demo Mode Banner */}
      {!supabaseConfigured && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Demo Mode:</strong> Supabase is not configured. You&apos;re viewing demo projects.
                  <span className="underline font-medium cursor-pointer" onClick={() => window.open('https://supabase.com/docs/guides/getting-started', '_blank')}>
                    Configure Supabase
                  </span> to enable full functionality.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredProjects.length === 0 && projects.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              No projects yet
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Get started by creating your first website project. Use our drag-and-drop editor to build amazing websites without coding.
            </p>
            <Link
              href="/editor/new"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Your First Project</span>
            </Link>
          </div>
        ) : (
          /* Projects Section */
          <div>
            {/* Search and Filters Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Projects ({filteredProjects.length})
              </h2>
              
              {/* Mobile Filter Toggle */}
              <div className="sm:hidden">
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </button>
              </div>

              {/* Desktop Controls */}
              <div className="hidden sm:flex items-center space-x-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-w-[200px]"
                  />
                </div>
                
                {/* Status Filter */}
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | ProjectStatus)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[120px]"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="building">Building</option>
                  <option value="deployed">Deployed</option>
                  <option value="failed">Failed</option>
                </select>
                
                {/* Sort */}
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[140px]"
                >
                  <option value="latest">Latest Updated</option>
                  <option value="name">Name A-Z</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>

            {/* Mobile Filters */}
            {showMobileFilters && (
              <div className="sm:hidden bg-white border border-gray-200 rounded-lg p-4 mb-6 space-y-4">
                {/* Mobile Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                
                {/* Mobile Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value as 'all' | ProjectStatus)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="building">Building</option>
                    <option value="deployed">Deployed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                
                {/* Mobile Sort */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="latest">Latest Updated</option>
                    <option value="name">Name A-Z</option>
                    <option value="status">Status</option>
                  </select>
                </div>
              </div>
            )}

            {/* No Results State */}
            {filteredProjects.length === 0 && projects.length > 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No projects found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filter criteria.
                </p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setSortBy('latest');
                  }}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Projects Grid */}
            {filteredProjects.length > 0 && (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                          {project.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ml-2 ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {project.status}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">Updated {formatDate(project.updated_at)}</span>
                    </div>

                    {project.deployment_url && (
                      <div className="flex items-center text-sm text-green-600 mb-4">
                        <Globe className="w-4 h-4 mr-1 flex-shrink-0" />
                        <a
                          href={project.deployment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline truncate"
                        >
                          {project.deployment_url}
                        </a>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/editor/${project.id}`}
                          className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                        >
                          <Edit className="w-4 h-4" />
                          <span className="hidden sm:inline">Edit</span>
                        </Link>
                        <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-700 text-sm font-medium">
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">Preview</span>
                        </button>
                      </div>
                      <button 
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-16">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Link
              href="/templates"
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Browse Templates
              </h3>
              <p className="text-gray-600 text-sm">
                Start with professionally designed templates
              </p>
            </Link>

            <Link
              href="/components"
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <span className="text-2xl">🧩</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Component Library
              </h3>
              <p className="text-gray-600 text-sm">
                Explore pre-built components and blocks
              </p>
            </Link>

            <Link
              href="/ai-assistant"
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                AI Assistant
              </h3>
              <p className="text-gray-600 text-sm">
                Get help with design and code generation
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
