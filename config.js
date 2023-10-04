const { initializeApp } = require("firebase/app");
const { getDatabase } = require("firebase/database");

const firebaseConfig = {
  apiKey: "AIzaSyAOKUHCGBPJK7xzOqC6bbgO9CAoEvVNq8s",
  authDomain: "wluflow.firebaseapp.com",
  projectId: "wluflow",
  storageBucket: "wluflow.appspot.com",
  messagingSenderId: "365070536908",
  appId: "1:365070536908:web:ec6698c5f7babe0972f269",
};

const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);

module.exports = {
  firebaseApp,
  database,
};
