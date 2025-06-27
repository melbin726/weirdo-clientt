import React, { useState } from "react";
import { createRoom } from "./utils/createRoom";
import { db, auth } from "./firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import GameRoom from "./components/GameRoom";

function App() {
  const [roomCode, setRoomCode] = useState("");
  const [name, setName] = useState("");
  const [joinedRoom, setJoinedRoom] = useState(false);

  const handleCreateRoom = async () => {
    const user = auth.currentUser;
    const newRoomCode = prompt("Enter Room Code (like 'room123'):");
    if (user && newRoomCode) {
      await createRoom(newRoomCode, user.uid);
      alert(`Room '${newRoomCode}' created!`);
      setRoomCode(newRoomCode);
    }
  };

  const handleJoinRoom = async () => {
    if (!name || !roomCode) {
      alert("Please enter both name and room code");
      return;
    }

    const roomRef = doc(db, "rooms", roomCode);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      alert("Room not found!");
      return;
    }

    await updateDoc(roomRef, {
      players: arrayUnion({ name, uid: auth.currentUser?.uid })
    });

    alert(`Joined room '${roomCode}' as ${name}`);
    setJoinedRoom(true);
  };

  if (joinedRoom) {
    return <GameRoom roomCode={roomCode} />;
  }

  return (
    <div style={{ textAlign: "center", marginTop: "3rem" }}>
      <h1>🎭 Who's the Weirdo?</h1>

      <button
        onClick={handleCreateRoom}
        style={{
          padding: "1rem",
          margin: "1rem",
          backgroundColor: "purple",
          color: "white",
          fontSize: "1.1rem",
          border: "none",
          borderRadius: "8px"
        }}
      >
        ➕ Create Room
      </button>

      <div style={{ marginTop: "3rem" }}>
        <h2>Join a Room</h2>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: "0.5rem", margin: "0.5rem" }}
        />
        <input
          type="text"
          placeholder="Room code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          style={{ padding: "0.5rem", margin: "0.5rem" }}
        />
        <br />
        <button
          onClick={handleJoinRoom}
          style={{
            padding: "0.8rem",
            backgroundColor: "green",
            color: "white",
            fontSize: "1rem",
            border: "none",
            borderRadius: "8px"
          }}
        >
          ✅ Join Room
        </button>
      </div>
    </div>
  );
}

export default App;
