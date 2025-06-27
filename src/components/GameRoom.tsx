// src/components/GameRoom.tsx
import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import GameRound from "./GameRound";

const GameRoom = ({ roomCode }: { roomCode: string }) => {
  const [players, setPlayers] = useState<any[]>([]);
  const [hostId, setHostId] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const questions = [
    "What’s your favorite fruit?",
    "What’s the best superhero?",
    "What’s your favorite sport?",
    "What’s the worst food ever?",
    "What do you do on weekends?",
    "What’s your favorite movie?",
  ];

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "rooms", roomCode), async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const currentPlayers = data.players || [];
        setPlayers(currentPlayers);
        setHostId(data.host);
        setStarted(data.started);

        // Auto-close game if too few players
        if (data.started && currentPlayers.length < 3) {
          await updateDoc(doc(db, "rooms", roomCode), {
            started: false,
            weirdo: null,
            question: "",
            answers: [],
          });
          alert("Game ended: not enough players.");
        }
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
    const randomQuestion =
      questions[Math.floor(Math.random() * questions.length)];

    await updateDoc(doc(db, "rooms", roomCode), {
      started: true,
      weirdo: randomWeirdo.uid,
      question: randomQuestion,
      answers: [],
    });

    alert("Game started! Weirdo is secretly selected.");
  };

  const isHost = auth.currentUser?.uid === hostId;

  if (started) {
    return <GameRound roomCode={roomCode} />;
  }

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h2>Waiting Room: {roomCode}</h2>

      <h3>Players:</h3>
      <ul style={{ listStyle: "none", fontSize: "1.2rem", padding: 0 }}>
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

      {!isHost && !started && (
        <p style={{ fontStyle: "italic", color: "gray" }}>
          Waiting for host to start the game...
        </p>
      )}
    </div>
  );
};

export default GameRoom;
