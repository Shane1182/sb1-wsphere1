import { Progress } from '../types/content';

export const mockProgress: Progress[] = [
  {
    userId: '2', // staff user
    moduleId: '1',
    completed: true,
    completedAt: new Date('2024-03-01'),
    score: 100,
  },
];