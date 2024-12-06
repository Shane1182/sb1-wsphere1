export interface PlatformMessage {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success';
  targetRoles: string[];
  active: boolean;
  createdAt: Date;
  expiresAt?: Date;
}