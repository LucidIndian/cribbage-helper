# Cribbage Helper! 🃏

Play at: [https://lucidindian.github.io/cribbage-helper/](https://lucidindian.github.io/cribbage-helper/)

A simple, powerful cribbage hand analyzer that helps you choose the **best 4 cards to keep** by calculating the **true expected value (EV)** for every possible keep.

Perfect for practicing or using discreetly during family games!

### Features

- **Manual card entry** – Select your exact 6 cards using easy dropdowns (no more random deals)
- Calculates **expected points** for all 15 possible 4-card combinations
- Simulates **all 46 possible cut cards** for accurate EV
- Full standard cribbage scoring:
  - 15s (2 points each)
  - Pairs, runs (of any length), flushes (4 or 5 cards)
  - Nobs
- Instantly shows the **best keep(s)** sorted by highest Expected Value
- Play mode: Reveal a random cut card or enter one manually to see exact score + breakdown
- Larger, clearer card displays (especially for discarded cards)
- Live game score tracker (you vs. Mom)
- 100% client-side – works offline after loading
- Hosted for **free on GitHub Pages**

### How to Use

1. Open the app: [https://yourusername.github.io/cribbage-helper](https://lucidindian.github.io/cribbage-helper/)
2. Use the dropdowns to enter the **6 cards** in your hand
3. Click **"Calculate Best Keeps"**
4. Review the list – the top option is mathematically the best keep
5. Click any row to enter **Play Mode**
6. Reveal a cut card or type one manually to see how many points you actually score
7. Keep track of the running score against your opponent

### Technologies

- HTML + CSS + JavaScript
- Tailwind CSS (via CDN)
- Unicode playing card symbols
- No backend, no dependencies, no build step required
- Fully static – perfect for GitHub Pages

### Future Ideas

- Remove individual cards
- Prevent duplicate card selection
- "Random Deal" button for practice
- Pegging phase helper
- Crib considerations
- Dark/light mode toggle

### Contributing

Feel free to make a pull request or fork and improve! This was built to help me consistently beat my mom at cribbage.

---

**Made with ❤️ for casual cribbage players who want to win.**
