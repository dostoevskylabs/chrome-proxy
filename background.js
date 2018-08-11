let scopedTabId = 0;

// dat burp doe.
const config = {
  mode: 'fixed_servers',
  rules: {
    singleProxy: {
      host: '127.0.0.1',
      port: 8080
    }
  }
};

// lol
function addTabToScope ( tabId ) {
  scopedTabId = tabId;
}

// lol2
function removeTabFromScope ( tabId ) {
  scopedTabId = 0;
}

// generate an osd to notify when intercepting
function osd ( tabId ) {
  if ( scopedTabId === 0 ) {
    chrome.notifications.create( Math.random().toString(36).substring(0, 12), {
        type    : 'basic',
        title   : `Stopped intercepting tab: ${tabId}`,
        message : '',
        iconUrl : 'icons/test-48.png',
      }, function () {}
    );
  } else {
    chrome.notifications.create( Math.random().toString(36).substring(0, 12), {
        type    : 'basic',
        title   : `Intercepting tab: ${tabId}`,
        message : '',
        iconUrl : 'icons/test-48.png',
      }, function () {}
    );
  }
}

// dem hotkeys doe.
chrome.commands.onCommand.addListener(
  function ( command ) {
    switch ( command ) {
      // ctrl + shift + i
      // cmd + shift + i
      case 'toggle-proxy':
        // get the current tab's object
        chrome.tabs.query({ currentWindow: true, active: true },
          function ( currentTab ) { 
            if ( !currentTab.length ) return 0; // if it's not a real tab return to 'exit'
          
            let tabId = currentTab[0].id;
            scopedTabId === 0 ? addTabToScope( tabId ) : removeTabFromScope( tabId );  // toggle add/remove scope
          
            // if a scope is set we proxy
            if ( scopedTabId !== 0 ) {
              osd( tabId );
              chrome.proxy.settings.set({ value: config, scope: 'regular' }, function () {});
            } else { // else we don't
              osd( tabId );
              chrome.proxy.settings.clear({ scope: 'regular' }, function () {});
            }
          }
        );      
      break;
    }
  }
);

chrome.tabs.onRemoved.addListener(
  function(tabId, removed) {
    // if a scoped tab was closed we remove scope
    if ( tabId === scopedTabId ) {
      scopedTabId = 0;
    }
  }
);

// triggers when switching tabs
chrome.tabs.onActivated.addListener(
  function ( currentTab ) {
    // check if current tab should be proxied
    if ( currentTab.tabId === scopedTabId ) {
      // enable proxy
      chrome.proxy.settings.set({ value: config, scope: 'regular' }, function () {});
    } else {
      // disable proxy
      chrome.proxy.settings.clear({ scope: 'regular' }, function () {});
    }
  }
);
