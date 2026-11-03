import { describe, expect, it, vi } from 'vitest';
import { filterPrivatePreviewActionProps } from '../apps/preview/src/lib/preview-action-props';

describe('private preview action props', () => {
  it('passes native React events and declared callbacks without leaking unknown handlers onto DOM roots', () => {
    const actions = {
      onClick: vi.fn(),
      onChange: vi.fn(),
      onClose: vi.fn(),
      onSelect: vi.fn(),
      onConfirm: vi.fn(),
      onPageChange: vi.fn(),
      onAction: vi.fn(),
    };

    expect(filterPrivatePreviewActionProps(actions, new Set(['onAction']))).toEqual({
      onClick: actions.onClick,
      onChange: actions.onChange,
      onClose: actions.onClose,
      onSelect: actions.onSelect,
      onAction: actions.onAction,
    });
  });
});
