const SUITS = ['h', 'd', 'c', 's'];
const RANKS = ['A','2','3','4','5','6','7','8','9','T','J','Q','K'];
const RANK_VALUES = {A:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,T:10,J:10,Q:10,K:10};

const UNICODE_CARDS = {
  'Ah':'🂱','2h':'🂲','3h':'🂳','4h':'🂴','5h':'🂵','6h':'🂶','7h':'🂷','8h':'🂸','9h':'🂹','Th':'🂺','Jh':'🂻','Qh':'🂽','Kh':'🂾',
  'Ad':'🃁','2d':'🃂','3d':'🃃','4d':'🃄','5d':'🃅','6d':'🃆','7d':'🃇','8d':'🃈','9d':'🃉','Td':'🃊','Jd':'🃋','Qd':'🃍','Kd':'🃎',
  'Ac':'🃑','2c':'🃒','3c':'🃓','4c':'🃔','5c':'🃕','6c':'🃖','7c':'🃗','8c':'🃘','9c':'🃙','Tc':'🃚','Jc':'🃛','Qc':'🃝','Kc':'🃞',
  'As':'🂡','2s':'🂢','3s':'🂣','4s':'🂤','5s':'🂥','6s':'🂦','7s':'🂧','8s':'🂨','9s':'🂩','Ts':'🂪','Js':'🂫','Qs':'🂭','Ks':'🂮'
};

let selectedCards = [];
let fullDeck = [];
let currentKeep = null;
let currentCut = null;
let myScore = 0;
let momScore = 0;

function createDeck() {
  fullDeck = [];
  for (let suit of SUITS) {
    for (let rank of RANKS) {
      fullDeck.push({
        rank, suit, value: RANK_VALUES[rank], display: UNICODE_CARDS[rank + suit]
      });
    }
  }
}

// ==================== SCORING ====================
function scoreHand(hand4, cut) {
  const all5 = [...hand4, cut];
  let score = 0;
  let breakdown = [];

  // Fifteens
  let fifteenCount = 0;
  function countFifteens(idx, sum) {
    if (idx === 5) { if (sum === 15) fifteenCount++; return; }
    countFifteens(idx + 1, sum);
    countFifteens(idx + 1, sum + all5[idx].value);
  }
  countFifteens(0, 0);
  if (fifteenCount > 0) {
    score += fifteenCount * 2;
    breakdown.push(`${fifteenCount}×15s (${fifteenCount * 2} pts)`);
  }

  // Pairs
  const rankCount = {};
  all5.forEach(c => rankCount[c.rank] = (rankCount[c.rank] || 0) + 1);
  let pairPts = 0;
  Object.values(rankCount).forEach(cnt => pairPts += cnt * (cnt - 1) / 2 * 2);
  if (pairPts > 0) {
    score += pairPts;
    breakdown.push(`Pairs (${pairPts} pts)`);
  }

  // Runs
  const rankToCount = {};
  all5.forEach(c => rankToCount[c.rank] = (rankToCount[c.rank] || 0) + 1);
  const rankOrder = ['A','2','3','4','5','6','7','8','9','T','J','Q','K'];
  const numeric = Object.keys(rankToCount).map(r => rankOrder.indexOf(r) + 1).sort((a,b)=>a-b);

  let runPts = 0;
  let i = 0;
  while (i < numeric.length) {
    let j = i;
    while (j + 1 < numeric.length && numeric[j + 1] === numeric[j] + 1) j++;
    const length = j - i + 1;
    if (length >= 3) {
      let multiplier = 1;
      for (let k = i; k <= j; k++) {
        const rankKey = rankOrder[numeric[k] - 1];
        multiplier *= rankToCount[rankKey];
      }
      runPts += length * multiplier;
    }
    i = j + 1;
  }
  if (runPts > 0) {
    score += runPts;
    breakdown.push(`Runs (${runPts} pts)`);
  }

  // Flush + Nobs
  const handSuits = hand4.map(c => c.suit);
  const allSameHand = handSuits.every(s => s === handSuits[0]);
  if (allSameHand && cut.suit === handSuits[0]) {
    score += 5;
    breakdown.push("5-card flush (5 pts)");
  } else if (allSameHand) {
    score += 4;
    breakdown.push("4-card flush (4 pts)");
  }

  if (hand4.some(c => c.rank === 'J' && c.suit === cut.suit)) {
    score += 1;
    breakdown.push("Nobs (1 pt)");
  }

  return {
    total: score,
    breakdown: breakdown.length ? breakdown.join(" • ") : "0 points"
  };
}

// ==================== CARD INPUTS ====================
function renderCardInputs() {
  const container = document.getElementById('card-inputs');
  container.innerHTML = '';

  for (let i = 0; i < 6; i++) {
    const div = document.createElement('div');
    div.className = "flex gap-3";
    div.innerHTML = `
      <select id="rank-${i}" class="flex-1">
        <option value="">Rank</option>
        ${RANKS.map(r => `<option value="${r}">${r}</option>`).join('')}
      </select>
      <select id="suit-${i}" class="flex-1">
        <option value="h">♥ Hearts</option>
        <option value="d">♦ Diamonds</option>
        <option value="c">♣ Clubs</option>
        <option value="s">♠ Spades</option>
      </select>
    `;
    container.appendChild(div);
  }

  // Preset: A♥ 2♥ 3♥ 4♥ 5♥ 6♥
  presetDefaultHand();
}

