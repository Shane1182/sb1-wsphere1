import React from 'react';
import { BookOpen, CheckCircle, Award } from 'lucide-react';
import { ModuleList } from '../modules/ModuleList';
import { mockModules } from '../../data/mockModules';
import { mockProgress } from '../../data/mockProgress';
import { useAuthStore } from '../../store/authStore';

export function StaffDashboard() {
  const user = useAuthStore((state) => state.user);
  const staffModules = mockModules.filter((module) =>
    module.requiredRoles.includes('staff')
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Welcome to BBRC Induction</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Progress</h2>
          <span className="text-blue-600 font-medium">25% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '25%' }}></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-blue-500" />
            <div>
              <h2 className="text-lg font-semibold">Current Module</h2>
              <p className="text-gray-600">Company Introduction</p>
            </div>
          </div>
          <button className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Continue Learning
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <h2 className="text-lg font-semibold">Completed</h2>
              <p className="text-gray-600">1 of 4 Modules</p>
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <Award className="h-5 w-5 text-yellow-500" />
            <span className="text-sm text-gray-600">Latest Achievement: Welcome Module</span>
          </div>
        </div>
      </div>

      <ModuleList 
        modules={staffModules}
        progress={mockProgress}
        userId={user?.id || ''}
      />
    </div>
  );
}