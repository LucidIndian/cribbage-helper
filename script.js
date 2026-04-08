// ... (keep all your existing code: createDeck, scoreHand, getCombinations, computeAllEVs, selectKeep, revealCut, manualCut, finishScoring, resetScores) ...

// ==================== FIXED CARD INPUT SECTION ====================
function renderCardInputs() {
  const container = document.getElementById('card-inputs');
  if (!container) return;
  
  container.innerHTML = '';

  for (let i = 0; i < 6; i++) {
    const div = document.createElement('div');
    div.className = "flex gap-3";
    div.innerHTML = `
      <select id="rank-${i}" class="bg-gray-700 text-white rounded-2xl flex-1">
        <option value="">Rank</option>
        ${RANKS.map(r => `<option value="${r}">${r}</option>`).join('')}
      </select>
      <select id="suit-${i}" class="bg-gray-700 text-white rounded-2xl flex-1">
        <option value="">Suit</option>
        <option value="h">♥ Hearts</option>
        <option value="d">♦ Diamonds</option>
        <option value="c">♣ Clubs</option>
        <option value="s">♠ Spades</option>
      </select>
    `;
    container.appendChild(div);
  }
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

// Clear function
function clearAllCards() {
  selectedCards = [];
  renderSelectedCards();
  renderCardInputs();
}

function analyzeHand() {
  getCardsFromForm();
  if (selectedCards.length !== 6) {
    alert("Please choose a rank and suit for all 6 cards.");
    return;
  }
  createDeck();
  document.getElementById('results').classList.remove('hidden');
  computeAllEVs();
}

// ==================== INITIALIZE ====================
window.onload = function() {
  renderCardInputs();
};
