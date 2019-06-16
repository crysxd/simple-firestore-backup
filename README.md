This is a simple npm package to backup Firestore databases on a schedule using Google or Firebase Cloud Functions.

# Schedule backups

- Billing needs to be enabled in order to use Firestore Import/Export. Go to your Firebase console and change your plan to 'Blaze' / 'Pay-As-You-Go'. Please note that the free tier limits are still free.
- It's advised to create a separate Storage Bucket for your backups.
  - In your Firebase console, go to 'Storage' and select 'Add bucket' in the three-dot-menu in the upper right. Name your bucket e.g. 'your-project-backups'.
  - Go to the 'Rules' tab, select your new bucket and use this rules to prevent 3rd party access:

```
service firebase.storage {
    match /b/{bucket}/o {
      match /{allPaths=**} {
        allow read, write: if false;
      }
    }
  }
```

- Add the correct permission to the Cloud Function's service account
  - Go to the [IAM page](https://console.cloud.google.com/iam-admin/iam) and make sure the right project is selected in the top left. Look for 'App Engine default service account' in the user list and click the pen icon next to it.
  - Add the role 'Datastore Import Export Admin' and 'Storage Admin'
  - It can take a couple of minutes for the new roles to be applied
  - Explanation: Import/Export is currently only available over Rest/RPC. To trigger the export this module needs to authenticate over HTTP. If the roles mentioned above are not added, the generated access token lacks the required permissions resulting in an "Backup failed { error: { code: 403, message: 'The caller does not have permission', status: 'PERMISSION_DENIED' } }" error.

- Create a new Firebase Cloud Function with below code. See [here](https://firebase.google.com/docs/functions/schedule-functions) for scheduling options. Below example runs once a day.

```
const firestoreBackup = require('simple-firestore-backup')

exports.firestore_backup = functions.runWith({
  timeoutSeconds: 540, // Increase timeout to maximum. You can remove this line if your database is not terribly large.
  memory: '128MB' // We only do one HTTP request, so we don't need many resources. Let's save money!
}).pubsub.schedule('every 24 hours').onRun(firestoreBackup.createBackupHandler(
  'your-project-backups', // The Google Cloud Storage Bucket to use (without gs://), default to the default bucket ('your-project-id.appspot.com')
  'path/to/backups', // Optionally: the path inside the bucket. Defaults to 'firestore'
  'firestore-instance-id' // Optionally the Firestore instance id to backup. If you did not create a second Firestore instance, you can leave this out. Defaults to '(default)'
))
```

# Restore data
Let's hope we never need this :) Refer to Firebase's [import manual](https://firebase.google.com/docs/firestore/manage-data/export-import#import_data) if you need to restore data backed up by this script.

# Disclaimer
Although I personally use this package in my projects, please note I am not responsible and can't guarantee successful backups and/or restores. Use this at your own risk.
