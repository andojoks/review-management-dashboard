import { useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import gsap from 'gsap';
import { Button, Icon } from '@/ui/components/primitives';

export interface SignInProps {
  onEnter: () => void;
}

export function SignIn({ onEnter }: SignInProps) {
  const card = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState('odile@handwell.co');
  const [password, setPassword] = useState('five-stars-26');
  const [busy, setBusy] = useState(false);

  useLayoutEffect(() => {
    if (!card.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(card.current.children, { opacity: 0, y: 18 }, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.06,
      ease: 'expo.out',
      clearProps: 'transform,opacity',
    });
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || !email.includes('@') || password.length < 4) return;
    setBusy(true);
    window.setTimeout(() => {
      if (!card.current) return;
      gsap.to(card.current, { scale: 0.96, opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: onEnter });
    }, 700);
  };

  return (
    <div className="signin" role="dialog" aria-modal="true" aria-label="Sign in to Raveno">
      <form className="signin__card" ref={card} onSubmit={submit}>
        <span className="mark mark--lg"><Icon name="logo" /></span>
        <h1>Sign in to Raveno</h1>
        <p>Handwell’s review desk. In this demo the details are filled in — press Sign in.</p>
        <label className="field">
          <span>Email</span>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
        </label>
        <Button type="submit" variant="primary" className="btn--block" aria-busy={busy}>Sign in</Button>
        <span className="signin__date">Monday, 9 November</span>
      </form>
    </div>
  );
}
