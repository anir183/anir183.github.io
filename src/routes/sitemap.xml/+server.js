export const prerender = true;

export async function GET() {
	const site = "https://anir183.is-a.dev";
	const urls = [
		{ loc: `${site}/`, priority: "1.0", changefreq: "monthly" },
		{ loc: `${site}/projects`, priority: "0.8", changefreq: "monthly" },
		{ loc: `${site}/experiences`, priority: "0.8", changefreq: "monthly" }
	];

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `	<url><loc>${u.loc}</loc><priority>${u.priority}</priority><changefreq>${u.changefreq}</changefreq></url>`).join("\n")}
</urlset>`;

	return new Response(body, {
		headers: { "Content-Type": "application/xml" }
	});
}
