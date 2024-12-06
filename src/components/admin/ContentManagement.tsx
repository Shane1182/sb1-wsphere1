import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { mockModules } from '../../data/mockModules';
import { Module } from '../../types/content';
import { ModuleCreator } from './ModuleCreator';
import { ModuleEditor } from './ModuleEditor';

export function ContentManagement() {
  const [modules, setModules] = useState(mockModules);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleEdit = (module: Module) => {
    setEditingModule(module);
    setIsCreating(false);
  };

  const handleDelete = (moduleId: string) => {
    setModules(modules.filter(m => m.id !== moduleId));
  };

  const handleCreate = () => {
    setEditingModule(null);
    setIsCreating(true);
  };

  if (editingModule) {
    return (
      <div>
        <button
          onClick={() => setEditingModule(null)}
          className="mb-6 text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to modules
        </button>
        <ModuleEditor existingModule={editingModule} />
      </div>
    );
  }

  if (isCreating) {
    return (
      <div>
        <button
          onClick={() => setIsCreating(false)}
          className="mb-6 text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to modules
        </button>
        <ModuleCreator />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Learning Modules</h2>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Module
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-200">
          {modules.map((module) => (
            <li key={module.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{module.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{module.description}</p>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    <span>{module.duration} minutes</span>
                    <span>•</span>
                    <span className="capitalize">{module.type}</span>
                    <span>•</span>
                    <span>{module.sections?.length || 0} sections</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {module.requiredRoles.map((role) => (
                      <span
                        key={role}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="ml-4 flex items-center space-x-3">
                  <button
                    onClick={() => handleEdit(module)}
                    className="text-gray-400 hover:text-blue-500"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(module.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}