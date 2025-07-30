import {
	F as sanitize_props,
	G as spread_props,
	I as slot,
	R as head,
	S as attr,
	O as escape_html,
	T as ensure_array_like,
	E as pop,
	A as push
} from '../../../chunks/index.js';
import '../../../chunks/config.js';
import { I as Icon } from '../../../chunks/Icon.js';
function External_link($$payload, $$props) {
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
		['path', { d: 'M15 3h6v6' }],
		['path', { d: 'M10 14 21 3' }],
		[
			'path',
			{
				d: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'
			}
		]
	];
	Icon(
		$$payload,
		spread_props([
			{ name: 'external-link' },
			$$sanitized_props,
			{
				/**
				 * @component @name ExternalLink
				 * @description Lucide SVG icon component, renders SVG Element with children.
				 *
				 * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTUgM2g2djYiIC8+CiAgPHBhdGggZD0iTTEwIDE0IDIxIDMiIC8+CiAgPHBhdGggZD0iTTE4IDEzdjZhMiAyIDAgMCAxLTIgMkg1YTIgMiAwIDAgMS0yLTJWOGEyIDIgMCAwIDEgMi0yaDYiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/external-link
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
function Plus($$payload, $$props) {
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
		['path', { d: 'M5 12h14' }],
		['path', { d: 'M12 5v14' }]
	];
	Icon(
		$$payload,
		spread_props([
			{ name: 'plus' },
			$$sanitized_props,
			{
				/**
				 * @component @name Plus
				 * @description Lucide SVG icon component, renders SVG Element with children.
				 *
				 * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNNSAxMmgxNCIgLz4KICA8cGF0aCBkPSJNMTIgNXYxNCIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/plus
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
function Trash_2($$payload, $$props) {
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
		['path', { d: 'M10 11v6' }],
		['path', { d: 'M14 11v6' }],
		['path', { d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6' }],
		['path', { d: 'M3 6h18' }],
		['path', { d: 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' }]
	];
	Icon(
		$$payload,
		spread_props([
			{ name: 'trash-2' },
			$$sanitized_props,
			{
				/**
				 * @component @name Trash2
				 * @description Lucide SVG icon component, renders SVG Element with children.
				 *
				 * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTAgMTF2NiIgLz4KICA8cGF0aCBkPSJNMTQgMTF2NiIgLz4KICA8cGF0aCBkPSJNMTkgNnYxNGEyIDIgMCAwIDEtMiAySDdhMiAyIDAgMCAxLTItMlY2IiAvPgogIDxwYXRoIGQ9Ik0zIDZoMTgiIC8+CiAgPHBhdGggZD0iTTggNlY0YTIgMiAwIDAgMSAyLTJoNGEyIDIgMCAwIDEgMiAydjIiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/trash-2
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
function _page($$payload, $$props) {
	push();
	let addons = [];
	let newAddonUrl = '';
	head($$payload, ($$payload2) => {
		$$payload2.title = `<title>Settings - Stremio</title>`;
	});
	$$payload.out.push(
		`<div class="pt-20 px-6"><div class="max-w-4xl mx-auto"><h1 class="text-3xl font-bold text-white mb-8">Settings</h1> <section class="bg-gray-800 rounded-lg p-6 mb-8"><h2 class="text-xl font-semibold text-white mb-4">Add Stremio Addon</h2> <div class="space-y-4"><div><label for="addon-url" class="block text-sm font-medium text-gray-300 mb-2">Addon URL</label> <div class="flex space-x-3"><input id="addon-url" type="url"${attr('value', newAddonUrl)} placeholder="https://example.com/addon" class="flex-1 bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"/> <button${attr('disabled', !newAddonUrl.trim(), true)} class="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">`
	);
	Plus($$payload, { class: 'w-4 h-4' });
	$$payload.out.push(`<!----> <span>${escape_html('Add')}</span></button></div> `);
	{
		$$payload.out.push('<!--[!-->');
	}
	$$payload.out.push(
		`<!--]--></div> <div class="text-sm text-gray-400"><p class="mb-2">Enter the base URL of a Stremio addon. Examples:</p> <ul class="list-disc list-inside space-y-1 ml-4"><li>https://addon-example.com</li> <li>https://my-addon.herokuapp.com</li></ul></div></div></section> <section class="bg-gray-800 rounded-lg p-6"><h2 class="text-xl font-semibold text-white mb-4">Installed Addons (${escape_html(addons.length)})</h2> `
	);
	if (addons.length === 0) {
		$$payload.out.push('<!--[-->');
		$$payload.out.push(
			`<div class="text-center py-8"><div class="text-gray-400 mb-2">No addons installed</div> <div class="text-gray-500 text-sm">Add your first addon above to get started</div></div>`
		);
	} else {
		$$payload.out.push('<!--[!-->');
		const each_array = ensure_array_like(addons);
		$$payload.out.push(`<div class="space-y-4"><!--[-->`);
		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let addon = each_array[index];
			$$payload.out.push(
				`<div class="border border-gray-700 rounded-lg p-4"><div class="flex items-start justify-between"><div class="flex-1"><div class="flex items-center space-x-3 mb-2"><h3 class="text-lg font-medium text-white">${escape_html(addon.manifest.name)}</h3> <span class="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">v${escape_html(addon.manifest.version)}</span></div> <p class="text-gray-300 text-sm mb-3">${escape_html(addon.manifest.description)}</p> <div class="flex flex-wrap gap-2 mb-3"><div class="text-xs"><span class="text-gray-400">Types:</span> <span class="text-white ml-1">${escape_html(addon.manifest.types.join(', '))}</span></div> <div class="text-xs"><span class="text-gray-400">Resources:</span> <span class="text-white ml-1">${escape_html(addon.manifest.resources.join(', '))}</span></div></div> `
			);
			if (addon.manifest.catalogs && addon.manifest.catalogs.length > 0) {
				$$payload.out.push('<!--[-->');
				$$payload.out.push(
					`<div class="text-xs mb-2"><span class="text-gray-400">Catalogs:</span> <span class="text-white ml-1">${escape_html(addon.manifest.catalogs.map((c) => c.name).join(', '))}</span></div>`
				);
			} else {
				$$payload.out.push('<!--[!-->');
			}
			$$payload.out.push(
				`<!--]--> <div class="flex items-center space-x-4 text-xs text-gray-400"><a${attr('href', addon.baseUrl)} target="_blank" rel="noopener noreferrer" class="flex items-center space-x-1 hover:text-white transition-colors">`
			);
			External_link($$payload, { class: 'w-3 h-3' });
			$$payload.out.push(
				`<!----> <span>View Addon</span></a></div></div> <button class="text-gray-400 hover:text-red-400 transition-colors p-2" title="Remove addon">`
			);
			Trash_2($$payload, { class: 'w-4 h-4' });
			$$payload.out.push(`<!----></button></div></div>`);
		}
		$$payload.out.push(`<!--]--></div>`);
	}
	$$payload.out.push(
		`<!--]--></section> <section class="mt-8 text-sm text-gray-400"><h3 class="text-white font-medium mb-2">How to use Stremio Addons</h3> <ul class="list-disc list-inside space-y-1 ml-4"><li>Find Stremio addons from the official community or create your own</li> <li>Each addon provides different types of content (movies, series, etc.)</li> <li>Addons must implement the Stremio addon protocol</li> <li>Content availability depends on the addon's implementation</li></ul></section></div></div>`
	);
	pop();
}
export { _page as default };
