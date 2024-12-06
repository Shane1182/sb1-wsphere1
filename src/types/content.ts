export type ContentType = 'video' | 'pdf' | 'quiz' | 'assessment' | 'policy';

export interface Module {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  content?: string;
  videoUrl?: string;
  duration: number;
  requiredRoles: UserRole[];
  sections: ModuleSection[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModuleSection {
  id: string;
  title: string;
  content?: string;
  videoUrl?: string;
  completed?: boolean;
  order: number;
}