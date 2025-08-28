
import { initializeApp, getApps } from 'firebase/app';

const firebaseConfig = {
  "projectId": "eventide-x19jx",
  "appId": "1:628831314444:web:707690f437aa8eff1f8429",
  "storageBucket": "eventide-x19jx.appspot.com",
  "apiKey": "AIzaSyDR0ddITn2v67WYjtcQgCU9a1Kfesan9z4",
  "authDomain": "eventide-x19jx.firebaseapp.com",
  "messagingSenderId": "628831314444"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export { app };
