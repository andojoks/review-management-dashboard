import { buildOverviewData } from '@/ui/data/overview';
import { useBootstrap, useConfig } from './shared';

export function useOverviewData() {
  const state = useBootstrap();
  const config = useConfig();
  return buildOverviewData({
    userName: state.me.name,
    reviews: state.reviews,
    pros: state.pros,
    verifications: state.verifications,
    team: state.team,
    clients: state.clients,
    history: state.history,
    config: {
      channels: config.reviews.channels,
      channelColors: config.palette.channelColors,
      starMix: config.overview.starMix,
      heroCompare: config.overview.heroCompare,
      metrics: config.overview.metrics,
    },
  });
}
