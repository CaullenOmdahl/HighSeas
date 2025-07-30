import { a9 as c, aa as f, ab as o, m as l, ac as b, ad as _, g as d, e as p } from './DDdxbkju.js';
let u = !1,
	t = Symbol();
function m(e, n, r) {
	const s = (r[n] ??= { store: null, source: l(void 0), unsubscribe: o });
	if (s.store !== e && !(t in r))
		if ((s.unsubscribe(), (s.store = e ?? null), e == null))
			((s.source.v = void 0), (s.unsubscribe = o));
		else {
			var a = !0;
			((s.unsubscribe = b(e, (i) => {
				a ? (s.source.v = i) : p(s.source, i);
			})),
				(a = !1));
		}
	return e && t in r ? _(e) : d(s.source);
}
function v() {
	const e = {};
	function n() {
		c(() => {
			for (var r in e) e[r].unsubscribe();
			f(e, t, { enumerable: !1, value: !0 });
		});
	}
	return [e, n];
}
function y(e) {
	var n = u;
	try {
		return ((u = !1), [e(), u]);
	} finally {
		u = n;
	}
}
export { m as a, y as c, v as s };
