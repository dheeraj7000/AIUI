import type { AiuiMcpServer } from '../server';
import { registerGetProjectContext } from './get-project-context';
import { registerResolveTag } from './resolve-tag';
import { registerComponentTools } from './components';
import { registerThemeTokens } from './theme-tokens';
import { registerAssetManifest } from './asset-manifest';
import { registerValidateUiOutput } from './validate-ui-output';
import { registerDesignMemory } from './design-memory';
import { registerDesignStudio } from './design-studio';

/**
 * Register all AIUI tools with the MCP server.
 */
export function registerAllTools(server: AiuiMcpServer) {
  registerGetProjectContext(server);
  registerResolveTag(server);
  registerComponentTools(server);
  registerThemeTokens(server);
  registerAssetManifest(server);
  registerValidateUiOutput(server);
  registerDesignMemory(server);
  registerDesignStudio(server);
}
