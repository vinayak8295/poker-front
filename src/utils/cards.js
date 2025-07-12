const SUIT_SYMBOL = { h: '♥', d: '♦', c: '♣', s: '♠' };
export const formatCard = (code) => `[${code[0].toUpperCase()}${SUIT_SYMBOL[code[1]]}]`;
