type DynamicRoutes = {
	"/series/[id]": { id: string };
	"/watch/[id]": { id: string };
	"/watch/[...rest]": { rest: string }
};

type Layouts = {
	"/": { id?: string; rest?: string };
	"/api": undefined;
	"/api/health": undefined;
	"/api/proxy": undefined;
	"/debug": undefined;
	"/movies": undefined;
	"/search": undefined;
	"/series": { id?: string };
	"/series/[id]": { id: string };
	"/settings": undefined;
	"/tv-shows": undefined;
	"/watch": { id?: string; rest?: string };
	"/watch/[id]": { id: string };
	"/watch/[...rest]": { rest: string }
};

export type RouteId = "/" | "/api" | "/api/health" | "/api/proxy" | "/debug" | "/movies" | "/search" | "/series" | "/series/[id]" | "/settings" | "/tv-shows" | "/watch" | "/watch/[id]" | "/watch/[...rest]";

export type RouteParams<T extends RouteId> = T extends keyof DynamicRoutes ? DynamicRoutes[T] : Record<string, never>;

export type LayoutParams<T extends RouteId> = Layouts[T] | Record<string, never>;

export type Pathname = "/" | "/api" | "/api/health" | "/api/proxy" | "/debug" | "/movies" | "/search" | "/series" | `/series/${string}` & {} | "/settings" | "/tv-shows" | "/watch" | `/watch/${string}` & {};

export type ResolvedPathname = `${"" | `/${string}`}${Pathname}`;

export type Asset = "/favicon.svg";