import type { AiuiMcpServer } from '../server';
import { registerGetProjectContext } from './get-project-context';
import { registerThemeTokens } from './theme-tokens';
import { registerAssetManifest } from './asset-manifest';
import { registerValidateUiOutput } from './validate-ui-output';
import { registerDesignMemory } from './design-memory';
import { registerDesignStudio } from './design-studio';
import { registerWriteTokens } from './write-tokens';
import { registerInitProject } from './init-project';
import { registerFixCompliance } from './fix-compliance';
import { registerResetProject } from './reset-project';
import { registerUndoTokens } from './undo-tokens';
import { registerAuditDesignPrinciples } from './audit-design';
import { registerSuggestPromotion } from './suggest-promotion';
import { registerPromotePattern } from './promote-pattern';
import { registerAdoptCodebase } from './adopt-codebase';

/**
 * Register all AIUI tools with the MCP server.
 *
 * After the style-pack/component scope cut: `list_components`,
 * `get_component_recipe`, `apply_style_pack`, `create_style_pack` are gone.
 * Tokens are project-scoped, edited via `update_tokens`, snapshot via
 * `sync_design_memory` / `get_design_memory`.
 */
export function registerAllTools(server: AiuiMcpServer) {
  // Read tools
  registerGetProjectContext(server);
  registerThemeTokens(server);
  registerAssetManifest(server);
  registerValidateUiOutput(server);
  registerDesignMemory(server);
  registerDesignStudio(server);
  registerAuditDesignPrinciples(server);
  registerSuggestPromotion(server);

  // Write tools
  registerWriteTokens(server);
  registerInitProject(server);
  registerFixCompliance(server);
  registerResetProject(server);
  registerUndoTokens(server);
  registerPromotePattern(server);
  registerAdoptCodebase(server);
}
