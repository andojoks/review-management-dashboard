import { useBootstrap, useConfig } from './shared';

export function useInsightsData() {
  const state = useBootstrap();
  const config = useConfig();
  return {
    reviews: state.reviews,
    pros: state.pros,
    team: state.team,
    history: state.history,
    tradeLabels: config.pros.tradeLabels,
    ratingBuckets: config.insights.ratingBuckets,
  };
}
