let scope       = [];
let currentHost = "";

const getHost = ( url ) => ( url.indexOf("://") > -1 ? url.split("/")[2] : url.split("/")[0] ).split(":")[0].split("?")[0];

chrome.tabs.onActivated.addListener(function(currentTab) {
	chrome.storage.sync.get({
	  savedScopes: [],
	}, function(item) {
		if ( item.savedScopes.length === 0 ) return 0;
	  for ( let i in item.savedScopes ) {
		scope.push( item.savedScopes[i] );
	  }
	  chrome.tabs.get(currentTab.tabId, function(tab){
		currentHost = getHost(tab.url);
		const config = {
		  mode: "fixed_servers",
			rules: {
			  proxyForHttp: {
			  scheme: "http",
			  host: "127.0.0.1",
			  port: 8080
			  }
			}
		};

		if ( scope.includes( currentHost ) ) {
		  console.log(scope);
		  chrome.proxy.settings.set({ value: config, scope: 'regular' }, function () {
			// stuff
		  });
		}
	  });	  
	});
});
