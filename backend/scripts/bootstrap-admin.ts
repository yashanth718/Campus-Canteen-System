import { db, auth } from '../src/config/firebase';

async function bootstrapAdmin() {
  const email = process.argv[2] || process.env.BOOTSTRAP_ADMIN_EMAIL;

  if (!email) {
    console.error('Error: Please specify the admin email to bootstrap.');
    console.log('Usage: npm run bootstrap-admin <user-email>');
    console.log('Example: npm run bootstrap-admin admin@canteen.edu');
    process.exit(1);
  }

  console.log(`[Bootstrap] Bootstrapping administrator for email: ${email}`);

  try {
    let uid = '';
    let displayName = 'Campus Canteen Admin';

    try {
      const userRecord = await auth.getUserByEmail(email);
      uid = userRecord.uid;
      displayName = userRecord.displayName || displayName;
      console.log(`[Bootstrap] Found Firebase Auth user with UID: ${uid}`);
    } catch {
      console.log(`[Bootstrap] Firebase Auth user not found for ${email}. Using email prefix as fallback UID.`);
      uid = `admin-${email.split('@')[0]}`;
    }

    const now = new Date().toISOString();
    await db.collection('users').doc(uid).set(
      {
        uid,
        email,
        displayName,
        role: 'admin',
        active: true,
        updatedAt: now,
      },
      { merge: true }
    );

    // Also attempt to set custom user claims if Firebase Admin is connected
    try {
      await auth.setCustomUserClaims(uid, { role: 'admin' });
      console.log(`[Bootstrap] Successfully set custom claim { role: 'admin' } for UID: ${uid}`);
    } catch (claimErr) {
      console.log('[Bootstrap] Note: Setting custom claims skipped or not supported:', claimErr);
    }

    console.log(`\n🎉 Administrator successfully bootstrapped for: ${email}`);
    console.log(`UID: ${uid}`);
    console.log(`Role: admin`);
  } catch (error) {
    console.error('[Bootstrap] Failed to bootstrap admin:', error);
    process.exit(1);
  }
}

bootstrapAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
