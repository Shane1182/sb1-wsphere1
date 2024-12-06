import React from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { Module, Progress } from '../../types/content';

interface ModuleListProps {
  modules: Module[];
  progress: Progress[];
  userId: string;
}

export function ModuleList({ modules, progress, userId }: ModuleListProps) {
  const getModuleStatus = (moduleId: string) => {
    return progress.find(
      (p) => p.userId === userId && p.moduleId === moduleId
    )?.completed || false;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Upcoming Learning Modules</h2>
        <div className="space-y-4">
          {modules.map((module) => (
            <div
              key={module.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{module.title}</h3>
                <p className="text-sm text-gray-500">{module.description}</p>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{module.duration} minutes</span>
                </div>
              </div>
              <div className="ml-4">
                {getModuleStatus(module.id) ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-1" />
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-500">
                    <XCircle className="h-5 w-5 mr-1" />
                    <span className="text-sm font-medium">To Complete</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}