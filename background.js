let scope       = "";
let currentHost = "";

function getHost ( url ) {
	return ( url.indexOf("://") > -1 ? url.split("/")[2] : url.split("/")[0] ).split(":")[0].split("?")[0];
}

chrome.tabs.onActivated.addListener(function(currentTab) {
  chrome.storage.sync.get({
    scope: '',
  }, function(item) {
    scope = items.scope;
  });
  chrome.tabs.get(currentTab.tabId, function(tab){
    currentHost = getHost(tab.url);
  });
});

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

if ( currentHost === scope ) {
  chrome.proxy.settings.set({ value: config, scope: 'regular' }, function () {
    // stuff
  });
}
