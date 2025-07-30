import {
	V as m,
	w,
	W as Er,
	g as J,
	G as Tr,
	Y as Nr,
	Z as Sr,
	_ as x,
	a0 as z,
	a1 as P,
	a8 as R,
	aC as Ir,
	aD as wr,
	a3 as V,
	a5 as Cr,
	x as Or,
	aE as rr,
	a2 as sr,
	m as Mr,
	A as er,
	aF as ur,
	aG as lr,
	aH as B,
	a6 as nr,
	a7 as Lr,
	aI as F,
	aJ as Hr,
	aK as W,
	aq as Y,
	aL as Rr,
	aM as Dr,
	aN as $r,
	aO as Pr,
	z as Vr,
	ap as Yr,
	aP as or,
	U as Ur,
	aQ as qr,
	T as vr,
	aR as yr,
	aS as Br,
	a9 as Fr,
	aT as Gr,
	aU as Kr,
	aV as zr,
	aW as Wr,
	d as Xr,
	aX as Zr,
	aY as kr,
	aZ as Jr,
	a_ as Qr,
	a$ as jr,
	b0 as mr,
	b1 as xr,
	b2 as re,
	b3 as ee
} from './DDdxbkju.js';
function he(r, a) {
	return a;
}
function ae(r, a, e) {
	for (var f = r.items, i = [], t = a.length, s = 0; s < t; s++) Dr(a[s].e, i, !0);
	var o = t > 0 && i.length === 0 && e !== null;
	if (o) {
		var E = e.parentNode;
		($r(E), E.append(e), f.clear(), O(r, a[0].prev, a[t - 1].next));
	}
	Pr(i, () => {
		for (var c = 0; c < t; c++) {
			var g = a[c];
			(o || (f.delete(g.k), O(r, g.prev, g.next)), Y(g.e, !o));
		}
	});
}
function pe(r, a, e, f, i, t = null) {
	var s = r,
		o = { flags: a, items: new Map(), first: null },
		E = (a & or) !== 0;
	if (E) {
		var c = r;
		s = w ? z(Yr(c)) : c.appendChild(sr());
	}
	w && Er();
	var g = null,
		T = !1,
		h = new Map(),
		I = Tr(() => {
			var p = e();
			return lr(p) ? p : p == null ? [] : ur(p);
		}),
		n,
		v;
	function A() {
		(fe(v, n, o, h, s, i, a, f, e),
			t !== null &&
				(n.length === 0
					? g
						? nr(g)
						: (g = V(() => t(s)))
					: g !== null &&
						Lr(g, () => {
							g = null;
						})));
	}
	(m(() => {
		((v ??= Vr), (n = J(I)));
		var p = n.length;
		if (T && p === 0) return;
		T = p === 0;
		let N = !1;
		if (w) {
			var d = Nr(s) === Sr;
			d !== (p === 0) && ((s = x()), z(s), P(!1), (N = !0));
		}
		if (w) {
			for (var _ = null, b, u = 0; u < p; u++) {
				if (R.nodeType === Ir && R.data === wr) {
					((s = R), (N = !0), P(!1));
					break;
				}
				var l = n[u],
					S = f(l, u);
				((b = Q(R, o, _, null, l, S, u, i, a, e)), o.items.set(S, b), (_ = b));
			}
			p > 0 && z(x());
		}
		if (w) p === 0 && t && (g = V(() => t(s)));
		else if (Cr()) {
			var M = new Set(),
				U = Or;
			for (u = 0; u < p; u += 1) {
				((l = n[u]), (S = f(l, u)));
				var L = o.items.get(S) ?? h.get(S);
				(L
					? (a & (F | B)) !== 0 && cr(L, l, u, a)
					: ((b = Q(null, o, null, null, l, S, u, i, a, e, !0)), h.set(S, b)),
					M.add(S));
			}
			for (const [C, q] of o.items) M.has(C) || U.skipped_effects.add(q.e);
			U.add_callback(A);
		} else A();
		(N && P(!0), J(I));
	}),
		w && (s = R));
}
function fe(r, a, e, f, i, t, s, o, E) {
	var c = (s & qr) !== 0,
		g = (s & (F | B)) !== 0,
		T = a.length,
		h = e.items,
		I = e.first,
		n = I,
		v,
		A = null,
		p,
		N = [],
		d = [],
		_,
		b,
		u,
		l;
	if (c)
		for (l = 0; l < T; l += 1)
			((_ = a[l]),
				(b = o(_, l)),
				(u = h.get(b)),
				u !== void 0 && (u.a?.measure(), (p ??= new Set()).add(u)));
	for (l = 0; l < T; l += 1) {
		if (((_ = a[l]), (b = o(_, l)), (u = h.get(b)), u === void 0)) {
			var S = f.get(b);
			if (S !== void 0) {
				(f.delete(b), h.set(b, S));
				var M = A ? A.next : n;
				(O(e, A, S), O(e, S, M), X(S, M, i), (A = S));
			} else {
				var U = n ? n.e.nodes_start : i;
				A = Q(U, e, A, A === null ? e.first : A.next, _, b, l, t, s, E);
			}
			(h.set(b, A), (N = []), (d = []), (n = A.next));
			continue;
		}
		if (
			(g && cr(u, _, l, s),
			(u.e.f & W) !== 0 && (nr(u.e), c && (u.a?.unfix(), (p ??= new Set()).delete(u))),
			u !== n)
		) {
			if (v !== void 0 && v.has(u)) {
				if (N.length < d.length) {
					var L = d[0],
						C;
					A = L.prev;
					var q = N[0],
						G = N[N.length - 1];
					for (C = 0; C < N.length; C += 1) X(N[C], L, i);
					for (C = 0; C < d.length; C += 1) v.delete(d[C]);
					(O(e, q.prev, G.next),
						O(e, A, q),
						O(e, G, L),
						(n = L),
						(A = G),
						(l -= 1),
						(N = []),
						(d = []));
				} else
					(v.delete(u),
						X(u, n, i),
						O(e, u.prev, u.next),
						O(e, u, A === null ? e.first : A.next),
						O(e, A, u),
						(A = u));
				continue;
			}
			for (N = [], d = []; n !== null && n.k !== b; )
				((n.e.f & W) === 0 && (v ??= new Set()).add(n), d.push(n), (n = n.next));
			if (n === null) continue;
			u = n;
		}
		(N.push(u), (A = u), (n = u.next));
	}
	if (n !== null || v !== void 0) {
		for (var H = v === void 0 ? [] : ur(v); n !== null; )
			((n.e.f & W) === 0 && H.push(n), (n = n.next));
		var K = H.length;
		if (K > 0) {
			var Ar = (s & or) !== 0 && T === 0 ? i : null;
			if (c) {
				for (l = 0; l < K; l += 1) H[l].a?.measure();
				for (l = 0; l < K; l += 1) H[l].a?.fix();
			}
			ae(e, H, Ar);
		}
	}
	(c &&
		Ur(() => {
			if (p !== void 0) for (u of p) u.a?.apply();
		}),
		(r.first = e.first && e.first.e),
		(r.last = A && A.e));
	for (var gr of f.values()) Y(gr.e);
	f.clear();
}
function cr(r, a, e, f) {
	((f & F) !== 0 && rr(r.v, a), (f & B) !== 0 ? rr(r.i, e) : (r.i = e));
}
function Q(r, a, e, f, i, t, s, o, E, c, g) {
	var T = (E & F) !== 0,
		h = (E & Hr) === 0,
		I = T ? (h ? Mr(i, !1, !1) : er(i)) : i,
		n = (E & B) === 0 ? s : er(s),
		v = { i: n, v: I, k: t, a: null, e: null, prev: e, next: f };
	try {
		if (r === null) {
			var A = document.createDocumentFragment();
			A.append((r = sr()));
		}
		return (
			(v.e = V(() => o(r, I, n, c), w)),
			(v.e.prev = e && e.e),
			(v.e.next = f && f.e),
			e === null ? g || (a.first = v) : ((e.next = v), (e.e.next = v.e)),
			f !== null && ((f.prev = v), (f.e.prev = v.e)),
			v
		);
	} finally {
	}
}
function X(r, a, e) {
	for (
		var f = r.next ? r.next.e.nodes_start : e, i = a ? a.e.nodes_start : e, t = r.e.nodes_start;
		t !== null && t !== f;

	) {
		var s = Rr(t);
		(i.before(t), (t = s));
	}
}
function O(r, a, e) {
	(a === null ? (r.first = e) : ((a.next = e), (a.e.next = e && e.e)),
		e !== null && ((e.prev = a), (e.e.prev = a && a.e)));
}
function ie(r, a) {
	var e = void 0,
		f;
	m(() => {
		e !== (e = a()) &&
			(f && (Y(f), (f = null)),
			e &&
				(f = V(() => {
					vr(() => e(r));
				})));
	});
}
function dr(r) {
	var a,
		e,
		f = '';
	if (typeof r == 'string' || typeof r == 'number') f += r;
	else if (typeof r == 'object')
		if (Array.isArray(r)) {
			var i = r.length;
			for (a = 0; a < i; a++) r[a] && (e = dr(r[a])) && (f && (f += ' '), (f += e));
		} else for (e in r) r[e] && (f && (f += ' '), (f += e));
	return f;
}
function te() {
	for (var r, a, e = 0, f = '', i = arguments.length; e < i; e++)
		(r = arguments[e]) && (a = dr(r)) && (f && (f += ' '), (f += a));
	return f;
}
function se(r) {
	return typeof r == 'object' ? te(r) : (r ?? '');
}
const ar = [
	...` 	
\r\f \v\uFEFF`
];
function ue(r, a, e) {
	var f = r == null ? '' : '' + r;
	if ((a && (f = f ? f + ' ' + a : a), e)) {
		for (var i in e)
			if (e[i]) f = f ? f + ' ' + i : i;
			else if (f.length)
				for (var t = i.length, s = 0; (s = f.indexOf(i, s)) >= 0; ) {
					var o = s + t;
					(s === 0 || ar.includes(f[s - 1])) && (o === f.length || ar.includes(f[o]))
						? (f = (s === 0 ? '' : f.substring(0, s)) + f.substring(o + 1))
						: (s = o);
				}
	}
	return f === '' ? null : f;
}
function fr(r, a = !1) {
	var e = a ? ' !important;' : ';',
		f = '';
	for (var i in r) {
		var t = r[i];
		t != null && t !== '' && (f += ' ' + i + ': ' + t + e);
	}
	return f;
}
function Z(r) {
	return r[0] !== '-' || r[1] !== '-' ? r.toLowerCase() : r;
}
function le(r, a) {
	if (a) {
		var e = '',
			f,
			i;
		if ((Array.isArray(a) ? ((f = a[0]), (i = a[1])) : (f = a), r)) {
			r = String(r)
				.replaceAll(/\s*\/\*.*?\*\/\s*/g, '')
				.trim();
			var t = !1,
				s = 0,
				o = !1,
				E = [];
			(f && E.push(...Object.keys(f).map(Z)), i && E.push(...Object.keys(i).map(Z)));
			var c = 0,
				g = -1;
			const v = r.length;
			for (var T = 0; T < v; T++) {
				var h = r[T];
				if (
					(o
						? h === '/' && r[T - 1] === '*' && (o = !1)
						: t
							? t === h && (t = !1)
							: h === '/' && r[T + 1] === '*'
								? (o = !0)
								: h === '"' || h === "'"
									? (t = h)
									: h === '('
										? s++
										: h === ')' && s--,
					!o && t === !1 && s === 0)
				) {
					if (h === ':' && g === -1) g = T;
					else if (h === ';' || T === v - 1) {
						if (g !== -1) {
							var I = Z(r.substring(c, g).trim());
							if (!E.includes(I)) {
								h !== ';' && T++;
								var n = r.substring(c, T).trim();
								e += ' ' + n + ';';
							}
						}
						((c = T + 1), (g = -1));
					}
				}
			}
		}
		return (f && (e += fr(f)), i && (e += fr(i, !0)), (e = e.trim()), e === '' ? null : e);
	}
	return r == null ? null : String(r);
}
function ne(r, a, e, f, i, t) {
	var s = r.__className;
	if (w || s !== e || s === void 0) {
		var o = ue(e, f, t);
		((!w || o !== r.getAttribute('class')) &&
			(o == null ? r.removeAttribute('class') : a ? (r.className = o) : r.setAttribute('class', o)),
			(r.__className = e));
	} else if (t && i !== t)
		for (var E in t) {
			var c = !!t[E];
			(i == null || c !== !!i[E]) && r.classList.toggle(E, c);
		}
	return t;
}
function k(r, a = {}, e, f) {
	for (var i in e) {
		var t = e[i];
		a[i] !== t && (e[i] == null ? r.style.removeProperty(i) : r.style.setProperty(i, t, f));
	}
}
function oe(r, a, e, f) {
	var i = r.__style;
	if (w || i !== a) {
		var t = le(a, f);
		((!w || t !== r.getAttribute('style')) &&
			(t == null ? r.removeAttribute('style') : (r.style.cssText = t)),
			(r.__style = a));
	} else
		f && (Array.isArray(f) ? (k(r, e?.[0], f[0]), k(r, e?.[1], f[1], 'important')) : k(r, e, f));
	return f;
}
function j(r, a, e = !1) {
	if (r.multiple) {
		if (a == null) return;
		if (!lr(a)) return yr();
		for (var f of r.options) f.selected = a.includes(ir(f));
		return;
	}
	for (f of r.options) {
		var i = ir(f);
		if (Br(i, a)) {
			f.selected = !0;
			return;
		}
	}
	(!e || a !== void 0) && (r.selectedIndex = -1);
}
function ve(r) {
	var a = new MutationObserver(() => {
		j(r, r.__value);
	});
	(a.observe(r, { childList: !0, subtree: !0, attributes: !0, attributeFilter: ['value'] }),
		Fr(() => {
			a.disconnect();
		}));
}
function ir(r) {
	return '__value' in r ? r.__value : r.value;
}
const D = Symbol('class'),
	$ = Symbol('style'),
	_r = Symbol('is custom element'),
	hr = Symbol('is html');
