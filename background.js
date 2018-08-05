let scopeArray = [];
const getHost = ( url ) => {
  if ( !url ) return false;
  return url.indexOf("://") > -1 ? url.split("/")[2] : url.split("/")[0].split(":")[0].split("?")[0];
};

function handleRequest( requestData, sendResponse ) {
  switch ( requestData.method ) {
    case 'INIT':
      sendResponse({
        method 	: 'INIT',
        data 		: scopeArray
      });
    break;
    case 'SAVE':
      addScope( requestData.data, sendResponse );
    break;  
    case 'DELETE':
      removeScope( requestData.data, sendResponse );
    break;
  }
}

chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    handleRequest( request, sendResponse );
  }
);

function addScope( scope, sendResponse ) {
  if ( !scopeArray.includes( getHost( scope ) ) ) {
    scopeArray.push( getHost( scope ) );
    chrome.storage.sync.set({
      savedScopes : scopeArray
    }, function() {
      return sendResponse({
        method 	: 'saveSuccess',
        data 		: getHost( scope )
      });
    });
  } else {
    return sendResponse({
      method 		: 'saveFailed',
      data			: 'Scope exists.'
    });
  }
}

function removeScope( scope, sendResponse ) {
  if ( !scopeArray.includes( getHost( scope ) ) ) {
    return sendResponse({
       method 	: 'deleteFailed',
       data 		: 'Scope doesn\'t exist.'
    });
  } else {
    let index = scopeArray.indexOf( scope );
    if ( index !== -1 ) {
      scopeArray.splice( index, 1 );
      chrome.storage.sync.set({
        savedScopes : scopeArray
      }, function() {
        return sendResponse({
          method 	: 'deleteSuccess',
          data 		: getHost( scope )
        });
      });    
    }
  }
}

chrome.storage.sync.get({
  savedScopes: [],
}, function ( item ) {
  if ( item.savedScopes.length === 0 ) return 0;

  for ( let i in item.savedScopes ) {
    if ( !scopeArray.includes( getHost( item.savedScopes[i] ) ) ) scopeArray.push( getHost( item.savedScopes[i] ) )
  }
});

const config = {
  mode: "fixed_servers",
  rules: {
    singleProxy: {
      host: "127.0.0.1",
      port: 8080
    }
  }
};

chrome.webRequest.onBeforeRequest.addListener( function ( details ) {
  if ( scopeArray.includes( getHost( details.url ) ) ) {
    chrome.proxy.settings.set({ value: config, scope: 'regular' }, function () {
      // proxying
    });
	  
    return { cancel: false };
  }
  chrome.proxy.settings.set({ value: { mode: 'direct' }, scope: 'regular' }, function() {});
  return { cancel: false };
}, {urls: ["<all_urls>"]}, ["blocking"]);
