import { Progress } from '../types/content';
import { mockProgress } from '../data/mockProgress';

export async function getUserProgress(userId: string): Promise<Progress[]> {
  return mockProgress.filter(p => p.userId === userId);
}

export async function updateProgress(
  userId: string,
  moduleId: string,
  progress: Partial<Progress>
): Promise<void> {
  // In a real app, this would update the database
  return Promise.resolve();
}