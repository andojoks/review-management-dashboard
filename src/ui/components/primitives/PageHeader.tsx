import { Fragment, useLayoutEffect, useRef, type ReactNode } from 'react';
import { motionEnabled, splitTitle } from '@/ui/motion/interactions';

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  eyebrow?: string;
}

export function PageHeader({ title, description, actions, eyebrow }: PageHeaderProps) {
  const heading = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    if (!motionEnabled()) return;
    splitTitle(heading.current);
  }, [title]);

  const words = title.trim().split(' ');

  return (
    <header className="phead">
      <div className="phead__text">
        {eyebrow ? <div className="eyebrow" style={{ marginBottom: 8 }}>{eyebrow}</div> : null}
        <h1 ref={heading} data-text={title} data-split={title} aria-label={title}>
          {words.map((word, wordIndex) => (
            <Fragment key={`${word}-${wordIndex}`}>
              <span className="word" aria-hidden="true">
                {[...word].map((character, index) => (
                  <span className="ch" key={`${character}-${index}`}>{character}</span>
                ))}
              </span>
              {wordIndex < words.length - 1 ? ' ' : null}
            </Fragment>
          ))}
        </h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="phead__actions">{actions}</div> : null}
    </header>
  );
}
