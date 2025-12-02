const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");

const firebaseConfig = {
    apiKey: "AIzaSyA_AGv_ZedWcWbj16ZbW32bPxlZhfCpIyI",
    authDomain: "lumen-c0ed2.firebaseapp.com",
    projectId: "lumen-c0ed2",
    storageBucket: "lumen-c0ed2.firebasestorage.app",
    messagingSenderId: "345399810566",
    appId: "1:345399810566:web:71d8528663310d31b64187",
    measurementId: "G-LR83G0H0G8",
    databaseURL: "https://lumen-c0ed2-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

module.exports = { db };
