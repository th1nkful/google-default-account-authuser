var authUser, force;

chrome.storage.sync.get({
    authuser: '',
    force: false
}, function(result) {
    authUser = result.authuser;
    force = result.force;
});

chrome.webRequest.onBeforeRequest.addListener(function (details) {
    if (details.method === "GET" && details.type === "main_frame") {
        const [host, queryParams] = details.url.split('?');
        
        let hasUpdatedParams = false;
        
        const params = new URLSearchParams(queryParams);
        const hasAuthUser = params.has('authuser');
        if (hasAuthUser || (hasAuthUser && force)) {
            params.set('authuser', authuser);
            hasUpdatedParams = true;
        }

        const isSupportedHost = (
            host.includes('https://meet.google.com')
            || host.includes('https://console.cloud.google.com')
        );

        if (hasUpdatedParams && isSupportedHost) {
            return { redirectUrl: `${host}?${params.toString()}` };
        }
    }
}, {
    urls: [
      "https://meet.google.com/*",
      "https://console.cloud.google.com/*"
    ] 
}, ["blocking"]);
