import '../chunks/DsnmJJEf.js';
import { i as Pt } from '../chunks/BYgivT0n.js';
import {
	i as O,
	j as q,
	a as h,
	d as St,
	p as Mt,
	o as Ut,
	f as b,
	h as Et,
	c as n,
	s as f,
	t as P,
	g as l,
	b as Ft,
	m as S,
	e as g,
	$ as Vt,
	k as u,
	r as o,
	n as T
} from '../chunks/DDdxbkju.js';
import { i as K } from '../chunks/pgvFQ5L2.js';
import { r as zt, e as Nt, a as Rt } from '../chunks/6UcpBOQV.js';
import { b as Ct } from '../chunks/EbTttirx.js';
import { c as It } from '../chunks/Dn2o612i.js';
import { I as B, s as D } from '../chunks/DsjntQP_.js';
import { l as G, s as J } from '../chunks/DWbhy1gE.js';
function Wt(m, a) {
	const e = G(a, ['children', '$$slots', '$$events', '$$legacy']);
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
	 */ const s = [
		['path', { d: 'M15 3h6v6' }],
		['path', { d: 'M10 14 21 3' }],
		['path', { d: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' }]
	];
	B(
		m,
		J({ name: 'external-link' }, () => e, {
			get iconNode() {
				return s;
			},
			children: (t, i) => {
				var d = O(),
					c = q(d);
				(D(c, a, 'default', {}), h(t, d));
			},
			$$slots: { default: !0 }
		})
	);
}
function Ht(m, a) {
	const e = G(a, ['children', '$$slots', '$$events', '$$legacy']);
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
	 */ const s = [
		['path', { d: 'M5 12h14' }],
		['path', { d: 'M12 5v14' }]
	];
	B(
		m,
		J({ name: 'plus' }, () => e, {
			get iconNode() {
				return s;
			},
			children: (t, i) => {
				var d = O(),
					c = q(d);
				(D(c, a, 'default', {}), h(t, d));
			},
			$$slots: { default: !0 }
		})
	);
}
function Lt(m, a) {
	const e = G(a, ['children', '$$slots', '$$events', '$$legacy']);
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
	 */ const s = [
		['path', { d: 'M10 11v6' }],
		['path', { d: 'M14 11v6' }],
		['path', { d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6' }],
		['path', { d: 'M3 6h18' }],
		['path', { d: 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' }]
	];
	B(
		m,
		J({ name: 'trash-2' }, () => e, {
			get iconNode() {
				return s;
			},
			children: (t, i) => {
				var d = O(),
					c = q(d);
				(D(c, a, 'default', {}), h(t, d));
			},
			$$slots: { default: !0 }
		})
	);
}
class Tt {
	addons = [];
	initialized = !1;
	async addAddon(a) {
		try {
			const e = await fetch(a);
			if (!e.ok) throw new Error(`Failed to fetch manifest: ${e.statusText}`);
			const s = await e.json(),
				t = a.replace('/manifest.json', '');
			this.addons.push({ manifest: s, baseUrl: t });
		} catch (e) {
			throw (console.error('Failed to add addon:', e), e);
		}
	}
	async initialize() {
		if (!this.initialized) {
			for (const a of It.defaultAddons)
				try {
					await this.addAddon(a);
				} catch (e) {
					console.warn(`Failed to load default addon ${a}:`, e);
				}
			this.initialized = !0;
		}
	}
	getAddons() {
		return this.addons;
	}
	async getCatalog(a, e, s) {
		const t = [];
		for (const i of this.addons)
			if (
				!(
					!i.manifest.resources.includes('catalog') ||
					!i.manifest.types.includes(a) ||
					!i.manifest.catalogs?.some((c) => c.type === a && c.id === e)
				)
			)
				try {
					let c = `${i.baseUrl}/catalog/${a}/${e}.json`;
					if (s && Object.keys(s).length > 0) {
						const A = new URLSearchParams(s);
						c += `?${A.toString()}`;
					}
					const x = await fetch(c);
					if (!x.ok) continue;
					const _ = await x.json();
					_.metas && Array.isArray(_.metas) && t.push(..._.metas);
				} catch (c) {
					console.error(`Failed to fetch catalog from ${i.manifest.name}:`, c);
				}
		return t;
	}
	async getMeta(a, e) {
		for (const s of this.addons)
			if (
				s.manifest.resources.includes('meta') &&
				s.manifest.types.includes(a) &&
				!(
					s.manifest.idPrefixes &&
					s.manifest.idPrefixes.length > 0 &&
					!s.manifest.idPrefixes.some((i) => e.startsWith(i))
				)
			)
				try {
					const t = await fetch(`${s.baseUrl}/meta/${a}/${e}.json`);
					if (!t.ok) continue;
					const i = await t.json();
					if (i.meta) return i.meta;
				} catch (t) {
					console.error(`Failed to fetch meta from ${s.manifest.name}:`, t);
				}
		return null;
	}
	async getStreams(a, e) {
		const s = [];
		for (const t of this.addons)
			if (
				t.manifest.resources.includes('stream') &&
				t.manifest.types.includes(a) &&
				!(
					t.manifest.idPrefixes &&
					t.manifest.idPrefixes.length > 0 &&
					!t.manifest.idPrefixes.some((d) => e.startsWith(d))
				)
			)
				try {
					const i = await fetch(`${t.baseUrl}/stream/${a}/${e}.json`);
					if (!i.ok) continue;
					const d = await i.json();
					d.streams && Array.isArray(d.streams) && s.push(...d.streams);
				} catch (i) {
					console.error(`Failed to fetch streams from ${t.manifest.name}:`, i);
				}
		return s;
	}
	async search(a, e) {
		const s = [];
		for (const t of this.addons) {
			if (!t.manifest.resources.includes('catalog')) continue;
			const i = t.manifest.catalogs?.filter((d) => !e || d.type === e);
			if (i?.length)
				for (const d of i)
					try {
						const c = await fetch(
							`${t.baseUrl}/catalog/${d.type}/${d.id}.json?search=${encodeURIComponent(a)}`
						);
						if (!c.ok) continue;
						const x = await c.json();
						x.metas && Array.isArray(x.metas) && s.push(...x.metas);
					} catch (c) {
						console.error(`Failed to search in ${t.manifest.name}:`, c);
					}
		}
		return s;
	}
}
const lt = new Tt();
function Kt(m, a) {
	m.key === 'Enter' && a();
}
var Ot = b('<p class="text-red-400 text-sm mt-2"> </p>'),
	qt = b(
		'<div class="text-center py-8"><div class="text-gray-400 mb-2">No addons installed</div> <div class="text-gray-500 text-sm">Add your first addon above to get started</div></div>'
	),
	Bt = b(
		'<div class="text-xs mb-2"><span class="text-gray-400">Catalogs:</span> <span class="text-white ml-1"> </span></div>'
	),
	Dt = b(
		'<div class="border border-gray-700 rounded-lg p-4"><div class="flex items-start justify-between"><div class="flex-1"><div class="flex items-center space-x-3 mb-2"><h3 class="text-lg font-medium text-white"> </h3> <span class="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded"> </span></div> <p class="text-gray-300 text-sm mb-3"> </p> <div class="flex flex-wrap gap-2 mb-3"><div class="text-xs"><span class="text-gray-400">Types:</span> <span class="text-white ml-1"> </span></div> <div class="text-xs"><span class="text-gray-400">Resources:</span> <span class="text-white ml-1"> </span></div></div> <!> <div class="flex items-center space-x-4 text-xs text-gray-400"><a target="_blank" rel="noopener noreferrer" class="flex items-center space-x-1 hover:text-white transition-colors"><!> <span>View Addon</span></a></div></div> <button class="text-gray-400 hover:text-red-400 transition-colors p-2" title="Remove addon"><!></button></div></div>'
	),
	Gt = b('<div class="space-y-4"></div>'),
	Jt = b(
		`<div class="pt-20 px-6"><div class="max-w-4xl mx-auto"><h1 class="text-3xl font-bold text-white mb-8">Settings</h1> <section class="bg-gray-800 rounded-lg p-6 mb-8"><h2 class="text-xl font-semibold text-white mb-4">Add Stremio Addon</h2> <div class="space-y-4"><div><label for="addon-url" class="block text-sm font-medium text-gray-300 mb-2">Addon URL</label> <div class="flex space-x-3"><input id="addon-url" type="url" placeholder="https://example.com/addon" class="flex-1 bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"/> <button class="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"><!> <span> </span></button></div> <!></div> <div class="text-sm text-gray-400"><p class="mb-2">Enter the base URL of a Stremio addon. Examples:</p> <ul class="list-disc list-inside space-y-1 ml-4"><li>https://addon-example.com</li> <li>https://my-addon.herokuapp.com</li></ul></div></div></section> <section class="bg-gray-800 rounded-lg p-6"><h2 class="text-xl font-semibold text-white mb-4"> </h2> <!></section> <section class="mt-8 text-sm text-gray-400"><h3 class="text-white font-medium mb-2">How to use Stremio Addons</h3> <ul class="list-disc list-inside space-y-1 ml-4"><li>Find Stremio addons from the official community or create your own</li> <li>Each addon provides different types of content (movies, series, etc.)</li> <li>Addons must implement the Stremio addon protocol</li> <li>Content availability depends on the addon's implementation</li></ul></section></div></div>`
	);
function ne(m, a) {
	Mt(a, !1);
	let e = S([]),
		s = S(''),
		t = S(!1),
		i = S('');
	Ut(() => {
		d();
	});
	function d() {
		g(e, lt.getAddons());
	}
	async function c() {
		if (l(s).trim()) {
			(g(t, !0), g(i, ''));
			try {
				let r = l(s).trim();
				(r.endsWith('/manifest.json') || (r.endsWith('/') || (r += '/'), (r += 'manifest.json')),
					await lt.addAddon(r),
					d(),
					g(s, ''));
			} catch (r) {
				g(i, r instanceof Error ? r.message : 'Failed to add addon');
			} finally {
				g(t, !1);
			}
		}
	}
	function x(r) {
		g(
			e,
			l(e).filter((v, y) => y !== r)
		);
	}
	Pt();
	var _ = Jt();
	Et((r) => {
		Vt.title = 'Settings - Stremio';
	});
	var A = n(_),
		M = f(n(A), 2),
		Q = f(n(M), 2),
		X = n(Q),
		U = f(n(X), 2),
		k = n(U);
	(zt(k), (k.__keydown = [Kt, c]));
	var j = f(k, 2);
	j.__click = c;
	var Y = n(j);
	Ht(Y, { class: 'w-4 h-4' });
	var Z = f(Y, 2),
		ct = n(Z, !0);
	(o(Z), o(j), o(U));
	var ft = f(U, 2);
	{
		var mt = (r) => {
			var v = Ot(),
				y = n(v, !0);
			(o(v), P(() => u(y, l(i))), h(r, v));
		};
		K(ft, (r) => {
			l(i) && r(mt);
		});
	}
	(o(X), T(2), o(Q), o(M));
	var tt = f(M, 2),
		E = n(tt),
		vt = n(E);
	o(E);
	var pt = f(E, 2);
	{
		var ut = (r) => {
				var v = qt();
				h(r, v);
			},
			ht = (r) => {
				var v = Gt();
				(Nt(
					v,
					7,
					() => l(e),
					(y) => y.manifest.id,
					(y, p, xt) => {
						var F = Dt(),
							et = n(F),
							V = n(et),
							z = n(V),
							N = n(z),
							gt = n(N, !0);
						o(N);
						var st = f(N, 2),
							_t = n(st);
						(o(st), o(z));
						var R = f(z, 2),
							yt = n(R, !0);
						o(R);
						var C = f(R, 2),
							I = n(C),
							at = f(n(I), 2),
							bt = n(at, !0);
						(o(at), o(I));
						var ot = f(I, 2),
							nt = f(n(ot), 2),
							$t = n(nt, !0);
						(o(nt), o(ot), o(C));
						var it = f(C, 2);
						{
							var wt = ($) => {
								var w = Bt(),
									dt = f(n(w), 2),
									jt = n(dt, !0);
								(o(dt),
									o(w),
									P(
										(L) => u(jt, L),
										[
											() =>
												l(p)
													.manifest.catalogs.map((L) => L.name)
													.join(', ')
										]
									),
									h($, w));
							};
							K(it, ($) => {
								l(p).manifest.catalogs && l(p).manifest.catalogs.length > 0 && $(wt);
							});
						}
						var rt = f(it, 2),
							W = n(rt),
							At = n(W);
						(Wt(At, { class: 'w-3 h-3' }), T(2), o(W), o(rt), o(V));
						var H = f(V, 2);
						H.__click = () => x(l(xt));
						var kt = n(H);
						(Lt(kt, { class: 'w-4 h-4' }),
							o(H),
							o(et),
							o(F),
							P(
								($, w) => {
									(u(gt, l(p).manifest.name),
										u(_t, `v${l(p).manifest.version ?? ''}`),
										u(yt, l(p).manifest.description),
										u(bt, $),
										u($t, w),
										Rt(W, 'href', l(p).baseUrl));
								},
								[() => l(p).manifest.types.join(', '), () => l(p).manifest.resources.join(', ')]
							),
							h(y, F));
					}
				),
					o(v),
					h(r, v));
			};
		K(pt, (r) => {
			l(e).length === 0 ? r(ut) : r(ht, !1);
		});
	}
	(o(tt),
		T(2),
		o(A),
		o(_),
		P(
			(r) => {
				((j.disabled = r),
					u(ct, l(t) ? 'Adding...' : 'Add'),
					u(vt, `Installed Addons (${l(e).length ?? ''})`));
			},
			[() => l(t) || !l(s).trim()]
		),
		Ct(
			k,
			() => l(s),
			(r) => g(s, r)
		),
		h(m, _),
		Ft());
}
St(['keydown', 'click']);
export { ne as component };
