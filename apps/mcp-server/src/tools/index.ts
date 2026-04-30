import type { AiuiMcpServer } from '../server';
import { registerGetProjectContext } from './get-project-context';
import { registerComponentTools } from './components';
import { registerThemeTokens } from './theme-tokens';
import { registerAssetManifest } from './asset-manifest';
import { registerValidateUiOutput } from './validate-ui-output';
import { registerDesignMemory } from './design-memory';
import { registerDesignStudio } from './design-studio';
import { registerWriteStylePack } from './write-style-pack';
import { registerWriteTokens } from './write-tokens';
import { registerWriteProject } from './write-project';
import { registerInitProject } from './init-project';
import { registerFixCompliance } from './fix-compliance';
import { registerResetProject } from './reset-project';
import { registerUndoTokens } from './undo-tokens';
import { registerAuditDesignPrinciples } from './audit-design';
import { registerSuggestPromotion } from './suggest-promotion';

/**
 * Register all AIUI tools with the MCP server.
 */
export function registerAllTools(server: AiuiMcpServer) {
  // Read tools
  registerGetProjectContext(server);
  registerComponentTools(server);
  registerThemeTokens(server);
  registerAssetManifest(server);
  registerValidateUiOutput(server);
  registerDesignMemory(server);
  registerDesignStudio(server);
  registerAuditDesignPrinciples(server);
  registerSuggestPromotion(server);

  // Write tools
  registerWriteStylePack(server);
  registerWriteTokens(server);
  registerWriteProject(server);
  registerInitProject(server);
  registerFixCompliance(server);
  registerResetProject(server);
  registerUndoTokens(server);
}
