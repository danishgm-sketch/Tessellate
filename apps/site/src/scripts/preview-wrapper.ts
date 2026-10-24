import {
  isParentToPreviewMessage,
  isPreviewToParentMessage,
  type ParentToPreviewMessage,
} from '@tessellate/catalog/protocol';

const frame = document.querySelector<HTMLIFrameElement>('[data-tessellate-preview-frame]');

if (frame) {
  const params = new URLSearchParams(window.location.search);
  const resourceParams = new URLSearchParams();
  for (const key of ['resource', 'variant', 'theme', 'device', 'reducedMotion']) {
    const value = params.get(key);
    if (value !== null) resourceParams.set(key, value);
  }

  const pendingMessages = new Map<ParentToPreviewMessage['type'], ParentToPreviewMessage>();
  let contentReady = false;

  frame.addEventListener('load', () => {
    contentReady = true;
    for (const message of pendingMessages.values()) frame.contentWindow?.postMessage(message, '*');
    pendingMessages.clear();
  });

  window.addEventListener('message', (event: MessageEvent<unknown>) => {
    if (event.source === frame.contentWindow && event.origin === 'null' && isPreviewToParentMessage(event.data)) {
      window.parent.postMessage(event.data, '*');
      return;
    }

    if (
      event.source !== window.parent ||
      (event.origin !== window.location.origin && event.origin !== 'null') ||
      !isParentToPreviewMessage(event.data)
    ) return;
    if (contentReady) {
      frame.contentWindow?.postMessage(event.data, '*');
    } else {
      pendingMessages.set(event.data.type, event.data);
    }
  });

  frame.src = `/preview-content/?${resourceParams.toString()}`;
}
