import { useMutation } from '@tanstack/react-query';
import { rankCards } from 'phe';

function getDeck() {
  const ranks = '23456789TJQKA';
  const suits = 'cdhs';
  const deck = [];
  for (let r of ranks) for (let s of suits) deck.push(r + s);
  return deck;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function findNuts(board, dead) {
  const deck = getDeck().filter(c => !dead.includes(c));
  let best = null, nutPairs = [];
  for (let i = 0; i < deck.length; i++) {
    for (let j = i + 1; j < deck.length; j++) {
      const hole = [deck[i], deck[j]];
      const handRank = rankCards([...board, ...hole]);
      if (best === null || handRank < best) {
        best = handRank;
        nutPairs = [hole];
      } else if (handRank === best) {
        nutPairs.push(hole);
      }
    }
  }
  return { name: best, nutPairs };
}

export const useEquity = () => useMutation(({ hero, board, players, iterations }) => {
  return new Promise((resolve) => {
    const dead = [...hero, ...board];
    const { name: nutName, nutPairs } = findNuts(board, dead);
    let win = 0, tie = 0, oppHasNuts = 0, oppCount = players - 1;
    const nutSet = new Set(nutPairs.map(p => p.join()).concat(nutPairs.map(p => [p[1], p[0]].join())));
    for (let t = 0; t < iterations; t++) {
      const deck = shuffle(getDeck().filter(c => !dead.includes(c)));
      const oppHands = Array.from({ length: oppCount }, _ => [deck.pop(), deck.pop()]);
      const runout = board.concat(deck.splice(0, 5 - board.length));
      const heroRank = rankCards([...runout, ...hero]);
      const oppRanks = oppHands.map(h => rankCards([...runout, ...h]));
      const allRanks = [heroRank, ...oppRanks];
      const minRank = Math.min(...allRanks); // Lower is better in phe
      const winners = allRanks.filter(r => r === minRank);
      if (winners[0] === heroRank && winners.length === 1) win++;
      else if (winners.includes(heroRank)) tie++;
      if (oppHands.some(h => nutSet.has(h.join('')))) oppHasNuts++;
    }
    resolve({
      win: win / iterations * 100,
      tie: tie / iterations * 100,
      lose: (iterations - win - tie) / iterations * 100,
      nuts: { name: nutName, holePairs: nutPairs },
      opponentNutsProb: oppHasNuts / iterations
    });
  });
});
