

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import { getFirestore } from
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

import { getAuth } from
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

// Substitua pelos dados do seu aplicativo Web no Firebase Console.
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCJsc33OLMGk4u9fijC1A4a8Gaer2slU_I",
  authDomain: "datavotocesf-quillo.firebaseapp.com",
  projectId: "datavotocesf-quillo",
  storageBucket: "datavotocesf-quillo.firebasestorage.app",
  messagingSenderId: "1062774734330",
  appId: "1:1062774734330:web:f301375dc68da3990bb843",
  measurementId: "G-LSLJZLWFR5"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

// Verifica se os exemplos foram substituídos.
export const firebaseConfigurado =
  Object.values(firebaseConfig).every(valor =>
    valor && !valor.startsWith("SUA_") &&
    !valor.startsWith("SEU_")
  );
