-- 0001_initial.sql — Tessellate D1 Database Initial Schema
-- Better Auth tables and application domain tables

-- 1. Better Auth: user
CREATE TABLE IF NOT EXISTS user (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    emailVerified INTEGER NOT NULL DEFAULT 0,
    image TEXT,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
);

-- 2. Better Auth: session
CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY,
    expiresAt INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    ipAddress TEXT,
    userAgent TEXT,
    userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE
);

-- 3. Better Auth: account
CREATE TABLE IF NOT EXISTS account (
    id TEXT PRIMARY KEY,
    accountId TEXT NOT NULL,
    providerId TEXT NOT NULL,
    userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    accessToken TEXT,
    refreshToken TEXT,
    idToken TEXT,
    accessTokenExpiresAt INTEGER,
    refreshTokenExpiresAt INTEGER,
    scope TEXT,
    password TEXT,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
);

-- 4. Better Auth: verification
CREATE TABLE IF NOT EXISTS verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expiresAt INTEGER NOT NULL,
    createdAt INTEGER,
    updatedAt INTEGER
);

-- 5. User Profiles
CREATE TABLE IF NOT EXISTS profiles (
    userId TEXT PRIMARY KEY REFERENCES user(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    bio TEXT,
    avatarUrl TEXT,
    specialtyTags TEXT, -- JSON array of tags
    githubHandle TEXT,
    isAvailableForWork INTEGER DEFAULT 0,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
);

-- 6. Cloud Projects
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    currentRevision INTEGER NOT NULL DEFAULT 1,
    manifestJson TEXT NOT NULL,
    isPublished INTEGER DEFAULT 0,
    publishedSlug TEXT UNIQUE,
    remixFromProjectId TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
);

-- 7. Project Revisions / Checkpoints
CREATE TABLE IF NOT EXISTS project_revisions (
    id TEXT PRIMARY KEY,
    projectId TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    revisionNumber INTEGER NOT NULL,
    summary TEXT NOT NULL,
    manifestJson TEXT NOT NULL,
    createdAt TEXT NOT NULL
);

-- 8. User Favorites (resource bookmarks)
CREATE TABLE IF NOT EXISTS favorites (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    resourceSlug TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    UNIQUE(userId, resourceSlug)
);

-- 9. User Collections
CREATE TABLE IF NOT EXISTS collections (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    isPublic INTEGER DEFAULT 0,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
);

-- 10. Collection Items
CREATE TABLE IF NOT EXISTS collection_items (
    id TEXT PRIMARY KEY,
    collectionId TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    resourceSlug TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    UNIQUE(collectionId, resourceSlug)
);

-- 11. Published Read-Only Project Snapshots
CREATE TABLE IF NOT EXISTS published_projects (
    slug TEXT PRIMARY KEY,
    projectId TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    manifestJson TEXT NOT NULL,
    publishedAt TEXT NOT NULL
);

-- 12. Creator External Links
CREATE TABLE IF NOT EXISTS creator_links (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    createdAt TEXT NOT NULL
);

-- 13. Abuse / Content Reports
CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    reporterUserId TEXT,
    targetType TEXT NOT NULL,
    targetId TEXT NOT NULL,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    createdAt TEXT NOT NULL
);

-- Performance & Authorization Indexes
CREATE INDEX IF NOT EXISTS idx_projects_userId ON projects(userId);
CREATE INDEX IF NOT EXISTS idx_revisions_projectId ON project_revisions(projectId);
CREATE INDEX IF NOT EXISTS idx_favorites_userId ON favorites(userId);
CREATE INDEX IF NOT EXISTS idx_collections_userId ON collections(userId);
CREATE INDEX IF NOT EXISTS idx_collection_items_collectionId ON collection_items(collectionId);
