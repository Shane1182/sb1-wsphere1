import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { ModuleViewer } from '../components/learning/ModuleViewer';
import { mockModules } from '../data/mockModules';
import { mockProgress } from '../data/mockProgress';
import { useAuthStore } from '../store/authStore';

export function ModulePage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  
  const module = mockModules.find((m) => m.id === moduleId);
  const progress = mockProgress.find(
    (p) => p.userId === user?.id && p.moduleId === moduleId
  );

  if (!module) {
    return <div>Module not found</div>;
  }

  const handleComplete = (sectionId: string) => {
    // TODO: Implement progress tracking
    console.log('Section completed:', sectionId);
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </button>

        <ModuleViewer
          module={module}
          progress={progress}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}