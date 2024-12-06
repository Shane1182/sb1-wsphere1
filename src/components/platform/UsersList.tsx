import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types/auth';
import { getTenantUsers, deleteUserAccount, updateUser, UserOperationError } from '../../services/users';
import { UserInviteForm } from '../admin/UserInviteForm';
import { PasswordResetModal } from './PasswordResetModal';
import { Users, UserPlus, Trash2, PencilLine, X, Key } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface UsersListProps {
  tenantId: string;
}

interface ReauthModalProps {
  onConfirm: (email: string, password: string) => void;
  onCancel: () => void;
}

function ReauthModal({ onConfirm, onCancel }: ReauthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    onConfirm(email, password);
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium mb-4">Re-authenticate Required</h3>
        <p className="text-sm text-gray-600 mb-4">
          For security reasons, please re-enter your credentials to complete this action.
        </p>
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function UsersList({ tenantId }: UsersListProps) {
  const currentUser = useAuthStore((state) => state.user);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [passwordResetUser, setPasswordResetUser] = useState<User | null>(null);
  const [showReauth, setShowReauth] = useState(false);
  const [pendingDeleteUser, setPendingDeleteUser] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, [tenantId]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const tenantUsers = await getTenantUsers(tenantId);
      setUsers(tenantUsers);
      setError(null);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await deleteUserAccount(userId);
      setUsers(users.filter(user => user.id !== userId));
      setPendingDeleteUser(null);
    } catch (err) {
      if (err instanceof UserOperationError && err.requiresReauth) {
        setPendingDeleteUser(userId);
        setShowReauth(true);
      } else {
        console.error('Error deleting user:', err);
        setError('Failed to delete user');
      }
    }
  };

  const handleReauthConfirm = async (email: string, password: string) => {
    if (!pendingDeleteUser) return;

    try {
      await deleteUserAccount(pendingDeleteUser, { email, password });
      setUsers(users.filter(user => user.id !== pendingDeleteUser));
      setShowReauth(false);
      setPendingDeleteUser(null);
    } catch (err) {
      console.error('Error after reauth:', err);
      setError('Failed to delete user after re-authentication');
    }
  };

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      await updateUser(userId, updates);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      ));
      setEditingUser(null);
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user');
    }
  };

  const getAvailableRoles = (): UserRole[] => {
    if (currentUser?.role === 'platform_admin') {
      return ['platform_admin', 'tenant_admin', 'staff', 'ned'];
    }
    if (currentUser?.role === 'tenant_admin') {
      return ['tenant_admin', 'staff', 'ned'];
    }
    return ['staff', 'ned'];
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-medium text-gray-900">Users</h2>
        </div>
        <button
          onClick={() => setShowInviteForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Invite User
        </button>
      </div>

      {showInviteForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Invite New User</h3>
              <button
                onClick={() => setShowInviteForm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <UserInviteForm
              tenantId={tenantId}
              availableRoles={getAvailableRoles()}
              onSuccess={() => {
                setShowInviteForm(false);
                loadUsers();
              }}
              onCancel={() => setShowInviteForm(false)}
            />
          </div>
        </div>
      )}

      {passwordResetUser && (
        <PasswordResetModal
          user={passwordResetUser}
          onClose={() => setPasswordResetUser(null)}
        />
      )}

      {showReauth && (
        <ReauthModal
          onConfirm={handleReauthConfirm}
          onCancel={() => {
            setShowReauth(false);
            setPendingDeleteUser(null);
          }}
        />
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user.id} className="px-4 py-4">
              {editingUser?.id === user.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      {getAvailableRoles().map((role) => (
                        <option key={role} value={role}>
                          {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setEditingUser(null)}
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdateUser(user.id, {
                        name: editingUser.name,
                        role: editingUser.role,
                      })}
                      className="px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                      {user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    {user.role === 'tenant_admin' && currentUser?.role === 'platform_admin' && (
                      <button
                        onClick={() => setPasswordResetUser(user)}
                        className="text-gray-400 hover:text-blue-500"
                        title="Reset Password"
                      >
                        <Key className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => setEditingUser(user)}
                      className="text-gray-400 hover:text-blue-500"
                    >
                      <PencilLine className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}