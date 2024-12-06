import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { UseFormRegister } from 'react-hook-form';

export const passwordSchema = {
  min: 8,
  patterns: {
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    number: /[0-9]/,
    special: /[^A-Za-z0-9]/,
  },
};

interface PasswordManagementProps {
  register: UseFormRegister<any>;
  errors: any;
  passwordOption: string;
  generatedPassword: string | null;
}

export function PasswordManagement({ 
  register, 
  errors, 
  passwordOption,
  generatedPassword 
}: PasswordManagementProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
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
    </>
  );
}