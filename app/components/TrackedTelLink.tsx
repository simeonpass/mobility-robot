import type {ReactNode} from 'react';
import {useTrackPhoneClick} from '~/lib/use-lead-tracking';

export function TrackedTelLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const trackPhoneClick = useTrackPhoneClick();

  return (
    <a className={className} href={href} onClick={trackPhoneClick}>
      {children}
    </a>
  );
}
