
"use client";

import { useState } from "react";

type Player = {
  id: number;
  name: string;
  type: "human" | "npc";
  isHost: boolean;
};

const MIN_PLAYERS = 4;
const MAX_PLAYERS = 6;

const NPC_NAMES = [
  "Alex",
  "Sarah",
  "Daniel",
  "Emma",
  "Ryan",
  "Sofia",
];

export default function LobbyPage() {
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [hasCreatedRoom, setHasCreatedRoom] = useState(false);
  const [message, setMessage] = useState("");

  function createRoom() {
    if (!playerName.trim()) {
      setMessage("Please enter your name first.");
      return;
    }

    const code = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    setRoomCode(code);
    setPlayers([
      {
        id: Date.now(),
        name: playerName.trim(),
        type: "human",
        isHost: true,
      },
    ]);

    setHasCreatedRoom(true);
    setMessage("Your game room has been created!");
  }

  function joinRoom() {
    if (!playerName.trim() || !roomCode.trim()) {
      setMessage("Enter your name and room code.");
      return;
    }

    if (players.length >= MAX_PLAYERS) {
      setMessage("This room is full.");
      return;
    }

    setPlayers((current) => [
      ...current,
      {
        id: Date.now(),
        name: playerName.trim(),
        type: "human",
        isHost: false,
      },
    ]);

    setMessage("Player added to the local prototype.");
  }

  function addNPC() {
    if (players.length >= MAX_PLAYERS) {
      setMessage("The room is already full.");
      return;
    }

    const usedNames = players.map((player) => player.name);
    const availableName = NPC_NAMES.find(
      (name) => !usedNames.includes(name)
    );

    if (!availableName) {
      setMessage("No more NPC names available.");
      return;
    }

    const newNPC: Player = {
      id: Date.now(),
      name: availableName,
      type: "npc",
      isHost: false,
    };

    setPlayers((current) => [...current, newNPC]);
    setMessage(`${availableName} has joined the lobby!`);
  }

  function removeNPC(id: number) {
    setPlayers((current) =>
      current.filter(
        (player) => player.id !== id || player.type !== "npc"
      )
    );

    setMessage("NPC removed from the lobby.");
  }

  function startGame() {
    if (players.length < MIN_PLAYERS) {
      setMessage("At least 4 participants are required.");
      return;
    }

    if (players.length > MAX_PLAYERS) {
      setMessage("A maximum of 6 participants is allowed.");
      return;
    }

    setMessage("Game ready! Next, we'll build the game board.");
  }

  const canStart =
    players.length >= MIN_PLAYERS &&
    players.length <= MAX_PLAYERS;

  return (
    <main className="min-h-screen bg-[#10152D] text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">

        <header className="text-center mb-10">
          <p className="text-sm tracking-[0.3em] text-amber-400">
            BUSINESS BOARD GAME
          </p>

          <h1 className="text-5xl font-black mt-3">
            NIAGA<span className="text-amber-400">QUEST</span>
          </h1>

          <p className="text-slate-400 mt-3">
            Build your strategy. Make your move. Win the business race.
          </p>
        </header>

        {!hasCreatedRoom ? (
          <div className="grid md:grid-cols-2 gap-6">

            <section className="bg-[#1C2342] rounded-2xl p-8 border border-slate-700">
              <h2 className="text-2xl font-bold mb-2">
                Create a Game
              </h2>

              <p className="text-slate-400 mb-6">
                Start a new session and invite your friends.
              </p>

              <label className="block text-sm mb-2">
                Your Name
              </label>

              <input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-lg bg-[#10152D] border border-slate-600 p-3 mb-5 outline-none focus:border-amber-400"
              />

              <button
                onClick={createRoom}
                className="w-full bg-amber-400 text-slate-950 font-bold py-3 rounded-lg hover:bg-amber-300"
              >
                Create Room
              </button>
            </section>

            <section className="bg-[#1C2342] rounded-2xl p-8 border border-slate-700">
              <h2 className="text-2xl font-bold mb-2">
                Join a Game
              </h2>

              <p className="text-slate-400 mb-6">
                Enter a room code to join an existing session.
              </p>

              <label className="block text-sm mb-2">
                Your Name
              </label>

              <input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-lg bg-[#10152D] border border-slate-600 p-3 mb-4 outline-none focus:border-amber-400"
              />

              <label className="block text-sm mb-2">
                Room Code
              </label>

              <input
                value={roomCode}
                onChange={(e) =>
                  setRoomCode(e.target.value.toUpperCase())
                }
                placeholder="e.g. ABC123"
                className="w-full rounded-lg bg-[#10152D] border border-slate-600 p-3 mb-5 outline-none focus:border-amber-400"
              />

              <button
                onClick={joinRoom}
                className="w-full bg-indigo-500 text-white font-bold py-3 rounded-lg hover:bg-indigo-400"
              >
                Join Room
              </button>
            </section>

          </div>
        ) : (
          <section className="bg-[#1C2342] rounded-2xl p-8 border border-slate-700">

            <div className="text-center mb-8">
              <p className="text-slate-400 text-sm">
                YOUR ROOM CODE
              </p>

              <h2 className="text-4xl font-black text-amber-400 tracking-widest mt-2">
                {roomCode}
              </h2>

              <p className="text-slate-400 mt-2">
                Share this code with your friends.
              </p>
            </div>

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Players</h3>

              <span className="text-sm text-slate-400">
                {players.length} / {MAX_PLAYERS}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="bg-[#10152D] border border-slate-700 rounded-xl p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">{player.name}</p>

                    <span
                      className={`text-xs ${
                        player.type === "npc"
                          ? "text-indigo-300"
                          : "text-emerald-400"
                      }`}
                    >
                      {player.isHost
                        ? "HOST · HUMAN"
                        : player.type === "npc"
                        ? "NPC"
                        : "HUMAN PLAYER"}
                    </span>
                  </div>

                  {player.type === "npc" && (
                    <button
                      onClick={() => removeNPC(player.id)}
                      className="text-red-400 text-sm hover:text-red-300"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              {Array.from(
                { length: MAX_PLAYERS - players.length },
                (_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="border border-dashed border-slate-600 rounded-xl p-4 text-slate-500 flex items-center"
                  >
                    <span>＋ Empty slot</span>
                  </div>
                )
              )}
            </div>

            <button
              onClick={addNPC}
              disabled={players.length >= MAX_PLAYERS}
              className="w-full border border-indigo-400 text-indigo-300 font-bold py-3 rounded-xl mb-6 hover:bg-indigo-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              + Add NPC Player
            </button>

            <div className="text-center mb-6">
              <p className="text-slate-400 text-sm">
                Minimum 4 participants · Maximum 6 participants
              </p>

              <p className="text-2xl font-bold mt-2">
                {canStart
                  ? "Your game is ready!"
                  : `${MIN_PLAYERS - players.length} more participants needed`}
              </p>
            </div>

            <button
              onClick={startGame}
              disabled={!canStart}
              className="w-full bg-amber-400 text-slate-950 font-bold py-4 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-300"
            >
              Start Game
            </button>

          </section>
        )}

        {message && (
          <p className="text-center text-amber-300 mt-6">
            {message}
          </p>
        )}

        <p className="text-center text-slate-500 text-sm mt-10">
          NIAGAQUEST © 2026
        </p>

      </div>
    </main>
  );
}
