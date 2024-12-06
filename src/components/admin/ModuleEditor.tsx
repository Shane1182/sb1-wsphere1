import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { ContentType, UserRole } from '../../types/content';

const moduleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['video', 'pdf', 'quiz', 'assessment', 'policy']),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  requiredRoles: z.array(z.enum(['admin', 'staff', 'ned'])),
  sections: z.array(z.object({
    title: z.string().min(1, 'Section title is required'),
    content: z.string().optional(),
    videoUrl: z.string().url().optional(),
  })),
});

type ModuleFormData = z.infer<typeof moduleSchema>;

export function ModuleEditor({ existingModule }: { existingModule?: ModuleFormData }) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema),
    defaultValues: existingModule || {
      sections: [{ title: '', content: '', videoUrl: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sections',
  });

  const moduleType = watch('type');

  const onSubmit = (data: ModuleFormData) => {
    console.log('Form data:', data);
    // TODO: Implement module creation/update logic
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select
          {...register('type')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="video">Video</option>
          <option value="pdf">PDF</option>
          <option value="quiz">Quiz</option>
          <option value="assessment">Assessment</option>
          <option value="policy">Policy</option>
        </select>
      </div>

      {moduleType !== 'video' && (
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
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
        <input
          type="number"
          {...register('duration', { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Required Roles</label>
        <div className="mt-2 space-y-2">
          {(['staff', 'ned'] as UserRole[]).map((role) => (
            <div key={role} className="flex items-center">
              <input
                type="checkbox"
                {...register('requiredRoles')}
                value={role}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="ml-2 text-sm text-gray-700 capitalize">{role}</label>
            </div>
          ))}
        </div>
      </div>

      {moduleType === 'video' ? (
        <div>
          <label className="block text-sm font-medium text-gray-700">Video URL</label>
          <input
            type="url"
            {...register('sections.0.videoUrl')}
            placeholder="https://vimeo.com/..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.sections?.[0]?.videoUrl && (
            <p className="mt-1 text-sm text-red-600">{errors.sections[0].videoUrl.message}</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Content Sections</h3>
            <button
              type="button"
              onClick={() => append({ title: '', content: '', videoUrl: '' })}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-medium">Section {index + 1}</h4>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Section Title</label>
                <input
                  type="text"
                  {...register(`sections.${index}.title`)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <textarea
                  {...register(`sections.${index}.content`)}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Video URL (optional)</label>
                <input
                  type="url"
                  {...register(`sections.${index}.videoUrl`)}
                  placeholder="https://vimeo.com/..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save Module
        </button>
      </div>
    </form>
  );
}