import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, Plus } from 'lucide-react';
import { uploadGovernanceDocument, getCategories } from '../../services/governance';
import { GovernanceCategory } from '../../types/governance';
import { CategoryManager } from './CategoryManager';

const governanceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
});

type GovernanceFormData = z.infer<typeof governanceSchema>;

export function GovernanceUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<GovernanceCategory[]>([]);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<GovernanceFormData>({
    resolver: zodResolver(governanceSchema),
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const loadedCategories = await getCategories();
      setCategories(loadedCategories);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories');
    }
  };

  const onSubmit = async (data: GovernanceFormData) => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      
      await uploadGovernanceDocument(file, {
        ...data,
        fileType: file.name.split('.').pop() as 'pdf' | 'doc' | 'docx',
      });

      setFile(null);
      reset();
      setShowNewCategory(false);
      setNewCategory('');
    } catch (error) {
      setError('Failed to upload document. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    
    try {
      // Add the new category to the database
      const newCategoryData: Omit<GovernanceCategory, 'id'> = {
        name: newCategory.trim(),
        order: categories.length,
      };
      
      await addDoc(collection(db, 'governanceCategories'), newCategoryData);
      await loadCategories();
      
      // Set the form value to the new category
      setValue('category', newCategory.trim());
      
      // Reset the new category state
      setNewCategory('');
      setShowNewCategory(false);
    } catch (error) {
      console.error('Error adding category:', error);
      setError('Failed to add new category');
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Upload Document</h3>
        <button
          type="button"
          onClick={() => setShowCategoryManager(true)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Manage Categories
        </button>
      </div>

      {showCategoryManager && (
        <CategoryManager
          onClose={() => {
            setShowCategoryManager(false);
            loadCategories();
          }}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors"
          onDrop={(e) => {
            e.preventDefault();
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile) setFile(droppedFile);
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf,.doc,.docx"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile) setFile(selectedFile);
            }}
          />
          
          <label
            htmlFor="file-upload"
            className="cursor-pointer"
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <p className="text-lg font-medium text-gray-900">
                {file ? file.name : 'Drop your document here'}
              </p>
              <p className="text-sm text-gray-500">
                PDF, Word documents up to 10MB
              </p>
            </div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            {...register('title')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            {...register('description')}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          {showNewCategory ? (
            <div className="mt-1 flex items-center space-x-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter new category name"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewCategory(false);
                  setNewCategory('');
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="mt-1 flex items-center space-x-2">
              <select
                {...register('category')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewCategory(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                New
              </button>
            </div>
          )}
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={uploading || !file}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </form>
    </div>
  );
}