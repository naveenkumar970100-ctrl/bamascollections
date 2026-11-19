'use client';

import React from 'react';
import NextLink from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export function useNavigate() {
  const router = useRouter();
  return (options: any) => {
    if (typeof options === 'string') {
      router.push(options);
    } else if (options && typeof options === 'object') {
      const path = options.to || options.href || '/';
      router.push(path);
    }
  };
}

export function useRouterState({ select }: { select?: (state: any) => any } = {}) {
  const pathname = usePathname();
  const search = typeof window !== 'undefined' ? window.location.search : '';
  const state = {
    location: {
      pathname: pathname || '/',
      search,
      href: pathname || '/',
    },
  };
  return select ? select(state) : state;
}

export function Link({
  to,
  href,
  children,
  activeOptions,
  activeProps,
  className,
  ...props
}: any) {
  const pathname = usePathname();
  const target = href || to || '#';
  const isExact = activeOptions?.exact ?? false;
  const isActive = isExact
    ? pathname === target
    : (target !== '/' ? pathname?.startsWith(target) : pathname === '/');
  const activeClass = isActive && activeProps?.className ? activeProps.className : '';
  const finalClassName = [className, activeClass].filter(Boolean).join(' ');

  return (
    <NextLink href={target} className={finalClassName || undefined} {...props}>
      {children}
    </NextLink>
  );
}

export default Link;
