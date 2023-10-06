// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDUb2l9-4Ym4JyinFVj-mudq9svWKQZR0c",
  authDomain: "adloxs-approval-v1.firebaseapp.com",
  databaseURL: "https://adloxs-approval-v1-default-rtdb.firebaseio.com",
  projectId: "adloxs-approval-v1",
  storageBucket: "adloxs-approval-v1.appspot.com",
  messagingSenderId: "133751828740",
  appId: "1:133751828740:web:fc60dfda95c866a6846051"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();