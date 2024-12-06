import { Module, Progress } from '../types/content';
import { mockModules } from '../data/mockModules';

export async function getModules(role: string): Promise<Module[]> {
  return mockModules.filter(module => module.requiredRoles.includes(role as any));
}

export async function getModule(moduleId: string): Promise<Module | null> {
  const module = mockModules.find(m => m.id === moduleId);
  return module || null;
}

export async function createModule(module: Omit<Module, 'id'>): Promise<string> {
  // In a real app, this would add to the database
  // For now, just return a mock ID
  return 'mock-module-id';
}

export async function updateModule(moduleId: string, module: Partial<Module>): Promise<void> {
  // In a real app, this would update the database
  return Promise.resolve();
}