function be(r) {
	if (w) {
		var a = !1,
			e = () => {
				if (!a) {
					if (((a = !0), r.hasAttribute('value'))) {
						var f = r.value;
						(y(r, 'value', null), (r.value = f));
					}
					if (r.hasAttribute('checked')) {
						var i = r.checked;
						(y(r, 'checked', null), (r.checked = i));
					}
				}
			};
		((r.__on_r = e), mr(e), xr());
	}
}
function ce(r, a) {
	a ? r.hasAttribute('selected') || r.setAttribute('selected', '') : r.removeAttribute('selected');
}
function y(r, a, e, f) {
	var i = pr(r);
	(w &&
		((i[a] = r.getAttribute(a)),
		a === 'src' || a === 'srcset' || (a === 'href' && r.nodeName === 'LINK'))) ||
		(i[a] !== (i[a] = e) &&
			(a === 'loading' && (r[jr] = e),
			e == null
				? r.removeAttribute(a)
				: typeof e != 'string' && br(r).includes(a)
					? (r[a] = e)
					: r.setAttribute(a, e)));
}
function de(r, a, e, f, i = !1) {
	var t = pr(r),
		s = t[_r],
		o = !t[hr];
	let E = w && s;
	E && P(!1);
	var c = a || {},
		g = r.tagName === 'OPTION';
	for (var T in a) T in e || (e[T] = null);
	(e.class ? (e.class = se(e.class)) : e[D] && (e.class = null), e[$] && (e.style ??= null));
	var h = br(r);
	for (const d in e) {
		let _ = e[d];
		if (g && d === 'value' && _ == null) {
			((r.value = r.__value = ''), (c[d] = _));
			continue;
		}
		if (d === 'class') {
			var I = r.namespaceURI === 'http://www.w3.org/1999/xhtml';
			(ne(r, I, _, f, a?.[D], e[D]), (c[d] = _), (c[D] = e[D]));
			continue;
		}
		if (d === 'style') {
			(oe(r, _, a?.[$], e[$]), (c[d] = _), (c[$] = e[$]));
			continue;
		}
		var n = c[d];
		if (!(_ === n && !(_ === void 0 && r.hasAttribute(d)))) {
			c[d] = _;
			var v = d[0] + d[1];
			if (v !== '$$')
				if (v === 'on') {
					const b = {},
						u = '$$' + d;
					let l = d.slice(2);
					var A = re(l);
					if ((zr(l) && ((l = l.slice(0, -7)), (b.capture = !0)), !A && n)) {
						if (_ != null) continue;
						(r.removeEventListener(l, c[u], b), (c[u] = null));
					}
					if (_ != null)
						if (A) ((r[`__${l}`] = _), Xr([l]));
						else {
							let S = function (M) {
								c[d].call(this, M);
							};
							c[u] = Wr(l, r, S, b);
						}
					else A && (r[`__${l}`] = void 0);
				} else if (d === 'style') y(r, d, _);
				else if (d === 'autofocus') Zr(r, !!_);
				else if (!s && (d === '__value' || (d === 'value' && _ != null))) r.value = r.__value = _;
				else if (d === 'selected' && g) ce(r, _);
				else {
					var p = d;
					o || (p = kr(p));
					var N = p === 'defaultValue' || p === 'defaultChecked';
					if (_ == null && !s && !N)
						if (((t[d] = null), p === 'value' || p === 'checked')) {
							let b = r;
							const u = a === void 0;
							if (p === 'value') {
								let l = b.defaultValue;
								(b.removeAttribute(p), (b.defaultValue = l), (b.value = b.__value = u ? l : null));
							} else {
								let l = b.defaultChecked;
								(b.removeAttribute(p), (b.defaultChecked = l), (b.checked = u ? l : !1));
							}
						} else r.removeAttribute(d);
					else
						N || (h.includes(p) && (s || typeof _ != 'string'))
							? (r[p] = _)
							: typeof _ != 'function' && y(r, p, _);
				}
		}
	}
	return (E && P(!0), c);
}
function Ae(r, a, e = [], f = [], i, t = !1) {
	Gr(e, f, (s) => {
		var o = void 0,
			E = {},
			c = r.nodeName === 'SELECT',
			g = !1;
		if (
			(m(() => {
				var h = a(...s.map(J)),
					I = de(r, o, h, i, t);
				g && c && 'value' in h && j(r, h.value);
				for (let v of Object.getOwnPropertySymbols(E)) h[v] || Y(E[v]);
				for (let v of Object.getOwnPropertySymbols(h)) {
					var n = h[v];
					(v.description === Kr &&
						(!o || n !== o[v]) &&
						(E[v] && Y(E[v]), (E[v] = V(() => ie(r, () => n)))),
						(I[v] = n));
				}
				o = I;
			}),
			c)
		) {
			var T = r;
			vr(() => {
				(j(T, o.value, !0), ve(T));
			});
		}
		g = !0;
	});
}
function pr(r) {
	return (r.__attributes ??= { [_r]: r.nodeName.includes('-'), [hr]: r.namespaceURI === Jr });
}
var tr = new Map();
function br(r) {
	var a = tr.get(r.nodeName);
	if (a) return a;
	tr.set(r.nodeName, (a = []));
	for (var e, f = r, i = Element.prototype; i !== f; ) {
		e = ee(f);
		for (var t in e) e[t].set && a.push(t);
		f = Qr(f);
	}
	return a;
}
export { y as a, Ae as b, pe as e, he as i, be as r, ne as s };
