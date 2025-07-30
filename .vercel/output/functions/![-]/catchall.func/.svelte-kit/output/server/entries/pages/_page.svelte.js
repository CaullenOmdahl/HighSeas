import 'clsx';
import { E as pop, A as push } from '../../chunks/index.js';
import '../../chunks/config.js';
function _page($$payload, $$props) {
	push();
	$$payload.out.push(`<div class="pt-16">`);
	{
		$$payload.out.push('<!--[-->');
		$$payload.out.push(
			`<div class="flex items-center justify-center min-h-screen"><div class="text-white text-xl">Loading content...</div></div>`
		);
	}
	$$payload.out.push(`<!--]--></div>`);
	pop();
}
export { _page as default };
