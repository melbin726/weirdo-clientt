import React, { useState } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";

function JoinRoom() {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const handleJoin = async () => {
    if (!name || !roomCode) {
      alert("Enter name and room code");
      return;
    }

    const roomRef = doc(db, "rooms", roomCode);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      alert("Room not found");
      return;
    }

    await updateDoc(roomRef, {
      players: arrayUnion({ name, uid: auth.currentUser?.uid })
    });

    alert(`Joined room ${roomCode} as ${name}`);
    // TODO: Navigate to waiting room or game screen
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h2>Join a Room</h2>
      <input
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ padding: "0.5rem", margin: "0.5rem" }}
      />
      <input
        placeholder="Room code"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
        style={{ padding: "0.5rem", margin: "0.5rem" }}
      />
      <br />
      <button
        onClick={handleJoin}
        style={{
          padding: "1rem",
          background: "green",
          color: "white",
          fontSize: "1rem",
        }}
      >
        Join Room
      </button>
    </div>
  );
}

export default JoinRoom;
