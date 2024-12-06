export interface RequiredReading {
  id: string;
  title: string;
  description: string;
  documentUrl: string;
  assignedRoles: ('staff' | 'ned')[];
  priority: 'high' | 'medium' | 'low';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}