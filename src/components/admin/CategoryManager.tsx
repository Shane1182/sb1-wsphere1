import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../../services/governance';
import { GovernanceCategory } from '../../types/governance';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryManagerProps {
  onClose: () => void;
}

export function CategoryManager({ onClose }: CategoryManagerProps) {
  const [categories, setCategories] = useState<GovernanceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
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
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const newCategory: Omit<GovernanceCategory, 'id'> = {
        ...data,
        order: categories.length,
      };
      await createCategory(newCategory);
      reset();
      loadCategories();
    } catch (err) {
      console.error('Error creating category:', err);
      setError('Failed to create category');
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await deleteCategory(categoryId);
      loadCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category');
    }
  };

  const handleReorder = async (categoryId: string, direction: 'up' | 'down') => {
    const currentIndex = categories.findIndex(c => c.id === categoryId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;

    const updatedCategories = [...categories];
    const [movedCategory] = updatedCategories.splice(currentIndex, 1);
    updatedCategories.splice(newIndex, 0, movedCategory);

    // Update order for all affected categories
    const updates = updatedCategories.map((category, index) => 
      updateCategory(category.id, { order: index })
    );

    try {
      await Promise.all(updates);
      loadCategories();
    } catch (err) {
      console.error('Error reordering categories:', err);
      setError('Failed to reorder categories');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Manage Categories</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category Name</label>
              <input
                type="text"
                {...register('name')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
              <textarea
                {...register('description')}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </button>
          </div>
        </form>

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Existing Categories</h4>
          {loading ? (
            <p>Loading categories...</p>
          ) : (
            <ul className="space-y-2">
              {categories.map((category, index) => (
                <li
                  key={category.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div>
                    <p className="font-medium">{category.name}</p>
                    {category.description && (
                      <p className="text-sm text-gray-500">{category.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {index > 0 && (
                      <button
                        onClick={() => handleReorder(category.id, 'up')}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                    )}
                    {index < categories.length - 1 && (
                      <button
                        onClick={() => handleReorder(category.id, 'down')}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}