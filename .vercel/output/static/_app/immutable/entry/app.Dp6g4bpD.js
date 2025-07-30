const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			'../nodes/0.tjGh9y6E.js',
			'../chunks/DsnmJJEf.js',
			'../chunks/DDdxbkju.js',
			'../chunks/BYgivT0n.js',
			'../chunks/6UcpBOQV.js',
			'../chunks/XlPvnuBP.js',
			'../chunks/C4E9T5AS.js',
			'../chunks/LtaYDPJQ.js',
			'../chunks/DsjntQP_.js',
			'../chunks/DWbhy1gE.js',
			'../chunks/BG9RvbYR.js',
			'../assets/0.mJm95LAQ.css',
			'../nodes/1.Ddp7L-fp.js',
			'../nodes/2.BfIqgrcY.js',
			'../chunks/pgvFQ5L2.js',
			'../chunks/DPntG8eL.js',
			'../chunks/CXVpiO8V.js',
			'../chunks/Dn2o612i.js',
			'../assets/2.CTVwf2DZ.css',
			'../nodes/3.BVkQIN6S.js',
			'../chunks/EbTttirx.js',
			'../nodes/4.BRa508i4.js',
			'../nodes/5.CjkY_SNE.js'
		])
) => i.map((i) => d[i]);
import {
	w as V,
	W as U,
	V as W,
	X as z,
	a2 as G,
	a3 as X,
	x as Y,
	a5 as H,
	a8 as J,
	a7 as K,
	e as k,
	O as Q,
	g as m,
	av as Z,
	aw as $,
	ax as ee,
	aa as te,
	ay as re,
	m as ae,
	p as se,
	af as ne,
	ag as oe,
	o as ce,
	az as x,
	aA as ie,
	f as N,
	j as w,
	s as le,
	a as E,
	b as ue,
	i as O,
	c as fe,
	r as de,
	as as A,
	aB as me,
	t as _e,
	k as he
} from '../chunks/DDdxbkju.js';
import '../chunks/DsnmJJEf.js';
import { i as L } from '../chunks/pgvFQ5L2.js';
import { b as S } from '../chunks/DPntG8eL.js';
import { p as T } from '../chunks/DWbhy1gE.js';
function C(l, e, s) {
	V && U();
	var c = l,
		n,
		r,
		t = null,
		a = null;
	function _() {
		(r && (K(r), (r = null)),
			t && (t.lastChild.remove(), c.before(t), (t = null)),
			(r = a),
			(a = null));
	}
	(W(() => {
		if (n !== (n = e())) {
			var h = H();
			if (n) {
				var i = c;
				(h && ((t = document.createDocumentFragment()), t.append((i = G()))),
					(a = X(() => s(i, n))));
			}
			h ? Y.add_callback(_) : _();
		}
	}, z),
		V && (c = J));
}
function ve(l) {
	return class extends ge {
		constructor(e) {
			super({ component: l, ...e });
		}
	};
}
class ge {
	#t;
	#e;
	constructor(e) {
		var s = new Map(),
			c = (r, t) => {
				var a = ae(t, !1, !1);
				return (s.set(r, a), a);
			};
		const n = new Proxy(
			{ ...(e.props || {}), $$events: {} },
			{
				get(r, t) {
					return m(s.get(t) ?? c(t, Reflect.get(r, t)));
				},
				has(r, t) {
					return t === Q ? !0 : (m(s.get(t) ?? c(t, Reflect.get(r, t))), Reflect.has(r, t));
				},
				set(r, t, a) {
					return (k(s.get(t) ?? c(t, a), a), Reflect.set(r, t, a));
				}
			}
		);
		((this.#e = (e.hydrate ? Z : $)(e.component, {
			target: e.target,
			anchor: e.anchor,
			props: n,
			context: e.context,
			intro: e.intro ?? !1,
			recover: e.recover
		})),
			(!e?.props?.$$host || e.sync === !1) && ee(),
			(this.#t = n.$$events));
		for (const r of Object.keys(this.#e))
			r === '$set' ||
				r === '$destroy' ||
				r === '$on' ||
				te(this, r, {
					get() {
						return this.#e[r];
					},
					set(t) {
						this.#e[r] = t;
					},
					enumerable: !0
				});
		((this.#e.$set = (r) => {
			Object.assign(n, r);
		}),
			(this.#e.$destroy = () => {
				re(this.#e);
			}));
	}
	$set(e) {
		this.#e.$set(e);
	}
	$on(e, s) {
		this.#t[e] = this.#t[e] || [];
		const c = (...n) => s.call(this, ...n);
		return (
			this.#t[e].push(c),
			() => {
				this.#t[e] = this.#t[e].filter((n) => n !== c);
			}
		);
	}
	$destroy() {
		this.#e.$destroy();
	}
}
const ye = 'modulepreload',
	Ee = function (l, e) {
		return new URL(l, e).href;
	},
	I = {},
	b = function (e, s, c) {
		let n = Promise.resolve();
		if (s && s.length > 0) {
			let h = function (i) {
				return Promise.all(
					i.map((d) =>
						Promise.resolve(d).then(
							(v) => ({ status: 'fulfilled', value: v }),
							(v) => ({ status: 'rejected', reason: v })
						)
					)
				);
			};
			const t = document.getElementsByTagName('link'),
				a = document.querySelector('meta[property=csp-nonce]'),
				_ = a?.nonce || a?.getAttribute('nonce');
			n = h(
				s.map((i) => {
					if (((i = Ee(i, c)), i in I)) return;
					I[i] = !0;
					const d = i.endsWith('.css'),
						v = d ? '[rel="stylesheet"]' : '';
					if (!!c)
						for (let o = t.length - 1; o >= 0; o--) {
							const u = t[o];
							if (u.href === i && (!d || u.rel === 'stylesheet')) return;
						}
					else if (document.querySelector(`link[href="${i}"]${v}`)) return;
					const f = document.createElement('link');
					if (
						((f.rel = d ? 'stylesheet' : ye),
						d || (f.as = 'script'),
						(f.crossOrigin = ''),
						(f.href = i),
						_ && f.setAttribute('nonce', _),
						document.head.appendChild(f),
						d)
					)
						return new Promise((o, u) => {
							(f.addEventListener('load', o),
								f.addEventListener('error', () => u(new Error(`Unable to preload CSS for ${i}`))));
						});
				})
			);
		}
		function r(t) {
			const a = new Event('vite:preloadError', { cancelable: !0 });
			if (((a.payload = t), window.dispatchEvent(a), !a.defaultPrevented)) throw t;
		}
		return n.then((t) => {
			for (const a of t || []) a.status === 'rejected' && r(a.reason);
			return e().catch(r);
		});
	},
	Te = {};
var be = N(
		'<div id="svelte-announcer" aria-live="assertive" aria-atomic="true" style="position: absolute; left: 0; top: 0; clip: rect(0 0 0 0); clip-path: inset(50%); overflow: hidden; white-space: nowrap; width: 1px; height: 1px"><!></div>'
	),
	pe = N('<!> <!>', 1);
function Pe(l, e) {
	se(e, !0);
	let s = T(e, 'components', 23, () => []),
		c = T(e, 'data_0', 3, null),
		n = T(e, 'data_1', 3, null);
	(ne(() => e.stores.page.set(e.page)),
		oe(() => {
			(e.stores, e.page, e.constructors, s(), e.form, c(), n(), e.stores.page.notify());
		}));
	let r = x(!1),
		t = x(!1),
		a = x(null);
	ce(() => {
		const o = e.stores.page.subscribe(() => {
			m(r) &&
				(k(t, !0),
				ie().then(() => {
					k(a, document.title || 'untitled page', !0);
				}));
		});
		return (k(r, !0), o);
	});
	const _ = A(() => e.constructors[1]);
	var h = pe(),
		i = w(h);
	{
		var d = (o) => {
				var u = O();
				const p = A(() => e.constructors[0]);
				var P = w(u);
				(C(
					P,
					() => m(p),
					(g, y) => {
						S(
							y(g, {
								get data() {
									return c();
								},
								get form() {
									return e.form;
								},
								get params() {
									return e.page.params;
								},
								children: (R, ke) => {
									var D = O(),
										B = w(D);
									(C(
										B,
										() => m(_),
										(F, M) => {
											S(
												M(F, {
													get data() {
														return n();
													},
													get form() {
														return e.form;
													},
													get params() {
														return e.page.params;
													}
												}),
												(q) => (s()[1] = q),
												() => s()?.[1]
											);
										}
									),
										E(R, D));
								},
								$$slots: { default: !0 }
							}),
							(R) => (s()[0] = R),
							() => s()?.[0]
						);
					}
				),
					E(o, u));
			},
			v = (o) => {
				var u = O();
				const p = A(() => e.constructors[0]);
				var P = w(u);
				(C(
					P,
					() => m(p),
					(g, y) => {
						S(
							y(g, {
								get data() {
									return c();
								},
								get form() {
									return e.form;
								},
								get params() {
									return e.page.params;
								}
							}),
							(R) => (s()[0] = R),
							() => s()?.[0]
						);
					}
				),
					E(o, u));
			};
		L(i, (o) => {
			e.constructors[1] ? o(d) : o(v, !1);
		});
	}
	var j = le(i, 2);
	{
		var f = (o) => {
			var u = be(),
				p = fe(u);
			{
				var P = (g) => {
					var y = me();
					(_e(() => he(y, m(a))), E(g, y));
				};
				L(p, (g) => {
					m(t) && g(P);
				});
			}
			(de(u), E(o, u));
		};
		L(j, (o) => {
			m(r) && o(f);
		});
	}
	(E(l, h), ue());
}
const Ce = ve(Pe),
	je = [
		() =>
			b(
				() => import('../nodes/0.tjGh9y6E.js'),
				__vite__mapDeps([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
				import.meta.url
			),
		() =>
			b(() => import('../nodes/1.Ddp7L-fp.js'), __vite__mapDeps([12, 1, 3, 2, 7]), import.meta.url),
		() =>
			b(
				() => import('../nodes/2.BfIqgrcY.js'),
				__vite__mapDeps([13, 1, 3, 2, 14, 4, 15, 16, 9, 5, 8, 17, 18]),
				import.meta.url
			),
		() =>
			b(
				() => import('../nodes/3.BVkQIN6S.js'),
				__vite__mapDeps([19, 1, 3, 2, 14, 4, 20, 16, 9, 5, 8, 17, 10]),
				import.meta.url
			),
		() =>
			b(
				() => import('../nodes/4.BRa508i4.js'),
				__vite__mapDeps([21, 1, 3, 2, 14, 4, 20, 17, 8, 9, 5]),
				import.meta.url
			),
		() =>
			b(
				() => import('../nodes/5.CjkY_SNE.js'),
				__vite__mapDeps([22, 1, 3, 2, 14, 4, 5, 6, 7, 15, 17]),
				import.meta.url
			)
	],
	De = [],
	Ve = { '/': [2], '/search': [3], '/settings': [4], '/watch/[id]': [5] },
	Re = {
		handleError: ({ error: l }) => {
			console.error(l);
		},
		reroute: () => {},
		transport: {}
	},
	we = Object.fromEntries(Object.entries(Re.transport).map(([l, e]) => [l, e.decode])),
	Ie = !1,
	Ne = (l, e) => we[l](e);
export {
	Ne as decode,
	we as decoders,
	Ve as dictionary,
	Ie as hash,
	Re as hooks,
	Te as matchers,
	je as nodes,
	Ce as root,
	De as server_loads
};
