import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, UserPlus } from 'lucide-react';
import { createUser } from '../../services/users';
import { UserRole } from '../../types/auth';
import { PasswordManagement, passwordSchema } from '../common/PasswordManagement';
import { generateSecurePassword } from '../../utils/password';

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['platform_admin', 'tenant_admin', 'staff', 'ned']),
  passwordOption: z.enum(['generate', 'set', 'user']),
  password: z.string()
    .min(passwordSchema.min, `Password must be at least ${passwordSchema.min} characters`)
    .regex(passwordSchema.patterns.uppercase, 'Password must contain at least one uppercase letter')
    .regex(passwordSchema.patterns.lowercase, 'Password must contain at least one lowercase letter')
    .regex(passwordSchema.patterns.number, 'Password must contain at least one number')
    .regex(passwordSchema.patterns.special, 'Password must contain at least one special character')
    .optional()
    .or(z.literal('')),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface UserInviteFormProps {
  tenantId: string;
  availableRoles?: UserRole[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function UserInviteForm({ 
  tenantId, 
  availableRoles = ['staff', 'ned'],
  onSuccess, 
  onCancel 
}: UserInviteFormProps) {
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
      role: 'staff',
    },
  });

  const passwordOption = watch('passwordOption');

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

      await createUser({
        email: data.email,
        name: data.name,
        role: data.role,
        tenantId,
        password,
      });

      reset();
      setGeneratedPassword(null);
      onSuccess?.();
    } catch (error) {
      console.error('Error inviting user:', error);
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
          Role
        </label>
        <select
          {...register('role')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {availableRoles.map((role) => (
            <option key={role} value={role}>
              {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          ))}
        </select>
        {errors.role && (
          <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
        )}
      </div>

      <PasswordManagement
        register={register}
        errors={errors}
        passwordOption={passwordOption}
        generatedPassword={generatedPassword}
      />

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
              Inviting User...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite User
            </>
          )}
        </button>
      </div>
    </form>
  );
}