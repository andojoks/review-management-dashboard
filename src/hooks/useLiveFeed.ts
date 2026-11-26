import { useEffect, useRef } from 'react';
import { useAddNotice, useAddReview, useBootstrap, useConfig } from '@/stores';
import { sourceNow } from '@/ui/data/clock';
import { startLiveFeed } from '@/ui/data/liveFeed';
import type { Notice } from '@/types';

export function useLiveFeed(_onNotice: (notice: Notice) => void) {
  const state = useBootstrap();
  const config = useConfig();
  const addReview = useAddReview();
  const addNotice = useAddNotice();

  const stateRef = useRef(state);
  const configRef = useRef(config);
  const addReviewRef = useRef(addReview);
  const addNoticeRef = useRef(addNotice);
  stateRef.current = state;
  configRef.current = config;
  addReviewRef.current = addReview;
  addNoticeRef.current = addNotice;

  useEffect(() => startLiveFeed((event, index) => {
    const live = configRef.current.liveFeed;
    addReviewRef.current.mutate({
      id: `R-${live.startIndex + index}`,
      pro: event.proId,
      client: event.clientId,
      stars: event.stars,
      title: event.title,
      text: event.text,
      t: sourceNow(),
      channel: live.channel as 'app',
      status: 'new',
      job: event.job,
      helpful: 0,
      photos: 0,
    });
    const notice: Notice = {
      id: `live-${Date.now()}-${index}`,
      icon: live.notice.icon,
      tone: live.notice.tone,
      title: `New ${event.stars}-star review`,
      body: event.body,
      at: sourceNow(),
      read: false,
      href: live.notice.href,
    };
    addNoticeRef.current.mutate(notice);
  }, {
    config: configRef.current.liveFeed,
    pros: stateRef.current.pros,
    clients: stateRef.current.clients,
  }), []);
}
