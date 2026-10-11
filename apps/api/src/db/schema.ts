import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// 1. Better Auth: user
export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('emailVerified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
});

// 2. Better Auth: session
export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

// 3. Better Auth: account (GitHub OAuth only in V1)
export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: integer('accessTokenExpiresAt', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refreshTokenExpiresAt', { mode: 'timestamp' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
});

// 4. Better Auth: verification
export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }),
});

// 5. User Profiles
export const profiles = sqliteTable('profiles', {
  userId: text('userId')
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  username: text('username').unique(),
  bio: text('bio'),
  avatarUrl: text('avatarUrl'),
  specialtyTags: text('specialtyTags'), // JSON array of string tags
  githubHandle: text('githubHandle'),
  isAvailableForWork: integer('isAvailableForWork').default(0),
  createdAt: text('createdAt').notNull(),
  updatedAt: text('updatedAt').notNull(),
});

// 6. Cloud Projects
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  currentRevision: integer('currentRevision').notNull().default(1),
  manifestJson: text('manifestJson').notNull(), // Validated ProjectManifest JSON
  isPublished: integer('isPublished').default(0),
  publishedSlug: text('publishedSlug').unique(),
  remixFromProjectId: text('remixFromProjectId'),
  createdAt: text('createdAt').notNull(),
  updatedAt: text('updatedAt').notNull(),
});

// 7. Project Revisions / Checkpoints
export const projectRevisions = sqliteTable('project_revisions', {
  id: text('id').primaryKey(),
  projectId: text('projectId')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  revisionNumber: integer('revisionNumber').notNull(),
  summary: text('summary').notNull(),
  manifestJson: text('manifestJson').notNull(),
  createdAt: text('createdAt').notNull(),
});

// 8. User Favorites (resource bookmarking)
export const favorites = sqliteTable('favorites', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  resourceSlug: text('resourceSlug').notNull(),
  createdAt: text('createdAt').notNull(),
});

// 9. User Collections
export const collections = sqliteTable('collections', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  isPublic: integer('isPublic').default(0),
  createdAt: text('createdAt').notNull(),
  updatedAt: text('updatedAt').notNull(),
});

// 10. Collection Items
export const collectionItems = sqliteTable('collection_items', {
  id: text('id').primaryKey(),
  collectionId: text('collectionId')
    .notNull()
    .references(() => collections.id, { onDelete: 'cascade' }),
  resourceSlug: text('resourceSlug').notNull(),
  createdAt: text('createdAt').notNull(),
});

// 11. Published Read-Only Projects
export const publishedProjects = sqliteTable('published_projects', {
  slug: text('slug').primaryKey(),
  projectId: text('projectId')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  manifestJson: text('manifestJson').notNull(),
  publishedAt: text('publishedAt').notNull(),
});

// 12. Creator External Links
export const creatorLinks = sqliteTable('creator_links', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  url: text('url').notNull(),
  createdAt: text('createdAt').notNull(),
});

// 13. Reports (abuse & content report trail)
export const reports = sqliteTable('reports', {
  id: text('id').primaryKey(),
  reporterUserId: text('reporterUserId'),
  targetType: text('targetType').notNull(),
  targetId: text('targetId').notNull(),
  reason: text('reason').notNull(),
  details: text('details'),
  status: text('status').notNull().default('pending'),
  createdAt: text('createdAt').notNull(),
});
