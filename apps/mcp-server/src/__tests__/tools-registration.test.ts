import { describe, it, expect } from 'vitest';
import { registerWriteStylePack } from '../tools/write-style-pack';
import { registerWriteTokens } from '../tools/write-tokens';
import { registerWriteProject } from '../tools/write-project';
import { registerInitProject } from '../tools/init-project';
import { registerFixCompliance } from '../tools/fix-compliance';
import { registerResetProject } from '../tools/reset-project';
import { registerUndoTokens } from '../tools/undo-tokens';
import { registerGetProjectContext } from '../tools/get-project-context';
import { registerResolveTag } from '../tools/resolve-tag';
import { registerComponentTools } from '../tools/components';
import { registerThemeTokens } from '../tools/theme-tokens';
import { registerAssetManifest } from '../tools/asset-manifest';
import { registerValidateUiOutput } from '../tools/validate-ui-output';
import { registerDesignMemory } from '../tools/design-memory';
import { registerDesignStudio } from '../tools/design-studio';
import { registerAllTools } from '../tools/index';

describe('Tools registration exports', () => {
  it('registerWriteStylePack is a function', () => {
    expect(typeof registerWriteStylePack).toBe('function');
  });

  it('registerWriteTokens is a function', () => {
    expect(typeof registerWriteTokens).toBe('function');
  });

  it('registerWriteProject is a function', () => {
    expect(typeof registerWriteProject).toBe('function');
  });

  it('registerInitProject is a function', () => {
    expect(typeof registerInitProject).toBe('function');
  });

  it('registerFixCompliance is a function', () => {
    expect(typeof registerFixCompliance).toBe('function');
  });

  it('registerResetProject is a function', () => {
    expect(typeof registerResetProject).toBe('function');
  });

  it('registerUndoTokens is a function', () => {
    expect(typeof registerUndoTokens).toBe('function');
  });

  it('registerGetProjectContext is a function', () => {
    expect(typeof registerGetProjectContext).toBe('function');
  });

  it('registerResolveTag is a function', () => {
    expect(typeof registerResolveTag).toBe('function');
  });

  it('registerComponentTools is a function', () => {
    expect(typeof registerComponentTools).toBe('function');
  });

  it('registerThemeTokens is a function', () => {
    expect(typeof registerThemeTokens).toBe('function');
  });

  it('registerAssetManifest is a function', () => {
    expect(typeof registerAssetManifest).toBe('function');
  });

  it('registerValidateUiOutput is a function', () => {
    expect(typeof registerValidateUiOutput).toBe('function');
  });

  it('registerDesignMemory is a function', () => {
    expect(typeof registerDesignMemory).toBe('function');
  });

  it('registerDesignStudio is a function', () => {
    expect(typeof registerDesignStudio).toBe('function');
  });

  it('registerAllTools is a function', () => {
    expect(typeof registerAllTools).toBe('function');
  });

  it('all registration functions accept exactly 1 argument (server)', () => {
    const fns = [
      registerWriteStylePack,
      registerWriteTokens,
      registerWriteProject,
      registerInitProject,
      registerFixCompliance,
      registerResetProject,
      registerUndoTokens,
      registerGetProjectContext,
      registerResolveTag,
      registerComponentTools,
      registerThemeTokens,
      registerAssetManifest,
      registerValidateUiOutput,
      registerDesignMemory,
      registerDesignStudio,
      registerAllTools,
    ];

    for (const fn of fns) {
      expect(fn.length).toBe(1);
    }
  });
});
