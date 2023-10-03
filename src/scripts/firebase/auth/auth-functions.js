import { auth } from "../config";
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { updateUserData } from "../database/database-functions";

const provider = new GoogleAuthProvider();
auth.languageCode = auth.useDeviceLanguage();

const login_through_google = () => {
  setPersistence(auth, browserLocalPersistence);

  signInWithPopup(auth, provider)
    .then((res) => {
      const cred = GoogleAuthProvider.credentialFromResult(res);
      const token = cred.accessToken;
      const user = res.user;
      console.log("ACCESS TOKEN: " + token);
      console.log("USER: ");
      console.log(user);
      console.log("LOGIN SUCCESS");

      const content = {
        email: user.email,
        name: user.displayName,
        verified: user.emailVerified,
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber,
        uid: user.uid,
        lastSignInTime: user.metadata.lastSignInTime,
        userAccountCreationTime: user.metadata.creationTime,
      };
      updateUserData(user.uid, content);
    })
    .catch((err) => {
      console.log("LOGIN ERROR");
      const error = GoogleAuthProvider.credentialFromError(err);
      console.log(error);
      alert("Sorry, there was an unexpected error logging you in.");
    });
};

const logout = () => {
  signOut(auth);
};
export { login_through_google, logout };
