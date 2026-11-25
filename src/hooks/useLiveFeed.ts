import { useEffect } from 'react';
import { sourceNow } from '@/ui/data/clock';
import { startLiveFeed } from '@/ui/data/liveFeed';
import type { Notice } from '@/ui/data/notices';

export function useLiveFeed(
  onReview: (update: (count: number) => number) => void,
  onNotice: (notice: Notice) => void,
) {
  useEffect(() => startLiveFeed((event, index) => {
    onReview((count) => count + 1);
    onNotice({
      id: `live-${Date.now()}-${index}`,
      icon: 'star',
      tone: 'good',
      title: `New ${event.stars}-star review`,
      body: event.body,
      at: sourceNow(),
      read: false,
      href: '#/reviews/inbox',
    });
  }), [onReview, onNotice]);
}
