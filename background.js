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
    }, () => {}
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
          
            // if a scope is set we proxy
            if ( scopedTabId !== 0 ) {
              osd( tabId );
              chrome.proxy.settings.set({ value: config, scope: 'regular' }, () => {});
            } else { // else we don't
              osd( tabId );
              chrome.proxy.settings.clear({ scope: 'regular' }, () => {});
            }
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

// triggers when switching tabs
chrome.tabs.onActivated.addListener(
  ( currentTab ) => {
    // check if current tab should be proxied
    if ( currentTab.tabId === scopedTabId ) {
      // enable proxy
      chrome.proxy.settings.set({ value: config, scope: 'regular' }, () => {});
    } else {
      // disable proxy
      chrome.proxy.settings.clear({ scope: 'regular' }, () => {});
    }
  }
);
