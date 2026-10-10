import React from 'react';
import type { ResourceRendererMap } from './types.js';
import { Button } from '../../../resources/primitives/button/index.js';

export const DEFAULT_RESOURCE_RENDERERS: ResourceRendererMap = {
  button: Button as unknown as React.ComponentType<Record<string, unknown>>,
  'res_primitive_button_01': Button as unknown as React.ComponentType<Record<string, unknown>>,
};
