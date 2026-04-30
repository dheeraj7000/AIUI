import { eq } from 'drizzle-orm';
import { graphNodes, graphEdges, styleTokens } from '../db/schema';
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

export async function deleteGraphNode(db: Database, nodeId: string) {
  const [deleted] = await db.delete(graphNodes).where(eq(graphNodes.id, nodeId)).returning();
  return deleted ?? null;
}

export async function deleteGraphEdge(db: Database, edgeId: string) {
  const [deleted] = await db.delete(graphEdges).where(eq(graphEdges.id, edgeId)).returning();
  return deleted ?? null;
}

/**
 * Auto-generate a project's graph from its design tokens.
 * After the pack/recipe scope cut, the graph is a flat token list — one node
 * per project token. Pages/components are handled by a future user-driven graph.
 */
export async function autoGenerateGraph(db: Database, projectId: string) {
  await db.delete(graphEdges).where(eq(graphEdges.projectId, projectId));
  await db.delete(graphNodes).where(eq(graphNodes.projectId, projectId));

  const tokens = await db.select().from(styleTokens).where(eq(styleTokens.projectId, projectId));

  for (const token of tokens) {
    await db.insert(graphNodes).values({
      projectId,
      nodeType: 'token',
      label: token.tokenKey,
      metadata: {
        tokenId: token.id,
        tokenType: token.tokenType,
        tokenValue: token.tokenValue,
      },
    });
  }

  return getProjectGraph(db, projectId);
}
