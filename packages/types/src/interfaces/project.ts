export interface Project {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description?: string;
  frameworkTarget: 'nextjs-tailwind' | 'react-tailwind';
  activeStylePackId?: string;
  createdAt: Date;
  updatedAt: Date;
}
