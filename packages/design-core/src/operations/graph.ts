import { eq } from 'drizzle-orm';
import { graphNodes, graphEdges, stylePacks, styleTokens, componentRecipes } from '../db/schema';
import type { Database } from '../db';

/**
 * Fetch the full graph (nodes + edges) for a project.
 */
export async function getProjectGraph(db: Database, projectId: string) {
  const [nodes, edges] = await Promise.all([
    db.select().from(graphNodes).where(eq(graphNodes.projectId, projectId)),
    db.select().from(graphEdges).where(eq(graphEdges.projectId, projectId)),
  ]);

  return { nodes, edges };
}

/**
 * Create a single graph node.
 */
export async function createGraphNode(
  db: Database,
  data: {
    projectId: string;
    nodeType: (typeof graphNodes.$inferInsert)['nodeType'];
    label: string;
    metadata?: Record<string, unknown>;
    positionX?: number;
    positionY?: number;
    color?: string;
  }
) {
  const [node] = await db
    .insert(graphNodes)
    .values({
      projectId: data.projectId,
      nodeType: data.nodeType,
      label: data.label,
      metadata: data.metadata ?? {},
      positionX: data.positionX ?? 0,
      positionY: data.positionY ?? 0,
      color: data.color,
    })
    .returning();

  return node;
}

/**
 * Create a single graph edge.
 */
export async function createGraphEdge(
  db: Database,
  data: {
    projectId: string;
    sourceNodeId: string;
    targetNodeId: string;
    edgeType: (typeof graphEdges.$inferInsert)['edgeType'];
    label?: string;
    metadata?: Record<string, unknown>;
  }
) {
  const [edge] = await db
    .insert(graphEdges)
    .values({
      projectId: data.projectId,
      sourceNodeId: data.sourceNodeId,
      targetNodeId: data.targetNodeId,
      edgeType: data.edgeType,
      label: data.label,
      metadata: data.metadata ?? {},
    })
    .returning();

  return edge;
}

/**
 * Delete a graph node by ID. Edges are cascade-deleted by the FK constraint.
 */
export async function deleteGraphNode(db: Database, nodeId: string) {
  const [deleted] = await db.delete(graphNodes).where(eq(graphNodes.id, nodeId)).returning();

  return deleted ?? null;
}

/**
 * Delete a graph edge by ID.
 */
export async function deleteGraphEdge(db: Database, edgeId: string) {
  const [deleted] = await db.delete(graphEdges).where(eq(graphEdges.id, edgeId)).returning();

  return deleted ?? null;
}

/**
 * Auto-generate a graph from existing project data.
 * Clears any existing graph, then creates nodes for style packs, tokens,
 * and component recipes, along with edges connecting them.
 */
export async function autoGenerateGraph(db: Database, projectId: string) {
  // Clear existing graph for this project
  await db.delete(graphEdges).where(eq(graphEdges.projectId, projectId));
  await db.delete(graphNodes).where(eq(graphNodes.projectId, projectId));

  // Query project's style packs, tokens, and component recipes
  const packs = await db.select().from(stylePacks);
  const tokens = await db.select().from(styleTokens);
  const recipes = await db.select().from(componentRecipes);

  const nodeMap = new Map<string, string>();

  // Create nodes for style packs
  for (const pack of packs) {
    const [node] = await db
      .insert(graphNodes)
      .values({
        projectId,
        nodeType: 'style-pack',
        label: pack.name,
        metadata: { stylePackId: pack.id, slug: pack.slug, category: pack.category },
      })
      .returning();
    nodeMap.set(`pack:${pack.id}`, node.id);
  }

  // Create nodes for tokens
  for (const token of tokens) {
    const [node] = await db
      .insert(graphNodes)
      .values({
        projectId,
        nodeType: 'token',
        label: token.tokenKey,
        metadata: {
          tokenId: token.id,
          tokenType: token.tokenType,
          tokenValue: token.tokenValue,
        },
      })
      .returning();
    nodeMap.set(`token:${token.id}`, node.id);
  }

  // Create nodes for component recipes
  for (const recipe of recipes) {
    const [node] = await db
      .insert(graphNodes)
      .values({
        projectId,
        nodeType: 'component',
        label: recipe.name,
        metadata: { recipeId: recipe.id, type: recipe.type, slug: recipe.slug },
      })
      .returning();
    nodeMap.set(`recipe:${recipe.id}`, node.id);
  }

  // Create edges: style-pack --contains--> token
  for (const token of tokens) {
    const packNodeId = nodeMap.get(`pack:${token.stylePackId}`);
    const tokenNodeId = nodeMap.get(`token:${token.id}`);
    if (packNodeId && tokenNodeId) {
      await db.insert(graphEdges).values({
        projectId,
        sourceNodeId: packNodeId,
        targetNodeId: tokenNodeId,
        edgeType: 'contains',
      });
    }
  }

  // Create edges: component --styled-by--> style-pack
  for (const recipe of recipes) {
    if (recipe.stylePackId) {
      const recipeNodeId = nodeMap.get(`recipe:${recipe.id}`);
      const packNodeId = nodeMap.get(`pack:${recipe.stylePackId}`);
      if (recipeNodeId && packNodeId) {
        await db.insert(graphEdges).values({
          projectId,
          sourceNodeId: recipeNodeId,
          targetNodeId: packNodeId,
          edgeType: 'styled-by',
        });
      }
    }
  }

  return getProjectGraph(db, projectId);
}
