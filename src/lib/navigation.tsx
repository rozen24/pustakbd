"use client";

import NextLink from "next/link";
import {
  usePathname,
  useRouter,
  useParams as useNextParams,
  useSearchParams as useNextSearchParams,
} from "next/navigation";
import {
  useCallback,
  useEffect,
  type ComponentProps,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";

type LinkProps = Omit<ComponentProps<typeof NextLink>, "href"> & {
  to?: string;
  href?: string;
};

export function Link({ to, href, children, ...rest }: LinkProps) {
  return (
    <NextLink href={href ?? to ?? "/"} {...rest}>
      {children}
    </NextLink>
  );
}

type NavLinkClassName = string | ((args: { isActive: boolean; isPending: boolean }) => string | undefined);

export function NavLink({
  to,
  href,
  end,
  className,
  children,
  ...rest
}: Omit<LinkProps, "className"> & {
  end?: boolean;
  className?: NavLinkClassName;
  children?: ReactNode;
}) {
  const pathname = usePathname();
  const target = href ?? to ?? "/";
  const path = target.split("?")[0] ?? "/";
  const isActive = end
    ? pathname === path
    : path === "/"
      ? pathname === "/"
      : pathname === path || pathname.startsWith(`${path}/`);
  const resolved = typeof className === "function" ? className({ isActive, isPending: false }) : className;

  return (
    <NextLink href={target} className={resolved} {...rest}>
      {children}
    </NextLink>
  );
}

export function useNavigate() {
  const router = useRouter();
  return useCallback(
    (to: string | number, options?: { replace?: boolean; state?: unknown }) => {
      void options?.state;
      if (typeof to === "number") {
        if (to < 0) router.back();
        else router.forward();
        return;
      }
      if (options?.replace) router.replace(to);
      else router.push(to);
    },
    [router],
  );
}

export function useParams<T extends Record<string, string | undefined> = Record<string, string>>() {
  return useNextParams() as T;
}

export function useSearchParams() {
  const searchParams = useNextSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const setParams = useCallback(
    (next: URLSearchParams | Record<string, string>) => {
      const sp = next instanceof URLSearchParams ? next : new URLSearchParams(next);
      const query = sp.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  return [searchParams, setParams] as const;
}

export function useLocation() {
  const pathname = usePathname();
  const searchParams = useNextSearchParams();
  const search = searchParams.toString();
  return {
    pathname,
    search: search ? `?${search}` : "",
    hash: "",
    state: null as unknown,
    key: pathname,
  };
}

export function Navigate({
  to,
  replace,
}: {
  to: string;
  replace?: boolean;
}) {
  const router = useRouter();
  useEffect(() => {
    if (replace) router.replace(to);
    else router.push(to);
  }, [replace, router, to]);
  return null;
}

export type { CSSProperties, MouseEvent };
