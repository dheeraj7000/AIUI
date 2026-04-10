'use client';

import { useAuth } from '@/providers/AuthProvider';
import { ProjectPicker } from '@/components/ui/ProjectPicker';

export function ApplyToProject({ stylePackId }: { stylePackId: string }) {
  const { session } = useAuth();

  const handleSelect = async (projectId: string) => {
    if (!session) throw new Error('Not signed in');
    const res = await fetch(`/api/projects/${projectId}/style-pack`, {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stylePackId }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? 'Failed to apply style pack');
    }
  };

  return <ProjectPicker action="Apply to Project" onSelect={handleSelect} />;
}
