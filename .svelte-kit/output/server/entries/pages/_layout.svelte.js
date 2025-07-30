import 'clsx';
import {
	F as sanitize_props,
	G as spread_props,
	I as slot,
	J as attr_class,
	K as store_get,
	M as unsubscribe_stores,
	E as pop,
	A as push
} from '../../chunks/index.js';
import { p as page } from '../../chunks/stores.js';
import { I as Icon } from '../../chunks/Icon.js';
import { S as Search } from '../../chunks/search.js';
function House($$payload, $$props) {
	const $$sanitized_props = sanitize_props($$props);
	/**
	 * @license lucide-svelte v0.534.0 - ISC
	 *
	 * ISC License
	 *
	 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
	 *
	 * Permission to use, copy, modify, and/or distribute this software for any
	 * purpose with or without fee is hereby granted, provided that the above
	 * copyright notice and this permission notice appear in all copies.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
	 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
	 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
	 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
	 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
	 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
	 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
	 *
	 */
	const iconNode = [
		['path', { d: 'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8' }],
		[
			'path',
			{
				d: 'M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'
			}
		]
	];
	Icon(
		$$payload,
		spread_props([
			{ name: 'house' },
			$$sanitized_props,
			{
				/**
				 * @component @name House
				 * @description Lucide SVG icon component, renders SVG Element with children.
				 *
				 * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTUgMjF2LThhMSAxIDAgMCAwLTEtMWgtNGExIDEgMCAwIDAtMSAxdjgiIC8+CiAgPHBhdGggZD0iTTMgMTBhMiAyIDAgMCAxIC43MDktMS41MjhsNy01Ljk5OWEyIDIgMCAwIDEgMi41ODIgMGw3IDUuOTk5QTIgMiAwIDAgMSAyMSAxMHY5YTIgMiAwIDAgMS0yIDJINWEyIDIgMCAwIDEtMi0yeiIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/house
				 * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
				 *
				 * @param {Object} props - Lucide icons props and any valid SVG attribute
				 * @returns {FunctionalComponent} Svelte component
				 *
				 */
				iconNode,
				children: ($$payload2) => {
					$$payload2.out.push(`<!---->`);
					slot($$payload2, $$props, 'default', {});
					$$payload2.out.push(`<!---->`);
				},
				$$slots: { default: true }
			}
		])
	);
}
function Settings($$payload, $$props) {
	const $$sanitized_props = sanitize_props($$props);
	/**
	 * @license lucide-svelte v0.534.0 - ISC
	 *
	 * ISC License
	 *
	 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
	 *
	 * Permission to use, copy, modify, and/or distribute this software for any
	 * purpose with or without fee is hereby granted, provided that the above
	 * copyright notice and this permission notice appear in all copies.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
	 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
	 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
	 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
	 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
	 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
	 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
	 *
	 */
	const iconNode = [
		[
			'path',
			{
				d: 'M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915'
			}
		],
		['circle', { cx: '12', cy: '12', r: '3' }]
	];
	Icon(
		$$payload,
		spread_props([
			{ name: 'settings' },
			$$sanitized_props,
			{
				/**
				 * @component @name Settings
				 * @description Lucide SVG icon component, renders SVG Element with children.
				 *
				 * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNOS42NzEgNC4xMzZhMi4zNCAyLjM0IDAgMCAxIDQuNjU5IDAgMi4zNCAyLjM0IDAgMCAwIDMuMzE5IDEuOTE1IDIuMzQgMi4zNCAwIDAgMSAyLjMzIDQuMDMzIDIuMzQgMi4zNCAwIDAgMCAwIDMuODMxIDIuMzQgMi4zNCAwIDAgMS0yLjMzIDQuMDMzIDIuMzQgMi4zNCAwIDAgMC0zLjMxOSAxLjkxNSAyLjM0IDIuMzQgMCAwIDEtNC42NTkgMCAyLjM0IDIuMzQgMCAwIDAtMy4zMi0xLjkxNSAyLjM0IDIuMzQgMCAwIDEtMi4zMy00LjAzMyAyLjM0IDIuMzQgMCAwIDAgMC0zLjgzMUEyLjM0IDIuMzQgMCAwIDEgNi4zNSA2LjA1MWEyLjM0IDIuMzQgMCAwIDAgMy4zMTktMS45MTUiIC8+CiAgPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMyIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/settings
				 * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
				 *
				 * @param {Object} props - Lucide icons props and any valid SVG attribute
				 * @returns {FunctionalComponent} Svelte component
				 *
				 */
				iconNode,
				children: ($$payload2) => {
					$$payload2.out.push(`<!---->`);
					slot($$payload2, $$props, 'default', {});
					$$payload2.out.push(`<!---->`);
				},
				$$slots: { default: true }
			}
		])
	);
}
function Header($$payload, $$props) {
	push();
	var $$store_subs;
	$$payload.out.push(
		`<header class="fixed top-0 w-full z-50 bg-gradient-to-b from-black/80 to-transparent"><nav class="flex items-center justify-between px-6 py-4"><div class="flex items-center space-x-8"><a href="/" class="text-red-600 font-bold text-2xl">STREMIO</a> <div class="hidden md:flex space-x-6"><a href="/"${attr_class(
			'text-white hover:text-gray-300 transition-colors',
			void 0,
			{
				'text-red-500': store_get(($$store_subs ??= {}), '$page', page).url.pathname === '/'
			}
		)}>`
	);
	House($$payload, { class: 'w-5 h-5' });
	$$payload.out.push(
		`<!----></a> <a href="/search"${attr_class(
			'text-white hover:text-gray-300 transition-colors',
			void 0,
			{
				'text-red-500': store_get(($$store_subs ??= {}), '$page', page).url.pathname === '/search'
			}
		)}>Search</a></div></div> <div class="flex items-center space-x-4"><a href="/search" class="text-white hover:text-gray-300 transition-colors md:hidden">`
	);
	Search($$payload, { class: 'w-5 h-5' });
	$$payload.out.push(
		`<!----></a> <a href="/settings" class="text-white hover:text-gray-300 transition-colors">`
	);
	Settings($$payload, { class: 'w-5 h-5' });
	$$payload.out.push(`<!----></a></div></nav></header>`);
	if ($$store_subs) unsubscribe_stores($$store_subs);
	pop();
}
function _layout($$payload, $$props) {
	let { children } = $$props;
	$$payload.out.push(`<div class="min-h-screen bg-gray-900">`);
	Header($$payload);
	$$payload.out.push(`<!----> <main>`);
	children($$payload);
	$$payload.out.push(`<!----></main></div>`);
}
export { _layout as default };