function presetDefaultHand() {
  const defaultHand = [
    {rank: 'A', suit: 'h'},
    {rank: '2', suit: 'h'},
    {rank: '3', suit: 'h'},
    {rank: '4', suit: 'h'},
    {rank: '5', suit: 'h'},
    {rank: '6', suit: 'h'}
  ];

  defaultHand.forEach((card, i) => {
    const rankSelect = document.getElementById(`rank-${i}`);
    const suitSelect = document.getElementById(`suit-${i}`);
    if (rankSelect) rankSelect.value = card.rank;
    if (suitSelect) suitSelect.value = card.suit;
  });

  // Show the preset cards visually
  getCardsFromForm();
}

function getCardsFromForm() {
  selectedCards = [];
  for (let i = 0; i < 6; i++) {
    const rankEl = document.getElementById(`rank-${i}`);
    const suitEl = document.getElementById(`suit-${i}`);
    if (rankEl && suitEl && rankEl.value && suitEl.value) {
      const rank = rankEl.value;
      const suit = suitEl.value;
      selectedCards.push({
        rank,
        suit,
        value: RANK_VALUES[rank],
        display: UNICODE_CARDS[rank + suit]
      });
    }
  }
  renderSelectedCards();
}

function renderSelectedCards() {
  const container = document.getElementById('selected-cards-display');
  container.innerHTML = selectedCards.map(card => `
    <div class="text-center">
      <div class="card ${card.suit === 'h' || card.suit === 'd' ? 'red' : ''}">${card.display}</div>
      <div class="text-xs mt-1">${card.rank}${card.suit.toUpperCase()}</div>
    </div>
  `).join('');
}

function resetCards() {
  selectedCards = [];
  
  // Reset all dropdowns to default
  presetDefaultHand(); 
  
  renderSelectedCards();
}

function analyzeHand() {
  getCardsFromForm();
  
  if (selectedCards.length !== 6) {
    alert("Please select a rank and suit for all 6 cards.");
    return;
  }

  createDeck();
  document.getElementById('results').classList.remove('hidden');
  computeAllEVs();
}

// ==================== EV + PLAY MODE (unchanged from your previous version) ====================
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

  const combos = getCombinations(selectedCards, 4);
  const evList = [];

  combos.forEach(keep => {
    const used = new Set(selectedCards.map(c => c.rank + c.suit));
    const possibleCuts = fullDeck.filter(c => !used.has(c.rank + c.suit));

    let totalScore = 0;
    possibleCuts.forEach(cut => totalScore += scoreHand(keep, cut).total);

    const ev = (totalScore / possibleCuts.length).toFixed(2);
    const discard = selectedCards.filter(c => !keep.some(k => k.rank === c.rank && k.suit === c.suit));

    evList.push({ keep, discard, ev: parseFloat(ev) });
  });

  evList.sort((a, b) => b.ev - a.ev);

  evList.forEach(item => {
    const div = document.createElement('div');
    div.className = `bg-gray-700 hover:bg-gray-600 rounded-3xl p-6 cursor-pointer transition`;
    div.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <div class="text-6xl flex gap-6 mb-3">${item.keep.map(c => 
            `<span class="big-card ${c.suit==='h'||c.suit==='d'?'red':''}">${c.display}</span>`
          ).join('')}</div>
          <div class="text-red-400 text-xl">
            Discard: <span class="text-5xl">${item.discard.map(c => 
              `<span class="${c.suit==='h'||c.suit==='d'?'red':''}">${c.display}</span>`
            ).join(' ')}</span>
          </div>
        </div>
        <div class="text-right">
          <div class="text-7xl font-bold text-emerald-400">${item.ev}</div>
          <div class="text-sm uppercase tracking-widest">Expected Value</div>
        </div>
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
  handDiv.innerHTML = `
    <div>
      <p class="text-lg mb-3">Your 4-card hand:</p>
      <div class="flex gap-8">${keep.map(c => 
        `<span class="text-8xl ${c.suit==='h'||c.suit==='d'?'red':''}">${c.display}</span>`
      ).join('')}</div>
    </div>
  `;
}

function revealCut() {
  const used = new Set(selectedCards.map(c => c.rank + c.suit));
  const possible = fullDeck.filter(c => !used.has(c.rank + c.suit));
  currentCut = possible[Math.floor(Math.random() * possible.length)];
  finishScoring();
}

function manualCut() {
  const input = prompt("Enter cut card (e.g. 5h, Jh, As):");
  if (!input) return;
  const rank = input[0].toUpperCase() === 'T' ? 'T' : input[0].toUpperCase();
  const suit = input.slice(-1).toLowerCase();
  currentCut = fullDeck.find(c => c.rank === rank && c.suit === suit);
  if (!currentCut) return alert("Invalid card! Use format like 5h or Jh");
  finishScoring();
}

function finishScoring() {
  const { total, breakdown } = scoreHand(currentKeep, currentCut);
  document.getElementById('score-display').innerHTML = `
    <div class="flex justify-between items-center text-5xl mb-4">
      <span>Cut: <span class="${currentCut.suit==='h'||currentCut.suit==='d'?'red':''}">${currentCut.display}</span></span>
      <span class="text-emerald-400 font-bold">${total} points</span>
    </div>
    <div class="text-lg">${breakdown}</div>
  `;
  myScore += total;
  document.getElementById('my-score').textContent = myScore;
}

function resetScores() {
  myScore = 0;
  momScore = 0;
  document.getElementById('my-score').textContent = '0';
  document.getElementById('mom-score').textContent = '0';
}

// Initialize
window.onload = function() {
  renderCardInputs();
};
