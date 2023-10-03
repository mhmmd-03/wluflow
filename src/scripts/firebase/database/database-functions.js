import { database } from "../config";
import { ref, child, push, update } from "firebase/database";

// REFS:
const userRef = "/users/";

const updateUserData = (uid, content) => {
  const updates = {};
  updates[userRef + uid] = content;
  update(ref(database), updates);
};

export { updateUserData };
