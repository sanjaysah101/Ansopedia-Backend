const admin = require("firebase-admin");
class FirebaseAdminApp {
    //     // static firebaseApp = null;
    constructor(credentials) {
        this.firebaseAdminApp = admin.initializeApp({
            credential: admin.credential.cert(credentials)
        });
    }
    static getInstance(credentials) {
        if (!this.instance) {
            this.instance = new FirebaseAdminApp(credentials);
        }
        return this.instance;
    }
}
module.exports = { FirebaseAdminApp };

