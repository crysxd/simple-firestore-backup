exports.createBackupHandler = (bucket = undefined, bucketPath = 'firestore', firestoreInstance = '(default)') => {
  return () => {
    const moment = require('moment');
    const request = require('request-promise')
    const {
      google
    } = require('googleapis');

    let path, projectId;

    return google.auth.getProjectId().then(id => {
      projectId = id;
      return google.auth.getClient({
        scopes: ['https://www.googleapis.com/auth/datastore']
      })
    }).then(auth => {
      return auth.getAccessToken()
    }).then(accessTokenResponse => {
      const accessToken = accessTokenResponse.token;

      const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + accessToken
      };

      const timestamp = moment().format('YYYY-MM-DD HH:mm:ss')
      path = 'gs://' + `${bucket || `${projectId}.appspot.com`}/${bucketPath}/${firestoreInstance}/`.replace(/\/\//g, '/');
      if (path.endsWith('/')) {
        path += timestamp;
      } else {
        path += '/' + timestamp;
      }

      const url = `https://firestore.googleapis.com/v1beta1/projects/${projectId}/databases/${firestoreInstance}:exportDocuments`;
      const body = {
        outputUriPrefix: path
      };

      console.log(`Starting backup for firestore instace '${projectId}/${firestoreInstance}'`);

      return request.post(url, {
        json: body,
        headers: headers
      });
    }).then(response => {
      return console.log(`Backup completed with path '${path}'`);
    }).catch(e => {
      if ((e.error || {}).code == 403) {
        console.error("Backup failed: PERMISSION DENIED. This is most likely due to missing roles of the service account. Please follow the instruction to set everything up: https://bit.ly/2ZuwLZj");
      } else {
        console.error('Backup failed', e.error || e);
      }
    });
  }
}
