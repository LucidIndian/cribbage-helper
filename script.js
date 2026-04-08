const SUITS = ['h', 'd', 'c', 's'];
const RANKS = ['A','2','3','4','5','6','7','8','9','T','J','Q','K'];
const RANK_VALUES = {A:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,T:10,J:10,Q:10,K:10};
const UNICODE_CARDS = {
  'Ah':'🂡','2h':'🂢','3h':'🂣','4h':'🂤','5h':'🂥','6h':'🂦','7h':'🂧','8h':'🂨','9h':'🂩','Th':'🂪','Jh':'🂫','Qh':'🂭','Kh':'🂮',
  'Ad':'🃁','2d':'🃂','3d':'🃃','4d':'🃄','5d':'🃅','6d':'🃆','7d':'🃇','8d':'🃈','9d':'🃉','Td':'🃊','Jd':'🃋','Qd':'🃍','Kd':'🃎',
  'Ac':'🃑','2c':'🃒','3c':'🃓','4c':'🃔','5c':'🃕','6c':'🃖','7c':'🃗','8c':'🃘','9c':'🃙','Tc':'🃚','Jc':'🃛','Qc':'🃝','Kc':'🃞',
  'As':'🂡','2s':'🂢','3s':'🂣','4s':'🂤','5s':'🂥','6s':'🂦','7s':'🂧','8s':'🂨','9s':'🂩','Ts':'🂪','Js':'🂫','Qs':'🂭','Ks':'🂮'  // spades same as hearts but black
};

let fullDeck = [];
let dealtCards = [];
let currentKeep = null;
let currentCut = null;
let myScore = 0;
let momScore = 0;

function createDeck() {
  fullDeck = [];
  for (let suit of SUITS) {
    for (let rank of RANKS) {
      fullDeck.push({rank, suit, value: RANK_VALUES[rank], display: UNICODE_CARDS[rank + suit]});
    }
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function dealCards() {
  createDeck();
  shuffle(fullDeck);
  dealtCards = fullDeck.slice(0, 6);
  renderDealtCards();
  document.getElementById('results').classList.remove('hidden');
  computeAllEVs();
}

function renderDealtCards() {
  const container = document.getElementById('dealt-cards');
  container.innerHTML = dealtCards.map((card, i) => `
    <div class="text-center">
      <div class="card ${card.suit === 'h' || card.suit === 'd' ? 'red' : ''}">${card.display}</div>
      <div class="text-xs mt-1">Card ${i+1}</div>
    </div>
  `).join('');
}

// ==================== FULL CRIBBAGE SCORING ====================
function scoreHand(hand4, cut) {
  const all5 = [...hand4, cut];
  let score = 0;
  let breakdown = [];

  // 1. Fifteens (any combo that sums to 15)
  let fifteenCount = 0;
  function countFifteens(idx, sum) {
    if (idx === 5) { if (sum === 15) fifteenCount++; return; }
    countFifteens(idx + 1, sum);
    countFifteens(idx + 1, sum + all5[idx].value);
  }
  countFifteens(0, 0);
  score += fifteenCount * 2;
  if (fifteenCount) breakdown.push(`${fifteenCount}×15s = ${fifteenCount*2}`);

  // 2. Pairs
  const rankCount = {};
  all5.forEach(c => rankCount[c.rank] = (rankCount[c.rank] || 0) + 1);
  let pairPts = 0;
  Object.values(rankCount).forEach(cnt => pairPts += cnt * (cnt - 1) / 2 * 2);
  score += pairPts;
  if (pairPts) breakdown.push(`Pairs = ${pairPts}`);

  // 3. Runs (maximal consecutive sequences × multiplicity)
  const sortedRanks = [...new Set(all5.map(c => c.rank))].sort((a, b) => a - b);
  const counts = {};
  all5.forEach(c => counts[c.rank] = (counts[c.rank] || 0) + 1);
  let runPts = 0;
  let i = 0;
  while (i < sortedRanks.length) {
    let j = i;
    while (j + 1 < sortedRanks.length && sortedRanks[j + 1] === sortedRanks[j] + 1) j++;
    const length = j - i + 1;
    if (length >= 3) {
      let product = 1;
      for (let k = i; k <= j; k++) product *= counts[sortedRanks[k]];
      runPts += length * product;
    }
    i = j + 1;
  }
  score += runPts;
  if (runPts) breakdown.push(`Runs = ${runPts}`);

  // 4. Flush
  const handSuits = hand4.map(c => c.suit);
  const allSameHand = handSuits.every(s => s === handSuits[0]);
  const allSame5 = allSameHand && cut.suit === handSuits[0];
  if (allSame5) { score += 5; breakdown.push('5-card flush = 5'); }
  else if (allSameHand) { score += 4; breakdown.push('4-card flush = 4'); }

  // 5. His Nobs
  const hasNobs = hand4.some(c => c.rank === 'J' && c.suit === cut.suit);
  if (hasNobs) { score += 1; breakdown.push('His nobs = 1'); }

  return { total: score, breakdown: breakdown.join(' • ') || 'Nothing' };
}

// ==================== EV CALCULATION ====================
function getCombinations(arr, k) {
  const result = [];
  function combine(start, combo) {
    if (combo.length === k) { result.push([...combo]); return; }
    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i]);
      combine(i + 1, combo);
      combo.pop();
    }
  }
  combine(0, []);
  return result;
}

