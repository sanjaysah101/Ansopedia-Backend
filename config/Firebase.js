const {initializeApp} = require("firebase/app");
// const credentials = require("./firebase-adminsdk.json");
const firebaseConfig = {
    apiKey: "AIzaSyDC50dtiCOHa8iav2te31Z5UNb7e2gi0uo",
    authDomain: "ansopedia-aeb06.firebaseapp.com",
    projectId: "ansopedia-aeb06",
    storageBucket: "ansopedia-aeb06.appspot.com",
    messagingSenderId: "290159073203",
    appId: "1:290159073203:web:92b79c2339d34f854b9dc6"
  };

 

const firebaseApp = initializeApp(
    firebaseConfig
);

module.exports = firebaseApp;
 