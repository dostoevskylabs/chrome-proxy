const status = document.getElementById('status');
const scope = document.getElementById('scope');
scope.addEventListener('keypress', function(evt){
  if ( evt.key === "Enter" ) {
    save_option();
  }
});

function sendBackgroundMessage( method, data ) {
  chrome.extension.sendRequest({ method, data }, function ( response ) {
    handleResponse( response );
  });
}

function handleResponse( responseData ) {
  switch ( responseData.method ) {
    case 'INIT':
      const scopes = document.getElementById('scopes');
      for ( let i = 0; i < responseData['data'].length; i++ ) {
        const element = document.createElement("a");
        element.href = '#';
        element.id = `remove-${responseData['data'][i]}`;
        element.innerHTML = responseData['data'][i];
        scopes.appendChild(element);
        scopes.appendChild(document.createElement('br'));

        element.addEventListener('click', function(evt){
          sendBackgroundMessage( 'DELETE', evt.target.id.split('-')[1]);
        })
      }
    break;

    case 'saveSuccess':
      status.textContent = 'Scope saved.';

      setTimeout(function() {
        window.location.reload();
      }, 750);
    break;

    case 'saveFailed':
      status.textContent = 'Scope already exists.';

      setTimeout(function() {
        status.textContent = '';
      }, 750);
    break;

    case 'deleteSuccess':
      status.textContent = 'Scope deleted.';

      setTimeout(function() {
        status.textContent = '';
      }, 750);

      document.getElementById(`remove-${responseData['data']}`).remove();
    break;

    case 'deleteFailed':
      status.textContent = 'Scope doesn\'t exist.';

      setTimeout(function() {
        status.textContent = '';
      }, 750);
    break;
  }
}

function save_option () {
  let scope = document.getElementById('scope').value;
  sendBackgroundMessage( 'SAVE', scope);
}

document.addEventListener('DOMContentLoaded', sendBackgroundMessage('INIT', {}));
document.getElementById('save').addEventListener('click', save_option);
