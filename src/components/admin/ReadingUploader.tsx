import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload } from 'lucide-react';
import { addRequiredReading } from '../../services/reading';

const readingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['high', 'medium', 'low']),
  assignedRoles: z.array(z.enum(['staff', 'ned'])).min(1, 'At least one role must be selected'),
  dueDate: z.string().optional(),
});

type ReadingFormData = z.infer<typeof readingSchema>;

export function ReadingUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReadingFormData>({
    resolver: zodResolver(readingSchema),
  });

  const onSubmit = async (data: ReadingFormData) => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      await addRequiredReading(file, {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      });

      setFile(null);
      reset();
    } catch (error) {
      setError('Failed to upload reading material. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

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
        
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <p className="text-lg font-medium text-gray-900">
              {file ? file.name : 'Drop your document here'}
            </p>
            <p className="text-sm text-gray-500">
              PDF or Word documents up to 10MB
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
        <label className="block text-sm font-medium text-gray-700">Priority</label>
        <select
          {...register('priority')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Due Date (Optional)</label>
        <input
          type="date"
          {...register('dueDate')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Assign to Roles</label>
        <div className="mt-2 space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('assignedRoles')}
              value="staff"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-700">Staff</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('assignedRoles')}
              value="ned"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-700">NED</label>
          </div>
        </div>
        {errors.assignedRoles && (
          <p className="mt-1 text-sm text-red-600">{errors.assignedRoles.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={uploading || !file}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload Reading Material'}
      </button>
    </form>
  );
}