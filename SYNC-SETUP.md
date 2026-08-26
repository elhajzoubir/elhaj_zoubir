# Firebase Sync

This project keeps the original application files and adds the sync layer separately.

Files:
- `firebase-config.js` - Firebase project configuration
- `firebase-sync.js` - Firestore sync/delete logic
- `firestore.rules.txt` - Firestore rules for `hz_sync/{roomId}`

Anonymous Authentication must be enabled in Firebase Authentication.
Firestore must exist and use the rules above.

The original printing code in `index.html` is not replaced by the sync module.
