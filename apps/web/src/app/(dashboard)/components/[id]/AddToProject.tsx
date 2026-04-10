'use client';

import { useAuth } from '@/providers/AuthProvider';
import { ProjectPicker } from '@/components/ui/ProjectPicker';

export function AddToProject({ recipeId }: { recipeId: string }) {
  const { session } = useAuth();

  const handleSelect = async (projectId: string) => {
    if (!session) throw new Error('Not signed in');

    // First get current selection
    const getRes = await fetch(`/api/projects/${projectId}/components`, {
      credentials: 'same-origin',
    });

    let existing: string[] = [];
    if (getRes.ok) {
      const data = await getRes.json();
      // API returns an array of ComponentSelectionItem directly
      const items = Array.isArray(data) ? data : (data.components ?? []);
      existing = items.map((c: { id: string }) => c.id);
    }

    // Add this recipe if not already present
    if (existing.includes(recipeId)) {
      return; // Already added
    }

    const res = await fetch(`/api/projects/${projectId}/components`, {
      method: 'PUT',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ componentRecipeIds: [...existing, recipeId] }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? 'Failed to add component');
    }
  };

  return <ProjectPicker action="Add to Project" onSelect={handleSelect} />;
}
