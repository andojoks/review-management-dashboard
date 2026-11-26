/** Port of the source demo's timed review feed (`xs()` in the source bundle). */
import type { Client, FeedEvent, LiveFeedConfig, Pro } from '@/types';

function seededRandom(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 1831565813) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface LiveFeedInput {
  config: LiveFeedConfig;
  pros: Pro[];
  clients: Client[];
}

/** Starts the source feed: first review after 95s, then one every 140s. */
export function startLiveFeed(
  onEvent: (event: FeedEvent, index: number) => void,
  { config, pros, clients }: LiveFeedInput,
) {
  if (/[?&]record\b/.test(window.location.search)) return () => {};
  const random = seededRandom(4242);
  const picks = config.items.map((item) => {
    const pro = pros[Math.floor(random() * pros.length)];
    const client = clients[Math.floor(random() * clients.length)];
    return {
      ...item,
      body: `${client.name} reviewed ${pro.name}.`,
      job: config.jobsByTrade[pro.trade] ?? '',
      proId: pro.id,
      clientId: client.id,
    } as FeedEvent;
  });

  let index = 0;
  let timer = 0;
  const tick = () => {
    const event = picks[index];
    if (!event) return;
    onEvent(event, index++);
    if (index < picks.length) timer = window.setTimeout(tick, config.interval);
  };
  timer = window.setTimeout(tick, config.firstDelay);
  return () => window.clearTimeout(timer);
}
