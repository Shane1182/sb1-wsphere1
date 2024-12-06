import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, UserPlus, Eye, EyeOff } from 'lucide-react';
import { inviteTenantAdmin } from '../../services/users';

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  passwordOption: z.enum(['generate', 'set', 'user']),
  password: passwordSchema.optional(),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface TenantAdminInviteFormProps {
  tenantId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TenantAdminInviteForm({ 
  tenantId, 
  onSuccess, 
  onCancel 
}: TenantAdminInviteFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      passwordOption: 'user',
    },
  });

  const passwordOption = watch('passwordOption');

  const generateSecurePassword = () => {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
    let password = '';
    
    // Ensure at least one of each required character type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*()_+'[Math.floor(Math.random() * 12)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const onSubmit = async (data: InviteFormData) => {
    try {
      let password: string | undefined;

      switch (data.passwordOption) {
        case 'generate':
          password = generateSecurePassword();
          setGeneratedPassword(password);
          break;
        case 'set':
          password = data.password;
          break;
        case 'user':
          password = undefined;
          break;
      }

      await inviteTenantAdmin(data.email, data.name, tenantId, password);
      reset();
      setGeneratedPassword(null);
      onSuccess?.();
    } catch (error) {
      console.error('Error inviting tenant admin:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
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
        <label className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          type="email"
          {...register('email')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Password Option
        </label>
        <div className="mt-2 space-y-2">
          <div className="flex items-center">
            <input
              type="radio"
              {...register('passwordOption')}
              value="user"
              id="user-set"
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="user-set" className="ml-2 text-sm text-gray-700">
              Let user set their password via email link
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              {...register('passwordOption')}
              value="generate"
              id="generate"
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="generate" className="ml-2 text-sm text-gray-700">
              Generate secure password
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              {...register('passwordOption')}
              value="set"
              id="set"
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="set" className="ml-2 text-sm text-gray-700">
              Set password manually
            </label>
          </div>
        </div>
      </div>

      {passwordOption === 'set' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="mt-1 relative">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 px-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
      )}

      {generatedPassword && (
        <div className="rounded-md bg-blue-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Generated Password
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Please save this password securely: {generatedPassword}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              Inviting Admin...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Admin
            </>
          )}
        </button>
      </div>
    </form>
  );
}