function computeAllEVs() {
  const container = document.getElementById('keep-list');
  container.innerHTML = '';

  const combos = getCombinations(dealtCards, 4); // all ways to keep 4
  const evList = [];

  combos.forEach(keep => {
    const discard = dealtCards.filter(c => !keep.includes(c));
    // remaining possible cuts
    const used = new Set(dealtCards.map(c => c.rank + c.suit));
    const possibleCuts = fullDeck.filter(c => !used.has(c.rank + c.suit));

    let totalScore = 0;
    possibleCuts.forEach(cut => {
      const { total } = scoreHand(keep, cut);
      totalScore += total;
    });

    const ev = (totalScore / possibleCuts.length).toFixed(2);
    evList.push({ keep, discard, ev: parseFloat(ev), keepStr: keep.map(c => c.display).join(' ') });
  });

  // sort by EV descending
  evList.sort((a, b) => b.ev - a.ev);

  evList.forEach(item => {
    const div = document.createElement('div');
    div.className = `flex items-center bg-gray-700 rounded-2xl p-4 cursor-pointer hover:bg-gray-600`;
    div.innerHTML = `
      <div class="flex-1">
        <div class="text-4xl flex gap-3">${item.keep.map(c => `<span class="${c.suit==='h'||c.suit==='d'?'red':''}">${c.display}</span>`).join('')}</div>
        <div class="text-xs text-gray-400 mt-1">Discard: ${item.discard.map(c => c.display).join(' ')}</div>
      </div>
      <div class="text-right">
        <div class="text-5xl font-bold text-green-400">${item.ev}</div>
        <div class="text-xs">EV</div>
      </div>
    `;
    div.onclick = () => selectKeep(item.keep, item.discard);
    container.appendChild(div);
  });
}

function selectKeep(keep, discard) {
  currentKeep = keep;
  document.getElementById('play-section').classList.remove('hidden');
  const handDiv = document.getElementById('selected-hand');
  handDiv.innerHTML = `<div class="text-lg">Your kept hand:</div>` + keep.map(c => `<div class="card text-6xl ${c.suit==='h'||c.suit==='d'?'red':''}">${c.display}</div>`).join('');
  // ready for cut
}

// ==================== PLAY MODE ====================
function revealCut() {
  const used = new Set(dealtCards.map(c => c.rank + c.suit));
  const possible = fullDeck.filter(c => !used.has(c.rank + c.suit));
  currentCut = possible[Math.floor(Math.random() * possible.length)];
  finishScoring();
}

function manualCut() {
  // For simplicity, prompt for rank+suit (e.g. "5h")
  const input = prompt('Enter cut card (e.g. 5h, Jh, As):');
  if (!input) return;
  const rank = input[0].toUpperCase() === 'T' ? 'T' : input[0].toUpperCase();
  const suit = input.slice(-1).toLowerCase();
  currentCut = fullDeck.find(c => c.rank === rank && c.suit === suit);
  if (!currentCut) { alert('Invalid card!'); return; }
  finishScoring();
}

function finishScoring() {
  const { total, breakdown } = scoreHand(currentKeep, currentCut);
  const display = document.getElementById('score-display');
  display.innerHTML = `
    <div class="flex justify-between items-center text-6xl mb-4">
      <div>Cut: <span class="${currentCut.suit==='h'||currentCut.suit==='d'?'red':''}">${currentCut.display}</span></div>
      <div class="text-green-400 font-bold">${total} points!</div>
    </div>
    <div class="text-lg">${breakdown}</div>
  `;
  myScore += total;
  document.getElementById('my-score').textContent = myScore;
}

function resetScores() {
  myScore = 0; momScore = 0;
  document.getElementById('my-score').textContent = '0';
  document.getElementById('mom-score').textContent = '0';
}
