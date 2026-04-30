import { describe, it, expect } from 'vitest';
import { registerWriteTokens } from '../tools/write-tokens';
import { registerInitProject } from '../tools/init-project';
import { registerFixCompliance } from '../tools/fix-compliance';
import { registerResetProject } from '../tools/reset-project';
import { registerUndoTokens } from '../tools/undo-tokens';
import { registerGetProjectContext } from '../tools/get-project-context';
import { registerThemeTokens } from '../tools/theme-tokens';
import { registerAssetManifest } from '../tools/asset-manifest';
import { registerValidateUiOutput } from '../tools/validate-ui-output';
import { registerDesignMemory } from '../tools/design-memory';
import { registerDesignStudio } from '../tools/design-studio';
import { registerAuditDesignPrinciples } from '../tools/audit-design';
import { registerSuggestPromotion } from '../tools/suggest-promotion';
import { registerAllTools } from '../tools/index';

describe('Tools registration exports', () => {
  it('registerWriteTokens is a function', () => {
    expect(typeof registerWriteTokens).toBe('function');
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

  it('registerAuditDesignPrinciples is a function', () => {
    expect(typeof registerAuditDesignPrinciples).toBe('function');
  });

  it('registerSuggestPromotion is a function', () => {
    expect(typeof registerSuggestPromotion).toBe('function');
  });

  it('registerAllTools is a function', () => {
    expect(typeof registerAllTools).toBe('function');
  });

  it('all registration functions accept exactly 1 argument (server)', () => {
    const fns = [
      registerWriteTokens,
      registerInitProject,
      registerFixCompliance,
      registerResetProject,
      registerUndoTokens,
      registerGetProjectContext,
      registerThemeTokens,
      registerAssetManifest,
      registerValidateUiOutput,
      registerDesignMemory,
      registerDesignStudio,
      registerAuditDesignPrinciples,
      registerSuggestPromotion,
      registerAllTools,
    ];

    for (const fn of fns) {
      expect(fn.length).toBe(1);
    }
  });
});
