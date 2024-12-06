export type GovernanceCategory = {
  id: string;
  name: string;
  description?: string;
  order: number;
};

export interface GovernanceDocument {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryName?: string;
  fileUrl: string;
  uploadedAt: Date;
  lastUpdated: Date;
  fileType: 'pdf' | 'doc' | 'docx';
  fileSize: number;
}