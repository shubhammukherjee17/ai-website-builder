'use client';

import React, { useState, useEffect } from 'react';
import { Globe, AlertCircle, CheckCircle, Clock, ExternalLink, RefreshCw } from 'lucide-react';

interface DeploymentStatusProps {
  projectId: string;
  deploymentUrl?: string;
  status?: 'draft' | 'building' | 'deployed' | 'failed';
  className?: string;
}

interface DeploymentInfo {
  id: string;
  status: 'success' | 'building' | 'failed' | 'pending';
  url: string;
  createdAt: string;
}

export default function DeploymentStatus({ projectId, deploymentUrl, status, className = '' }: DeploymentStatusProps) {
  const [deploymentInfo, setDeploymentInfo] = useState<DeploymentInfo | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check deployment status for building/pending deployments
  useEffect(() => {
    if (status === 'building' && !deploymentInfo) {
      checkDeploymentStatus();
    }
  }, [status, projectId]);

  const checkDeploymentStatus = async () => {
    if (!deploymentUrl) return;
    
    try {
      setIsRefreshing(true);
      // Extract deployment ID from URL or use a different approach
      // For now, we'll implement a simple status check
      const response = await fetch(`/api/deploy?projectId=${projectId}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setDeploymentInfo(result.data);
        }
      }
    } catch (error) {
      console.error('Failed to check deployment status:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'deployed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'building':
        return <Clock className="w-4 h-4 text-blue-600 animate-pulse" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Globe className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'deployed':
        return 'Live';
      case 'building':
        return 'Deploying';
      case 'failed':
        return 'Failed';
      default:
        return 'Not deployed';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'deployed':
        return 'text-green-600';
      case 'building':
        return 'text-blue-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  if (!deploymentUrl && status !== 'building') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Globe className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-500">Not deployed</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center space-x-2 min-w-0 flex-1">
        {getStatusIcon()}
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
        
        {deploymentUrl && status === 'deployed' && (
          <a
            href={deploymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 truncate max-w-[200px]"
          >
            <span className="truncate">{deploymentUrl.replace(/https?:\/\//, '')}</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        )}
      </div>

      {status === 'building' && (
        <button
          onClick={checkDeploymentStatus}
          disabled={isRefreshing}
          className="ml-2 p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          title="Refresh status"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      )}
    </div>
  );
}
