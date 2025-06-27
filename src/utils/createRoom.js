// src/utils/createRoom.js
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

export const createRoom = async (roomId, hostId) => {
  await setDoc(doc(db, "rooms", roomId), {
    host: hostId,
    players: [],
    started: false,
    round: 1,
    weirdo: null
  });
};
