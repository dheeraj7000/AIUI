import { pgTable, uuid, varchar, jsonb, real, timestamp, index } from 'drizzle-orm/pg-core';
import { graphNodeTypeEnum, graphEdgeTypeEnum } from './enums';
import { projects } from './projects';

export const graphNodes = pgTable(
  'graph_nodes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    nodeType: graphNodeTypeEnum('node_type').notNull(),
    label: varchar('label', { length: 255 }).notNull(),
    metadata: jsonb('metadata').default({}).notNull(),
    positionX: real('position_x').default(0).notNull(),
    positionY: real('position_y').default(0).notNull(),
    color: varchar('color', { length: 20 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('graph_nodes_project_id_idx').on(table.projectId),
    index('graph_nodes_project_type_idx').on(table.projectId, table.nodeType),
  ]
);

export const graphEdges = pgTable(
  'graph_edges',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    sourceNodeId: uuid('source_node_id')
      .notNull()
      .references(() => graphNodes.id, { onDelete: 'cascade' }),
    targetNodeId: uuid('target_node_id')
      .notNull()
      .references(() => graphNodes.id, { onDelete: 'cascade' }),
    edgeType: graphEdgeTypeEnum('edge_type').notNull(),
    label: varchar('label', { length: 255 }),
    metadata: jsonb('metadata').default({}).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('graph_edges_project_id_idx').on(table.projectId),
    index('graph_edges_source_node_id_idx').on(table.sourceNodeId),
    index('graph_edges_target_node_id_idx').on(table.targetNodeId),
  ]
);
