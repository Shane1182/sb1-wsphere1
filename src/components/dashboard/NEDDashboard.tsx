import React, { useEffect, useState } from 'react';
import { FileText, BookOpen, CheckCircle, Award } from 'lucide-react';
import { ModuleList } from '../modules/ModuleList';
import { mockModules } from '../../data/mockModules';
import { mockProgress } from '../../data/mockProgress';
import { useAuthStore } from '../../store/authStore';
import { GovernanceDocumentList } from '../governance/GovernanceDocumentList';
import { RequiredReadingList } from '../reading/RequiredReadingList';
import { getGovernanceDocuments } from '../../services/governance';
import { getRequiredReadingByRole } from '../../services/reading';
import { GovernanceDocument } from '../../types/governance';
import { RequiredReading } from '../../types/reading';

export function NEDDashboard() {
  const user = useAuthStore((state) => state.user);
  const [documents, setDocuments] = useState<GovernanceDocument[]>([]);
  const [readings, setReadings] = useState<RequiredReading[]>([]);
  const [loading, setLoading] = useState(true);
  
  const nedModules = mockModules.filter((module) =>
    module.requiredRoles.includes('ned')
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const [docs, readingMaterials] = await Promise.all([
          getGovernanceDocuments(),
          getRequiredReadingByRole('ned')
        ]);
        setDocuments(docs);
        setReadings(readingMaterials);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">NED Portal</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Induction Progress</h2>
          <span className="text-blue-600 font-medium">20% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '20%' }}></div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="h-8 w-8 text-blue-500" />
            <h2 className="text-lg font-semibold">Governance Documents</h2>
          </div>
          {loading ? (
            <p className="text-gray-500">Loading documents...</p>
          ) : (
            <GovernanceDocumentList documents={documents} />
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-3 mb-4">
            <BookOpen className="h-8 w-8 text-blue-500" />
            <h2 className="text-lg font-semibold">Required Reading</h2>
          </div>
          {loading ? (
            <p className="text-gray-500">Loading reading materials...</p>
          ) : (
            <RequiredReadingList readings={readings} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-blue-500" />
            <div>
              <h2 className="text-lg font-semibold">Current Module</h2>
              <p className="text-gray-600">Board Governance Essentials</p>
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
              <p className="text-gray-600">1 of 5 Modules</p>
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <Award className="h-5 w-5 text-yellow-500" />
            <span className="text-sm text-gray-600">Latest Achievement: Company Introduction</span>
          </div>
        </div>
      </div>

      <ModuleList 
        modules={nedModules}
        progress={mockProgress}
        userId={user?.id || ''}
      />
    </div>
  );
}