'use client';

import { useLayoutEffect } from 'react';

export default function ScrollToTop({ routeKey }: { routeKey: string }) {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [routeKey]);

  return null;
}
