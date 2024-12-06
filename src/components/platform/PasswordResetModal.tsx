import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Eye, EyeOff, Key } from 'lucide-react';
import { resetUserPassword } from '../../services/users';

const passwordSchema = z.object({
  action: z.enum(['reset', 'set']),
  password: z.string().optional(),
});

type PasswordFormData = z.infer<typeof passwordSchema>;

interface PasswordResetModalProps {
  user: {
    id: string;
    email: string;
    name: string;
  };
  onClose: () => void;
}

export function PasswordResetModal({ user, onClose }: PasswordResetModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      action: 'reset',
    },
  });

  const action = watch('action');

  const onSubmit = async (data: PasswordFormData) => {
    try {
      setLoading(true);
      setError(null);

      await resetUserPassword(user.email);
      
      setSuccess(true);
    } catch (err) {
      console.error('Error resetting password:', err);
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Reset Password</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
            Password reset email has been sent to {user.email}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <p className="text-sm text-gray-500 mb-4">
                Reset password for {user.name} ({user.email})
              </p>
              
              <p className="text-sm text-gray-500">
                A password reset link will be sent to the user's email address.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <Key className="h-4 w-4 mr-2" />
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}