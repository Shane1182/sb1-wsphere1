import { useState, useEffect } from 'react';
import { GovernanceDocument } from '../types/governance';
import { getGovernanceDocuments, deleteGovernanceDocument } from '../services/governance';

export function useGovernanceDocuments() {
  const [documents, setDocuments] = useState<GovernanceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await getGovernanceDocuments();
      setDocuments(docs);
      setError(null);
    } catch (err) {
      setError('Failed to load documents');
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (document: GovernanceDocument) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await deleteGovernanceDocument(document.id, document.title);
      setDocuments(docs => docs.filter(d => d.id !== document.id));
    } catch (err) {
      console.error('Error deleting document:', err);
      alert('Failed to delete document');
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  return {
    documents,
    loading,
    error,
    refreshDocuments: loadDocuments,
    deleteDocument,
  };
}