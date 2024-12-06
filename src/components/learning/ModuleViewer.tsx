import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Module, Progress } from '../../types/content';

interface ModuleViewerProps {
  module: Module;
  progress?: Progress;
  onComplete: (sectionId: string) => void;
}

export function ModuleViewer({ module, progress, onComplete }: ModuleViewerProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const currentSection = module.sections[currentSectionIndex];

  const handleNext = () => {
    if (currentSectionIndex < module.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      onComplete(currentSection.id);
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{module.title}</h1>
          
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${((currentSectionIndex + 1) / module.sections.length) * 100}%`,
                }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Section {currentSectionIndex + 1} of {module.sections.length}
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentSection.title}
            </h2>

            {currentSection.videoUrl && (
              <div className="aspect-w-16 aspect-h-9 mb-6">
                <iframe
                  src={currentSection.videoUrl}
                  className="w-full h-full rounded-lg"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            <div className="prose max-w-none">
              {currentSection.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-700">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentSectionIndex === 0}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Previous
          </button>

          <button
            onClick={handleNext}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {currentSectionIndex === module.sections.length - 1 ? (
              'Complete'
            ) : (
              <>
                Next
                <ChevronRight className="h-5 w-5 ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}