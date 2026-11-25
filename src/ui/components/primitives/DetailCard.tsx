import type { ReactNode } from 'react';
import { Card } from './Card';
import { CardHeader } from './CardHeader';

export interface DetailCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** A card with the source `chead` header and arbitrary detail content. */
export function DetailCard({ title, subtitle, action, className = '', children }: DetailCardProps) {
  return (
    <Card className={className}>
      <CardHeader title={title} subtitle={subtitle} action={action} />
      {children}
    </Card>
  );
}

export interface DetailListCardProps<T> {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  listClassName: string;
  as?: 'ol' | 'ul' | 'div';
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  empty?: ReactNode;
}

/** Detail card for data-driven lists such as best pros, queue rows and feeds. */
export function DetailListCard<T>({
  title,
  subtitle,
  action,
  className = '',
  listClassName,
  as: Tag = 'ul',
  items,
  renderItem,
  empty,
}: DetailListCardProps<T>) {
  return (
    <DetailCard title={title} subtitle={subtitle} action={action} className={className}>
      {items.length ? (
        <Tag className={listClassName}>{items.map((item, index) => renderItem(item, index))}</Tag>
      ) : empty}
    </DetailCard>
  );
}
