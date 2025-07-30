import {
	V as I,
	w as _,
	W as N,
	X as x,
	Y as R,
	Z as D,
	_ as F,
	a0 as S,
	a1 as p,
	a2 as C,
	a3 as b,
	x as L,
	a4 as Y,
	a5 as Z,
	a6 as q,
	a7 as w,
	a8 as H
} from './DDdxbkju.js';
function P(T, g, y = !1) {
	_ && N();
	var r = T,
		t = null,
		s = null,
		e = Y,
		E = y ? x : 0,
		l = !1;
	const k = (n, a = !0) => {
		((l = !0), d(a, n));
	};
	var f = null;
	function o() {
		f !== null && (f.lastChild.remove(), r.before(f), (f = null));
		var n = e ? t : s,
			a = e ? s : t;
		(n && q(n),
			a &&
				w(a, () => {
					e ? (s = null) : (t = null);
				}));
	}
	const d = (n, a) => {
		if (e === (e = n)) return;
		let u = !1;
		if (_) {
			const A = R(r) === D;
			!!e === A && ((r = F()), S(r), p(!1), (u = !0));
		}
		var v = Z(),
			i = r;
		if (
			(v && ((f = document.createDocumentFragment()), f.append((i = C()))),
			e ? (t ??= a && b(() => a(i))) : (s ??= a && b(() => a(i))),
			v)
		) {
			var c = L,
				h = e ? t : s,
				m = e ? s : t;
			(h && c.skipped_effects.delete(h), m && c.skipped_effects.add(m), c.add_callback(o));
		} else o();
		u && p(!0);
	};
	(I(() => {
		((l = !1), g(k), l || d(null, null));
	}, E),
		_ && (r = H));
}
export { P as i };
