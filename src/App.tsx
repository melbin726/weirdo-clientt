import React, { useEffect, useState } from "react";
import { createRoom } from "./utils/createRoom";
import { db, auth } from "./firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  onSnapshot,
} from "firebase/firestore";
import GameRoom from "./components/GameRoom";

function App() {
  const [roomCode, setRoomCode] = useState("");
  const [name, setName] = useState("");
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [players, setPlayers] = useState<any[]>([]);

  // Ensure user is signed in before anything
  const [authReady, setAuthReady] = useState(false);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  const handleCreateRoom = async () => {
    const user = auth.currentUser;
    const enteredRoomCode = prompt("Enter Room Code (like 'room123'):");

    if (user && enteredRoomCode && name) {
      await createRoom(enteredRoomCode, user.uid);

      // Host joins as player too
      const roomRef = doc(db, "rooms", enteredRoomCode);
      await updateDoc(roomRef, {
        players: arrayUnion({ name, uid: user.uid }),
      });

      alert(`Room '${enteredRoomCode}' created and joined as host!`);
      setRoomCode(enteredRoomCode);
      setJoinedRoom(true);
    } else {
      alert("Please enter your name before creating room");
    }
  };

  const handleJoinRoom = async () => {
    if (!name || !roomCode) {
      alert("Please enter both name and room code");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("User not authenticated");
      return;
    }

    const roomRef = doc(db, "rooms", roomCode);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      alert("Room not found!");
      return;
    }

    await updateDoc(roomRef, {
      players: arrayUnion({ name, uid: user.uid }),
    });

    alert(`Joined room '${roomCode}' as ${name}`);
    setJoinedRoom(true);
  };

  // Remove player if they leave the tab
  useEffect(() => {
    if (!roomCode || !auth.currentUser?.uid) return;

    const unsub = onSnapshot(doc(db, "rooms", roomCode), (docSnap) => {
      if (docSnap.exists()) {
        setPlayers(docSnap.data().players || []);
      }
    });

    const handleLeave = async () => {
      const uid = auth.currentUser?.uid;
      const roomRef = doc(db, "rooms", roomCode);
      const remainingPlayers = players.filter((p) => p.uid !== uid);

      await updateDoc(roomRef, { players: remainingPlayers });
    };

    window.addEventListener("beforeunload", handleLeave);
    return () => {
      handleLeave();
      window.removeEventListener("beforeunload", handleLeave);
      unsub();
    };
  }, [roomCode, players]);

  if (!authReady) return <p>Loading Firebase...</p>;

  if (joinedRoom) {
    return <GameRoom roomCode={roomCode} />;
  }

  return (
    <div style={{ textAlign: "center", marginTop: "3rem" }}>
      <h1>🎭 Who's the Weirdo?</h1>

      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ padding: "0.5rem", margin: "0.5rem" }}
      />

      <button
        onClick={handleCreateRoom}
        style={{
          padding: "1rem",
          margin: "1rem",
          backgroundColor: "purple",
          color: "white",
          fontSize: "1.1rem",
          border: "none",
          borderRadius: "8px",
        }}
      >
        ➕ Create Room
      </button>

      <div style={{ marginTop: "2rem" }}>
        <h2>Join a Room</h2>
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
            borderRadius: "8px",
          }}
        >
          ✅ Join Room
        </button>
      </div>
    </div>
  );
}

export default App;
