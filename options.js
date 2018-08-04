let savedScopes = [];

const getHost = ( url ) => ( url.indexOf("://") > -1 ? url.split("/")[2] : url.split("/")[0].split(":")[0].split("?")[0]);

function remove( scope ) {
  let index = savedScopes.indexOf( scope );
  if ( index !== -1 ) {
    savedScopes.splice(index, 1);
    chrome.storage.sync.set({
      savedScopes
    }, function() {
      let status = document.getElementById('status');
      status.textContent = 'Scope removed.';
      setTimeout(function() {
        window.location.reload();
      }, 750);    
    });    
  }
}

function save_options () {
  let scope       = getHost(document.getElementById('scope').value);
  savedScopes.push(scope);
  chrome.storage.sync.set({
    savedScopes
  }, function() {
    let status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      window.location.reload();
    }, 750);
  });
}

// super hacker bs
function restore_options () {
  chrome.storage.sync.get({
    savedScopes: [],
  }, function(item) {
    for ( let i in item.savedScopes ) {
      savedScopes.push ( item.savedScopes[i] );
      document.getElementById('scopes').innerHTML += "<a href='#' id='remove-"+savedScopes[i]+"'>"+savedScopes[i]+"</a><br/>";
    }
    for ( let i = 0; i < savedScopes.length; i++ ) {
      document.getElementById('remove-' + savedScopes[i]).addEventListener('click', function(evt){
        remove(evt.target.id.split('-')[1]);
      })
    }
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
