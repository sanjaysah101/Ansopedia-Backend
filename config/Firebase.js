const {initializeApp} = require("firebase/app");
// const credentials = require("./firebase-adminsdk.json");
const firebaseConfig = {

  };

 

const firebaseApp = initializeApp(
    firebaseConfig
);

module.exports = firebaseApp;
 
