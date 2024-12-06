import { User } from '../types/auth';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@bbrc.com',
    password: 'admin1234', // In a real app, passwords would be hashed
    name: 'Admin User',
    role: 'admin',
  },
  {
    id: '2',
    email: 'staff@bbrc.com',
    password: 'staff1234',
    name: 'Staff Member',
    role: 'staff',
  },
  {
    id: '3',
    email: 'ned@bbrc.com',
    password: 'ned12345',
    name: 'NED Member',
    role: 'ned',
  },
];