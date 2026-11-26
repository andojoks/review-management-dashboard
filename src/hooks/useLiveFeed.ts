import { useEffect } from 'react';
import { addReview } from '@/data/reviewStore';
import { sourceNow } from '@/ui/data/clock';
import { startLiveFeed } from '@/ui/data/liveFeed';
import type { Notice } from '@/ui/data/notices';

export function useLiveFeed(onNotice: (notice: Notice) => void) {
  useEffect(() => startLiveFeed((event, index) => {
    addReview({
      id: `R-${4821 + index}`,
      pro: event.proId,
      client: event.clientId,
      stars: event.stars,
      title: event.title,
      text: event.text,
      t: sourceNow(),
      channel: 'app',
      status: 'new',
      job: event.job,
      helpful: 0,
      photos: 0,
    });
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
  }), [onNotice]);
}
