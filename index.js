exports.createBackupHandler = (bucket = undefined, bucketPath = 'firestore', firestoreInstance = '(default)') => {
  return () => {
    const moment = require('moment');
    const request = require('request-promise')
    const {
      google
    } = require('googleapis');

    let path, accessToken, projectId;

    return google.auth.getProjectId().then(id => {
      projectId = id;
      return google.auth.getClient({
        scopes: ['https://www.googleapis.com/auth/datastore']
      })
    }).then(auth => {
      return auth.getAccessToken()
    }).then(accessTokenResponse => {
      accessToken = accessTokenResponse.token;
      return request.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`)
    }).then(response => {
      console.log(`Running with user '${JSON.parse(response).email}' on project '${projectId}'`);

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
      console.log(`Backup completed with path '${path}'`);
    }).catch(e => {
      console.error('Backup failed', e.error || e);
    });
  }
}
