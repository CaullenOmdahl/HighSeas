import { T as t, v as S, u as T, U as b, S as h } from './DDdxbkju.js';
function u(r, i) {
	return r === i || r?.[h] === i;
}
function d(r = {}, i, a, k) {
	return (
		t(() => {
			var f, s;
			return (
				S(() => {
					((f = s),
						(s = []),
						T(() => {
							r !== a(...s) && (i(r, ...s), f && u(a(...f), r) && i(null, ...f));
						}));
				}),
				() => {
					b(() => {
						s && u(a(...s), r) && i(null, ...s);
					});
				}
			);
		}),
		r
	);
}
export { d as b };
