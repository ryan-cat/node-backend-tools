import { auth } from 'firebase-admin';

export interface FirebaseConfig {
  projectId: string;
  privateKey: string;
  clientEmail: string;
}

export const firebaseConfig = (): FirebaseConfig => ({
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL
});

export const authenticate = async (token: string): Promise<auth.DecodedIdToken | void> => {
  let result: auth.DecodedIdToken | void = null;

  if (token && token.startsWith('Bearer ')) {
    token = token.replace('Bearer ', '');
    result = await auth()
      .verifyIdToken(token)
      .catch(() => {});
  }

  return result;
};
