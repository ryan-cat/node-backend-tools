import { firebaseConfig, authenticate } from './index';
import firebase from 'firebase-admin';

jest.mock('firebase-admin', () => {
  const auth = jest.fn().mockReturnValue({
    verifyIdToken: jest.fn()
  });

  return { auth };
});

const firebaseMock = firebase as jest.MockedClass<any>;

describe('firebase config', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // most important - it clears the cache
    process.env = { ...OLD_ENV }; // make a copy
  });

  afterAll(() => {
    process.env = OLD_ENV; // restore old env
  });

  it('should return proper config', () => {
    process.env.FIREBASE_PROJECT_ID = 'project';
    process.env.FIREBASE_PRIVATE_KEY = 'privatekey';
    process.env.FIREBASE_CLIENT_EMAIL = 'clientemail';

    const config = firebaseConfig();

    expect(config.projectId).toBe(process.env.FIREBASE_PROJECT_ID);
    expect(config.privateKey).toBe(process.env.FIREBASE_PRIVATE_KEY);
    expect(config.clientEmail).toBe(process.env.FIREBASE_CLIENT_EMAIL);
  });
});

describe('firebase auth', () => {
  it('should not authenticate when not bearer token', async () => {
    const token = 'asdfasdfasfd';

    const result = await authenticate(token);

    expect(result).toBeNull();
  });

  it('should returm null for invalid token', async () => {
    const token = 'Bearer asdfasdfasfd';

    firebaseMock.auth().verifyIdToken.mockRejectedValueOnce(new Error('Invalid token'));

    const result = await authenticate(token);

    expect(result).toBeUndefined();
  });

  it('should returm null for invalid token', async () => {
    const token = 'Bearer asdfasdfasfd';

    const decodedToken = {
      uid: 'abcd'
    };

    firebaseMock.auth().verifyIdToken.mockResolvedValue(decodedToken);

    const result = await authenticate(token);

    expect(result).toEqual(decodedToken);
  });
});
