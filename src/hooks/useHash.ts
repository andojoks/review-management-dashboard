import { useEffect, useState } from 'react';

export function useHash() {
  const [hash, setHash] = useState(() => window.location.hash || '#/overview');

  useEffect(() => {
    const update = () => setHash(window.location.hash || '#/overview');
    window.addEventListener('hashchange', update);
    if (!window.location.hash) window.location.hash = '#/overview';
    return () => window.removeEventListener('hashchange', update);
  }, []);

  return hash;
}
