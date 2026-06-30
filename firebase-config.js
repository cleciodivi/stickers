// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_DeoWS9YGeGzZ9st0xEnsHoUo756efOM",
  authDomain: "stickers-play.firebaseapp.com",
  projectId: "stickers-play",
  storageBucket: "stickers-play.firebasestorage.app",
  messagingSenderId: "845339834983",
  appId: "1:845339834983:web:c7ff63f74d5332cda0b2c2",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();
