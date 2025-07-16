import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { formatCard } from "./utils/cards";
import clsx from "classnames";
const qc = new QueryClient();
export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <div className="flex flex-col items-center p-6 gap-6">
        <h1 className="text-3xl font-bold">Poker Equity Calculator</h1>
        <EquityForm />
      </div>
    </QueryClientProvider>
  );
}
function EquityForm() {
  const [players, setPlayers] = useState(6);
  const [hero, setHero] = useState("Ah Kd");
  const [board, setBoard] = useState("");
  const [iters, setIters] = useState(200000);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const calc = async () => {
    setIsLoading(true);
    setData(null);
    try {
      const res = await fetch("https://poker-vk3q.onrender.com/api/equity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          players: Number(players),
          hero: hero.trim().split(/\s+/),
          board: board.trim() ? board.trim().split(/\s+/) : [],
          sims: Number(iters),
        }),
      });
      if (!res.ok) throw new Error("API error");
      const result = await res.json();
      setData(result);
    } catch (e) {
      setData({ error: e.message });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="w-full max-w-md space-y-4">
      <input
        type="number"
        min="2"
        max="10"
        value={players}
        onChange={(e) => setPlayers(e.target.value)}
        className="w-full p-2 rounded bg-slate-800"
      />
      <input
        value={hero}
        onChange={(e) => setHero(e.target.value)}
        className="w-full p-2 rounded bg-slate-800"
      />
      <input
        value={board}
        onChange={(e) => setBoard(e.target.value)}
        className="w-full p-2 rounded bg-slate-800"
      />
      <input
        type="number"
        value={iters}
        onChange={(e) => setIters(e.target.value)}
        className="w-full p-2 rounded bg-slate-800"
      />
      <button
        onClick={calc}
        disabled={isLoading}
        className={clsx(
          "w-full py-2 rounded font-semibold",
          isLoading
            ? "bg-slate-600 animate-pulse"
            : "bg-emerald-600 hover:bg-emerald-700"
        )}
      >
        {isLoading ? "Calculating…" : "Calculate"}
      </button>
      {data && <Result {...data} />}
    </div>
  );
}
function Result({ win, tie, lose, nuts, nutHolePairs, opponentNutsProb, heroHandClass, heroHandRank, higherHandChance, error }) {
  if (error) {
    return <div className="mt-6 bg-red-800 p-4 rounded text-white">Error: {error}</div>;
  }
  return (
    <div className="mt-6 bg-slate-800 p-4 rounded space-y-2">
      <h2 className="text-xl font-semibold mb-2">Results</h2>
      <p>
        Win % <strong>{win?.toFixed(2)}</strong>
      </p>
      <p>
        Tie % <strong>{tie?.toFixed(2)}</strong>
      </p>
      <p>
        Lose % <strong>{lose?.toFixed(2)}</strong>
      </p>
      <p className="pt-2">
        Current nuts: <strong>{nuts}</strong>
      </p>
      <div className="flex flex-wrap gap-2">
        {nutHolePairs?.slice(0, 10).map((p, i) => (
          <span key={i} className="bg-slate-700 px-1 rounded text-sm">
            {p.map(formatCard).join(" ")}
          </span>
        ))}
        {nutHolePairs && nutHolePairs.length > 10 && "…"}
      </div>
      <p className="pt-2">
        Pr(opponent has nuts):{" "}
        <strong>{(opponentNutsProb * 100).toFixed(2)} %</strong>
      </p>
      {heroHandClass && (
        <p>
          Your hand class: <strong>{heroHandClass}</strong>
        </p>
      )}
      {heroHandRank && (
        <p>
          Your hand rank: <strong>{heroHandRank}</strong>
        </p>
      )}
      {higherHandChance !== undefined && (
        <p>
          Chance opponent has a higher hand: <strong>{higherHandChance.toFixed(2)} %</strong>
        </p>
      )}
    </div>
  );
}
