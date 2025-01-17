self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open('sonic-3k-static').then((cache) => {
			return cache.addAll(
				[
					'/app.css'
					, '/app.js'
					, '/'
				]
			);
		})
	);
});

// const resourceMatch = /\.(js|css|svg|png|dae|wav|json)$/;
const forceRefresh  = true;

self.addEventListener('fetch', (event) => {

	const request = event.request;

	if(request.cache === 'only-if-cached' && request.mode !== 'same-origin')
	{
		return;
	}

	caches.open('sonic-3000').then((cache) => {

		return cache.match(request);

	}).then((cacehedResponse) => {

		// const refreshFetch = fetch(request);

		// refreshFetch.then((refreshReponse) => {

		// 	const reqUrl = new URL(request.url);

		// 	if(refreshReponse.status === 200)
		// 	{
		// 		// cache.put(event.request, refreshReponse.clone());
		// 	}

		// 	return refreshReponse;
		// });

		// refreshFetch.catch(error => {
		// 	console.error(error);
		// });

		// const respUrl = new URL(event.request.url);

		if(cacehedResponse && !navigator.onLine)
		{
			event.respondWith(cacehedResponse);
		}
		else if(!cacehedResponse || forceRefresh)
		{
			// event.waitUntil(refreshFetch);

			// if(forceRefresh)
			// {
			// 	return refreshFetch;
			// }
		};
	});
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			cacheNames.map((cacheName) => {
	          return caches.delete(cacheName);
	        });
		})
	);
});
