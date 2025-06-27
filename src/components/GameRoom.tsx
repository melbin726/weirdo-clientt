import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

const GameRoom = ({ roomCode }: { roomCode: string }) => {
  const [players, setPlayers] = useState<any[]>([]);
  const [hostId, setHostId] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "rooms", roomCode), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPlayers(data.players || []);
        setHostId(data.host);
        setStarted(data.started);
      }
    });

    return () => unsub();
  }, [roomCode]);

  const startGame = async () => {
    if (players.length < 3) {
      alert("Need at least 3 players to start");
      return;
    }

    const randomWeirdo = players[Math.floor(Math.random() * players.length)];

    await updateDoc(doc(db, "rooms", roomCode), {
      started: true,
      weirdo: randomWeirdo.uid,
    });

    alert(`Game started! Weirdo is selected (secret)`);
  };

  const isHost = auth.currentUser?.uid === hostId;

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h2>Waiting Room: {roomCode}</h2>
      <h3>Players:</h3>
      <ul style={{ listStyle: "none", fontSize: "1.2rem" }}>
        {players.map((p, index) => (
          <li key={index}>👤 {p.name}</li>
        ))}
      </ul>

      {isHost && !started && (
        <button
          onClick={startGame}
          style={{
            padding: "1rem",
            fontSize: "1rem",
            backgroundColor: "orange",
            color: "white",
            border: "none",
            borderRadius: "8px",
            marginTop: "1rem",
          }}
        >
          🚀 Start Game
        </button>
      )}

      {started && <h3>Game has started!</h3>}
    </div>
  );
};

export default GameRoom;
