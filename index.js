exports.createBackupHandler = (projectId, bucket, bucketPath = 'firestore', firestoreInstance = '(default)') => {
  return () => {
    const moment = require('moment');
    const request = require('request-promise')
    const {
      google
    } = require('googleapis');

    let path;

    return google.auth.getClient({
      scopes: ['https://www.googleapis.com/auth/datastore']
    }).then(auth => {
      return auth.getAccessToken()
    }).then(accessTokenResponse => {
      const accessToken = accessTokenResponse.token;

      const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + accessToken
      };

      const timestamp = moment().format('YYYY-MM-DD HH:mm:ss')
      path = 'gs://' + `${bucket}/${bucketPath}/${firestoreInstance}/`.replace(/\/\//g, '/');
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
      console.log(`Backup completed with path '${path}'`);
    }).catch(e => {
      console.error('Backup failed', e.error || e);
    });
  }
}
