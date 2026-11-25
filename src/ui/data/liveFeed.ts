/** Port of the source demo's timed review feed (`xs()` in the source bundle). */

type FeedItem = { stars: number; title: string; text: string };
type FeedEvent = {
  stars: number;
  title: string;
  text: string;
  body: string;
  job: string;
};

function seededRandom(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 1831565813) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pros = [
  ['Marcus Okafor', 'electric'], ['Hannah Brett', 'carpentry'], ['Dev Malhotra', 'plumbing'],
  ['Sofia Lindgren', 'painting'], ['Callum Reid', 'tiling'], ['Amara Nwosu', 'electric'],
  ['Pete Gallagher', 'roofing'], ['Lena Kowalski', 'garden'], ['Rafael Duarte', 'locks'],
  ['Grace Whitfield', 'plumbing'], ['Idris Bello', 'carpentry'], ['Mei Chen', 'painting'],
  ['Tom Hargreaves', 'electric'], ['Yusuf Kaya', 'tiling'], ['Nell Ashworth', 'garden'],
  ['Bilal Hussain', 'roofing'], ['Freya Dunn', 'carpentry'], ['Oscar Mendes', 'plumbing'],
].map(([name, trade], index) => ({
  id: `p${index + 1}`,
  name,
  trade,
  status: index === 13 ? 'paused' : 'live',
}));

const firstNames = 'Ellie.James.Noor.Liam.Ana.Femi.Chloe.Arjun.Beth.Kofi.Isla.Mateo.Ruby.Hamza.Leah.Owen.Siobhan.Daniel.Aaliyah.George.Martha.Theo.Imani.Lucas.Holly.Samir.Phoebe.Ewan.Nadia.Jack.Esme.Kai'.split('.');
const lastNames = 'Turner.Holloway.Siddiqui.Byrne.Costa.Adeyemi.Marsh.Nair.Lowe.Mensah.Grant.Rossi.Fletcher.Ali.Kerr.Pryce.Doyle.Webb.Okoro.Hale.Quinn.Barker.Juma.Moreau.Platt.Haddad.Lister.Munro.Volkova.Dyer.Harper.Sato'.split('.');
const clients = firstNames.map((first, index) => ({ id: `c${index + 1}`, name: `${first} ${lastNames[index]}` }));

const jobs: Record<string, string> = {
  electric: 'Kitchen rewiring',
  carpentry: 'Built-in wardrobe',
  plumbing: 'Boiler service',
  painting: 'Hallway repaint',
  tiling: 'Shower retile',
  roofing: 'Slipped slates',
  garden: 'Hedge reshape',
  locks: 'Lock change',
};

const feed: FeedItem[] = [
  { stars: 5, title: 'Quick, clean, friendly', text: 'In and out in two hours, everything works and he even fixed the sticky hall door for free.' },
  { stars: 4, title: 'Good job overall', text: 'Nice work and fair price. Arrived a little later than planned but called ahead.' },
  { stars: 5, title: 'Our go-to from now on', text: 'Third time using her, never disappoints. Fair, tidy and honest about what needs doing.' },
];

/** Starts the source feed: first review after 95s, then one every 140s. */
export function startLiveFeed(onEvent: (event: FeedEvent, index: number) => void) {
  if (/[?&]record\b/.test(window.location.search)) return () => {};
  const random = seededRandom(4242);
  const picks = feed.map((item) => {
    const pro = pros[Math.floor(random() * pros.length)];
    const client = clients[Math.floor(random() * clients.length)];
    return { ...item, body: `${client.name} reviewed ${pro.name}.`, job: jobs[pro.trade] };
  });

  let index = 0;
  let timer = 0;
  const tick = () => {
    const event = picks[index];
    if (!event) return;
    onEvent(event, index++);
    if (index < picks.length) timer = window.setTimeout(tick, 140_000);
  };
  timer = window.setTimeout(tick, 95_000);
  return () => window.clearTimeout(timer);
}
