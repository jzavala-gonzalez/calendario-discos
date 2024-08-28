/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx) {
		const endpoint = (request.url.split('/').slice(3)).join('/')
		console.log('request endpoint', `'${endpoint}'`)
	  try {
		await env.calendario_discos.put("KEY", "VALUE");
		const value = await env.calendario_discos.get("KEY");
		if (value === null) {
		  return new Response("Value not found", { status: 404 });
		}
		return new Response(value);
	  } catch (err) {
		// In a production application, you could instead choose to retry your KV
		// read or fall back to a default code path.
		console.error(`KV returned error: ${err}`);
		return new Response(err, { status: 500 });
	  }
	},
  };
  
  
