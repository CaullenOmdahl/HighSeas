import {
	K as store_get,
	R as head,
	M as unsubscribe_stores,
	E as pop,
	A as push,
	O as escape_html
} from '../../../../chunks/index.js';
import { p as page } from '../../../../chunks/stores.js';
import 'video.js';
import '../../../../chunks/config.js';
function _page($$payload, $$props) {
	push();
	var $$store_subs;
	store_get(($$store_subs ??= {}), '$page', page).params.id;
	head($$payload, ($$payload2) => {
		$$payload2.title = `<title>${escape_html('Watch')} - Stremio</title>`;
	});
	$$payload.out.push(`<div class="min-h-screen bg-black">`);
	{
		$$payload.out.push('<!--[-->');
		$$payload.out.push(
			`<div class="flex items-center justify-center min-h-screen"><div class="text-white text-xl">Loading player...</div></div>`
		);
	}
	$$payload.out.push(`<!--]--></div>`);
	if ($$store_subs) unsubscribe_stores($$store_subs);
	pop();
}
export { _page as default };
