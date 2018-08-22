'use strict';
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
  let template = scopedTabId ? `Started intercepting tab: ${tabId}` : `Stopped intercepted tab: ${tabId}`;

  chrome.notifications.create( Math.random().toString(36).substring(0, 12), {
      type    : 'basic',
      title   : template,
      message : '',
      iconUrl : 'icons/test-48.png',
    }, () => {
      // clear notifications once they are up so that status can be tracked quicker.
      chrome.notifications.clear();
    }
  );
}

// dem hotkeys doe.
chrome.commands.onCommand.addListener(
  ( command ) => {
    switch ( command ) {
      // ctrl + shift + i
      // cmd + shift + i
      case 'toggle-proxy':
        // get the current tab's object
        chrome.tabs.query({ currentWindow: true, active: true },
          ( currentTab ) => { 
            if ( !currentTab.length ) return 0; // if it's not a real tab return to 'exit'
          
            let tabId = currentTab[0].id;
            scopedTabId === 0 ? addTabToScope( tabId ) : removeTabFromScope( tabId );  // toggle add/remove scope
          
            // create osd
            osd( tabId );
          }
        );      
      break;
    }
  }
);

// on tab close
chrome.tabs.onRemoved.addListener(
  ( tabId, removed ) => {
    // if a scoped tab was closed we remove scope
    if ( tabId === scopedTabId ) {
      scopedTabId = 0;
    }
  }
);

// triggers on each web request
chrome.webRequest.onBeforeRequest.addListener( function ( details ) {
  // capture initial request if it originates from tabId -1 and a scope is set
  if ( !details.tabId && scopedTabId ) {
    chrome.proxy.settings.set({ value: config, scope: 'regular' }, () => {
      return { cancel: false }; // allow request
    });
  } else if ( details.tabId !== scopedTabId ) { // clear proxy settings if not a scopedTab
    chrome.proxy.settings.clear({ scope: 'regular' }, () => {
      return { cancel: false }; // allow request
    });
  } else { // proxy if scopedTab
    chrome.proxy.settings.set({ value: config, scope: 'regular' }, () => {
      return { cancel: false }; // allow request
    });
  }
}, {urls: ["<all_urls>"]}, ["blocking"]);
