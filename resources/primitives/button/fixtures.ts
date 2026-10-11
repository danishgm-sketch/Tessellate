import type { ButtonProps } from './index.js';

export interface ButtonFixtureConfig {
  variant: 'quiet' | 'expressive' | 'nocturne';
  title: string;
  description: string;
  primaryProps: ButtonProps;
  secondaryProps: ButtonProps;
  ghostProps: ButtonProps;
  dangerProps: ButtonProps;
}

export const quietFixture: ButtonFixtureConfig = {
  variant: 'quiet',
  title: 'Quiet',
  description: 'Monochrome, restrained, minimal contrast for high data density shells.',
  primaryProps: {
    variant: 'quiet',
    intent: 'primary',
    size: 'md',
    children: 'Confirm',
  },
  secondaryProps: {
    variant: 'quiet',
    intent: 'secondary',
    size: 'md',
    children: 'Cancel',
  },
  ghostProps: {
    variant: 'quiet',
    intent: 'ghost',
    size: 'md',
    children: 'Dismiss',
  },
  dangerProps: {
    variant: 'quiet',
    intent: 'danger',
    size: 'md',
    children: 'Delete node',
  },
};

export const expressiveFixture: ButtonFixtureConfig = {
  variant: 'expressive',
  title: 'Expressive',
  description: 'Cobalt primary, tactile elevation and hover lift, spring-like feel.',
  primaryProps: {
    variant: 'expressive',
    intent: 'primary',
    size: 'md',
    children: 'Deploy interface',
  },
  secondaryProps: {
    variant: 'expressive',
    intent: 'secondary',
    size: 'md',
    children: 'Save draft',
  },
  ghostProps: {
    variant: 'expressive',
    intent: 'ghost',
    size: 'md',
    children: 'Learn more',
  },
  dangerProps: {
    variant: 'expressive',
    intent: 'danger',
    size: 'md',
    children: 'Discard project',
  },
};

export const nocturneFixture: ButtonFixtureConfig = {
  variant: 'nocturne',
  title: 'Nocturne',
  description: 'Obsidian dark canvas with crisp luminescence for precision tooling.',
  primaryProps: {
    variant: 'nocturne',
    intent: 'primary',
    size: 'md',
    children: 'Execute mutation',
  },
  secondaryProps: {
    variant: 'nocturne',
    intent: 'secondary',
    size: 'md',
    children: 'Inspect AST',
  },
  ghostProps: {
    variant: 'nocturne',
    intent: 'ghost',
    size: 'md',
    children: 'Collapse',
  },
  dangerProps: {
    variant: 'nocturne',
    intent: 'danger',
    size: 'md',
    children: 'Purge cache',
  },
};

export const buttonFixtures = {
  quiet: quietFixture,
  expressive: expressiveFixture,
  nocturne: nocturneFixture,
};
