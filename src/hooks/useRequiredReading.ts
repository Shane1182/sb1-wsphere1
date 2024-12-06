import { useState, useEffect } from 'react';
import { RequiredReading } from '../types/reading';
import { getAllRequiredReading, deleteRequiredReading } from '../services/reading';

export function useRequiredReading() {
  const [readings, setReadings] = useState<RequiredReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReadings = async () => {
    try {
      setLoading(true);
      const docs = await getAllRequiredReading();
      setReadings(docs);
      setError(null);
    } catch (err) {
      setError('Failed to load reading materials');
      console.error('Error loading reading materials:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteReading = async (reading: RequiredReading) => {
    if (!window.confirm('Are you sure you want to delete this reading material?')) {
      return;
    }

    try {
      const fileName = reading.documentUrl.split('/').pop() || '';
      await deleteRequiredReading(reading.id, fileName);
      setReadings(current => current.filter(r => r.id !== reading.id));
    } catch (err) {
      console.error('Error deleting reading material:', err);
      alert('Failed to delete reading material');
    }
  };

  useEffect(() => {
    loadReadings();
  }, []);

  return {
    readings,
    loading,
    error,
    refreshReadings: loadReadings,
    deleteReading,
  };
}