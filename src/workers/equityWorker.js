/* eslint-env worker */

const ranks = '23456789TJQKA';
const suits = 'hdcs';
const DECK = [];
ranks.split('').forEach(r => suits.split('').forEach(s => DECK.push(`${r}${s}`)));

const shuffle = a => { for (let i=a.length-1;i;--i){const j=~~(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };

function findNuts(board, dead) {
  const deck = DECK.filter(c => !dead.includes(c));
  let best = null, nutPairs = [];
  for (let i=0;i<deck.length;i++){
    for (let j=i+1;j<deck.length;j++){
      const hole=[deck[i],deck[j]];
      const hand=Hand.solve([...board,...hole]);
      if(!best){best=hand;nutPairs=[hole];continue;}
      const w=Hand.winners([hand,best]);
      if(w.length===1 && w[0]===hand){best=hand;nutPairs=[hole];}
      else if(w.includes(hand)&&w.includes(best)){nutPairs.push(hole);}
    }
  }
  return {name: best.name, nutPairs};
}

self.onmessage = ({ data }) => {
  self.postMessage({ test: "worker is alive", data });
};
