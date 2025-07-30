import {
	z as h,
	A as T,
	B as S,
	C as B,
	P as R,
	g as _,
	D as K,
	e as M,
	E as N,
	F as Y,
	G as j,
	H as I,
	I as x,
	J as y,
	u as U,
	K as z,
	L as C,
	M as G,
	N as p,
	S as E,
	O as m,
	Q as $,
	R as q
} from './DDdxbkju.js';
import { c as F } from './XlPvnuBP.js';
const H = {
	get(e, r) {
		if (!e.exclude.includes(r)) return (_(e.version), r in e.special ? e.special[r]() : e.props[r]);
	},
	set(e, r, i) {
		if (!(r in e.special)) {
			var n = h;
			try {
				(x(e.parent_effect),
					(e.special[r] = Q(
						{
							get [r]() {
								return e.props[r];
							}
						},
						r,
						R
					)));
			} finally {
				x(n);
			}
		}
		return (e.special[r](i), I(e.version), !0);
	},
	getOwnPropertyDescriptor(e, r) {
		if (!e.exclude.includes(r) && r in e.props)
			return { enumerable: !0, configurable: !0, value: e.props[r] };
	},
	deleteProperty(e, r) {
		return (e.exclude.includes(r) || (e.exclude.push(r), I(e.version)), !0);
	},
	has(e, r) {
		return e.exclude.includes(r) ? !1 : r in e.props;
	},
	ownKeys(e) {
		return Reflect.ownKeys(e.props).filter((r) => !e.exclude.includes(r));
	}
};
function W(e, r) {
	return new Proxy({ props: e, exclude: r, special: {}, version: T(0), parent_effect: h }, H);
}
const J = {
	get(e, r) {
		let i = e.props.length;
		for (; i--; ) {
			let n = e.props[i];
			if ((p(n) && (n = n()), typeof n == 'object' && n !== null && r in n)) return n[r];
		}
	},
	set(e, r, i) {
		let n = e.props.length;
		for (; n--; ) {
			let s = e.props[n];
			p(s) && (s = s());
			const u = S(s, r);
			if (u && u.set) return (u.set(i), !0);
		}
		return !1;
	},
	getOwnPropertyDescriptor(e, r) {
		let i = e.props.length;
		for (; i--; ) {
			let n = e.props[i];
			if ((p(n) && (n = n()), typeof n == 'object' && n !== null && r in n)) {
				const s = S(n, r);
				return (s && !s.configurable && (s.configurable = !0), s);
			}
		}
	},
	has(e, r) {
		if (r === E || r === m) return !1;
		for (let i of e.props) if ((p(i) && (i = i()), i != null && r in i)) return !0;
		return !1;
	},
	ownKeys(e) {
		const r = [];
		for (let i of e.props)
			if ((p(i) && (i = i()), !!i)) {
				for (const n in i) r.includes(n) || r.push(n);
				for (const n of Object.getOwnPropertySymbols(i)) r.includes(n) || r.push(n);
			}
		return r;
	}
};
function X(...e) {
	return new Proxy({ props: e }, J);
}
function Q(e, r, i, n) {
	var s = !z || (i & C) !== 0,
		u = (i & y) !== 0,
		A = (i & $) !== 0,
		f = n,
		v = !0,
		O = () => (v && ((v = !1), (f = A ? U(n) : n)), f),
		a;
	if (u) {
		var D = E in e || m in e;
		a = S(e, r)?.set ?? (D && r in e ? (t) => (e[r] = t) : void 0);
	}
	var o,
		b = !1;
	(u ? ([o, b] = F(() => e[r])) : (o = e[r]),
		o === void 0 && n !== void 0 && ((o = O()), a && (s && B(), a(o))));
	var l;
	if (
		(s
			? (l = () => {
					var t = e[r];
					return t === void 0 ? O() : ((v = !0), t);
				})
			: (l = () => {
					var t = e[r];
					return (t !== void 0 && (f = void 0), t === void 0 ? f : t);
				}),
		s && (i & R) === 0)
	)
		return l;
	if (a) {
		var L = e.$$legacy;
		return function (t, d) {
			return arguments.length > 0 ? ((!s || !d || L || b) && a(d ? l() : t), t) : l();
		};
	}
	var P = !1,
		c = ((i & G) !== 0 ? Y : j)(() => ((P = !1), l()));
	u && _(c);
	var g = h;
	return function (t, d) {
		if (arguments.length > 0) {
			const w = d ? _(c) : s && u ? K(t) : t;
			return (M(c, w), (P = !0), f !== void 0 && (f = w), t);
		}
		return (q && P) || (g.f & N) !== 0 ? c.v : _(c);
	};
}
export { W as l, Q as p, X as s };
