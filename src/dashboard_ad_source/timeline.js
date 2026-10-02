// Shared timeline. All times in seconds (0-30). Boundaries sit on the 120 BPM beat grid so cuts land on the music.
export const SB = [6.0, 9.0, 12.0, 15.0, 17.5, 20.0, 22.5, 25.0, 27.5]; // module i occupies [SB[i], SB[i+1])
export const NAV = ['Dashboard', 'Finance', 'Advertising', 'Sales & Traffic', 'Search & Brand', 'Inventory', 'Returns', 'Action Center'];

// Transition j (1..7) joins module j-1 -> module j. Window = [t0, t1], mid-point sits on the beat SB[j].
export const TR = {};
for (let j = 1; j <= 7; j++) TR[j] = [SB[j] - 0.4, SB[j] + 0.4];
TR[1] = [SB[1] - 0.45, SB[1] + 0.45]; // shared-element card morph needs a little longer to read
TR[4] = [SB[4] - 0.45, SB[4] + 0.45]; // 4-up shared-element morph

export const HOOK_OUT = [3.7, 4.4];   // hook -> logo: zoom-through into the red number
export const DASH_IN = [5.55, 6.3];    // logo -> dashboard: logo travels to header
export const DASH_REVEAL = [5.62, 6.35]; // dashboard unveiled by an opening window mask
export const CTA_IN = [27.2, 28.15];   // action button -> CTA button (shared element)

// camera push-in per module: focus point (module-local px) + total scale gain over the hold
export const CAMS = [
  { fx: 900, fy: 290, amp: 0.075 },  // dashboard: net profit number
  { fx: 900, fy: 280, amp: 0.075 },  // finance: net movement number
  { fx: 900, fy: 380, amp: 0.075 },  // advertising: ROAS gauge
  { fx: 900, fy: 400, amp: 0.07 },   // sales & traffic: funnel
  { fx: 900, fy: 420, amp: 0.07 },   // search & brand: share cards
  { fx: 900, fy: 380, amp: 0.07 },   // inventory: donut + watchlist
  { fx: 900, fy: 330, amp: 0.075 },  // returns: refund number
  { fx: 900, fy: 560, amp: 0.065 },  // action center: first action
];
export const camStart = i => i === 0 ? DASH_IN[0] + 0.3 : SB[i] - 0.3;
export const camEnd = i => i === 7 ? CTA_IN[0] + 0.2 : SB[i + 1] + 0.3;

// Early-bird offer. Left generic until the real offer is confirmed; set e.g. '₹1,999/month for the first 3 months'.
export const OFFER = '';
