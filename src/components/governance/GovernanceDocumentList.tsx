import React from 'react';
import { FileText, Download, Trash2 } from 'lucide-react';
import { GovernanceDocument } from '../../types/governance';

interface GovernanceDocumentListProps {
  documents: GovernanceDocument[];
  isAdmin?: boolean;
  onDelete?: (document: GovernanceDocument) => void;
}

export function GovernanceDocumentList({ 
  documents, 
  isAdmin = false,
  onDelete
}: GovernanceDocumentListProps) {
  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-blue-50 p-2 rounded-lg">
              <FileText className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{doc.title}</h3>
              <p className="text-sm text-gray-500">{doc.description}</p>
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                <span>{formatFileSize(doc.fileSize)}</span>
                <span>•</span>
                <span>Updated {formatDate(doc.lastUpdated)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <a
              href={doc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
              title="Download"
            >
              <Download className="h-5 w-5" />
            </a>
            
            {isAdmin && onDelete && (
              <button
                onClick={() => onDelete(doc)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Delete"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}