export type RegistryItemType =
  | 'registry:ui'
  | 'registry:component'
  | 'registry:block'
  | 'registry:hook'
  | 'registry:lib';

export interface RegistryFile {
  path: string;
  content: string;
  type: RegistryItemType;
  target?: string;
}

export interface RegistryItem {
  $schema?: string;
  name: string;
  type: RegistryItemType;
  title?: string;
  description?: string;
  dependencies?: string[];
  devDependencies?: string[];
  registryDependencies?: string[];
  files: RegistryFile[];
  categories?: string[];
  meta?: Record<string, unknown>;
}

export interface RegistryIndexItem {
  name: string;
  type: RegistryItemType;
  title?: string;
  description?: string;
  dependencies?: string[];
  devDependencies?: string[];
  registryDependencies?: string[];
  categories?: string[];
}

export interface RegistryIndex {
  $schema?: string;
  name: string;
  homepage: string;
  items: RegistryIndexItem[];
}
