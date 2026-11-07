const STANDARD_REACT_EVENT_PROPS = new Set(['onChange', 'onClick', 'onClose', 'onSelect']);

export function filterPrivatePreviewActionProps<T extends Record<string, unknown>>(
  actions: T,
  declaredProps: ReadonlySet<string>,
): Partial<T> {
  return Object.fromEntries(
    Object.entries(actions).filter(([name]) => STANDARD_REACT_EVENT_PROPS.has(name) || declaredProps.has(name)),
  ) as Partial<T>;
}
