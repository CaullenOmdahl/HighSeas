import { R as head, S as attr, E as pop, A as push } from '../../../chunks/index.js';
import '../../../chunks/config.js';
import { S as Search } from '../../../chunks/search.js';
function _page($$payload, $$props) {
	push();
	let query = '';
	let loading = false;
	head($$payload, ($$payload2) => {
		$$payload2.title = `<title>Search - Stremio</title>`;
	});
	$$payload.out.push(
		`<div class="pt-20 px-6"><div class="max-w-6xl mx-auto"><div class="mb-8"><h1 class="text-3xl font-bold text-white mb-6">Search</h1> <div class="relative max-w-2xl"><input type="search"${attr('value', query)} placeholder="Search for movies, series..." class="w-full bg-gray-800 text-white placeholder-gray-400 border border-gray-600 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"/> <button class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"${attr('disabled', loading, true)}>`
	);
	Search($$payload, { class: 'w-5 h-5' });
	$$payload.out.push(`<!----></button></div></div> `);
	{
		$$payload.out.push('<!--[!-->');
		{
			$$payload.out.push('<!--[-->');
			$$payload.out.push(
				`<div class="text-center py-20"><div class="text-gray-400 text-lg mb-4">Start typing to search for movies and series</div> <div class="text-gray-500 text-sm">Search across all enabled Stremio addons</div></div>`
			);
		}
		$$payload.out.push(`<!--]-->`);
	}
	$$payload.out.push(`<!--]--></div></div>`);
	pop();
}
export { _page as default };
