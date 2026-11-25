export type ToastAction = (message: string) => void;

export function announce(action: ToastAction, message: string) {
  action(message);
}
