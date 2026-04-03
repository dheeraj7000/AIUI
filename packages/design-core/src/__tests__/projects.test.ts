import { describe, it, expect } from 'vitest';
import { generateProjectSlug } from '../operations/projects';
import {
  createProjectSchema,
  updateProjectSchema,
  listProjectsSchema,
} from '../validation/project';

describe('generateProjectSlug', () => {
  it('converts name to lowercase hyphenated slug', () => {
    expect(generateProjectSlug('My Awesome App')).toBe('my-awesome-app');
  });

  it('removes special characters', () => {
    expect(generateProjectSlug('Hello World! @2024')).toBe('hello-world-2024');
  });

  it('collapses multiple hyphens', () => {
    expect(generateProjectSlug('a - - b')).toBe('a-b');
  });

  it('trims leading and trailing hyphens', () => {
    expect(generateProjectSlug(' --hello-- ')).toBe('hello');
  });

  it('handles all-special-character input', () => {
    expect(generateProjectSlug('!!!@@@###')).toBe('');
  });

  it('handles numeric names', () => {
    expect(generateProjectSlug('Project 123')).toBe('project-123');
  });

  it('handles mixed case', () => {
    expect(generateProjectSlug('NextJS React APP')).toBe('nextjs-react-app');
  });
});

describe('createProjectSchema', () => {
  it('accepts valid input', () => {
    const result = createProjectSchema.safeParse({
      orgId: '550e8400-e29b-41d4-a716-446655440000',
      name: 'My Project',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.frameworkTarget).toBe('nextjs-tailwind');
    }
  });

  it('rejects empty name', () => {
    const result = createProjectSchema.safeParse({
      orgId: '550e8400-e29b-41d4-a716-446655440000',
      name: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects name over 100 chars', () => {
    const result = createProjectSchema.safeParse({
      orgId: '550e8400-e29b-41d4-a716-446655440000',
      name: 'x'.repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid orgId', () => {
    const result = createProjectSchema.safeParse({
      orgId: 'not-a-uuid',
      name: 'My Project',
    });
    expect(result.success).toBe(false);
  });

  it('accepts react-tailwind framework target', () => {
    const result = createProjectSchema.safeParse({
      orgId: '550e8400-e29b-41d4-a716-446655440000',
      name: 'My Project',
      frameworkTarget: 'react-tailwind',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.frameworkTarget).toBe('react-tailwind');
    }
  });

  it('rejects invalid framework target', () => {
    const result = createProjectSchema.safeParse({
      orgId: '550e8400-e29b-41d4-a716-446655440000',
      name: 'My Project',
      frameworkTarget: 'vue-tailwind',
    });
    expect(result.success).toBe(false);
  });

  it('accepts optional description', () => {
    const result = createProjectSchema.safeParse({
      orgId: '550e8400-e29b-41d4-a716-446655440000',
      name: 'My Project',
      description: 'A great project',
    });
    expect(result.success).toBe(true);
  });
});

describe('updateProjectSchema', () => {
  it('accepts partial updates', () => {
    const result = updateProjectSchema.safeParse({ name: 'New Name' });
    expect(result.success).toBe(true);
  });

  it('accepts empty object (no changes)', () => {
    const result = updateProjectSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('rejects invalid framework target', () => {
    const result = updateProjectSchema.safeParse({ frameworkTarget: 'invalid' });
    expect(result.success).toBe(false);
  });
});

describe('listProjectsSchema', () => {
  it('accepts orgId with defaults', () => {
    const result = listProjectsSchema.safeParse({
      orgId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(50);
      expect(result.data.offset).toBe(0);
    }
  });

  it('accepts custom pagination', () => {
    const result = listProjectsSchema.safeParse({
      orgId: '550e8400-e29b-41d4-a716-446655440000',
      limit: 10,
      offset: 20,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(10);
      expect(result.data.offset).toBe(20);
    }
  });

  it('rejects missing orgId', () => {
    const result = listProjectsSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('coerces string numbers for pagination', () => {
    const result = listProjectsSchema.safeParse({
      orgId: '550e8400-e29b-41d4-a716-446655440000',
      limit: '25',
      offset: '5',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(25);
      expect(result.data.offset).toBe(5);
    }
  });
});
