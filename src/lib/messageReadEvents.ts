export const MESSAGE_READ_EVENT = 'r8estate:messages-read';

export const emitMessagesRead = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(MESSAGE_READ_EVENT));
};

export const subscribeToMessagesRead = (callback: () => void) => {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handler = () => callback();
  window.addEventListener(MESSAGE_READ_EVENT, handler);

  return () => {
    window.removeEventListener(MESSAGE_READ_EVENT, handler);
  };
};
