This is a simple npm package to backup Firestore databases on a schedule using Google or Firebase Cloud Functions.

# Schedule backups

- Billing needs to be enabled in order to use Firestore Import/Export. Go to your Firebase console and change your plan to 'Blaze' / 'Pay-As-You-Go'. Please note that the free tier limits are still free.
- It's advised to create a separate Storage Bucket for your backups.
  - In your Firebase console, go to 'Storage' and select 'Add bucket' in the three-dot-menu in the upper right. Name your bucket e.g. 'your-project-backups'.
  - Go to the 'Rules' tab, select your new bucket and use this rules to prevent 3rd party access:


    service firebase.storage {
        match /b/{bucket}/o {
          match /{allPaths=**} {
            allow read, write: if false;
          }
        }
      }

- Create a new Firebase Cloud Function with below code. See [here](https://firebase.google.com/docs/functions/schedule-functions) for scheduling options. Below example runs once a day.


    exports.firestore_backup = functions.pubsub.schedule('every 24 hours').onRun(firestoreBackup.createBackupHandler(
      'your-project', // The project ID to use
      'your-project-backups', // The Google Cloud Storage Bucket to use
      'path/to/backups', // Optionally: the path inside the bucket. Defaults to 'firestore'
      'firestore-instance-id' // Optionally the Firestore instance id to backup. If you did not create a second Firestore instance, you can leave this out. Defaults to '(default)'
    ))

# Restore data
Let's hope we never need this :) Refer to Firebase's [import manual](https://firebase.google.com/docs/firestore/manage-data/export-import#import_data) if you need to restore data backed up by this script.

# Disclaimer
Although I personally use this package in my projects, please note I am not responsible and can't guarantee successful backups and/or restores. Use this at your own risk.
