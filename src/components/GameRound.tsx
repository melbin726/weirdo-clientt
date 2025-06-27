import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore";

const GameRound = ({ roomCode }: { roomCode: string }) => {
  const [question, setQuestion] = useState("");
  const [weirdoId, setWeirdoId] = useState("");
  const [answer, setAnswer] = useState("");
  const [hasAnswered, setHasAnswered] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "rooms", roomCode), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setQuestion(data.question);
        setWeirdoId(data.weirdo);
        const userAnswer = data.answers?.find((a: any) => a.uid === auth.currentUser?.uid);
        setHasAnswered(!!userAnswer);
      }
    });

    return () => unsub();
  }, [roomCode]);

  const submitAnswer = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid || !answer) return;

    await updateDoc(doc(db, "rooms", roomCode), {
      answers: arrayUnion({
        uid,
        name: auth.currentUser?.displayName || "Anon",
        answer
      })
    });

    setHasAnswered(true);
  };

  const isWeirdo = auth.currentUser?.uid === weirdoId;

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h2>Round 1</h2>

      {isWeirdo ? (
        <h3>You are the 😈 **Weirdo!** Pretend you know the question and try to blend in.</h3>
      ) : (
        <h3>Question: 🤔 {question}</h3>
      )}

      {!hasAnswered ? (
        <>
          <input
            placeholder="Your answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            style={{ padding: "0.5rem", margin: "1rem", width: "60%" }}
          />
          <br />
          <button onClick={submitAnswer} style={{ padding: "0.7rem", fontSize: "1rem" }}>
            Submit Answer
          </button>
        </>
      ) : (
        <h4>✅ Answer submitted! Waiting for others...</h4>
      )}
    </div>
  );
};

export default GameRound;
