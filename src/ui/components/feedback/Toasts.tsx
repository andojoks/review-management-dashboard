import { Icon } from '@/ui/components/primitives';

export interface ToastItem {
  id: number;
  message: string;
}

export function Toasts({ items }: { items: ToastItem[] }) {
  return (
    <div className="toasts" aria-live="polite">
      {items.map((toast) => (
        <div className="toast" key={toast.id}>
          <Icon name="check" />
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
