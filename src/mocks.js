import Chance from "chance";

const chance = new Chance(42);

export const TEMP_DATA = new Array(1000).fill(null);

let min = 0;

for (let i = 0, l = TEMP_DATA.length; i < l; ++i) {
  const prev = TEMP_DATA[i - 1] || 0;
  const next = prev + chance.integer({ min: -10, max: 10 });
  TEMP_DATA[i] = next;
  if (next < min) min = next;
}

for (let i = 0, l = TEMP_DATA.length; i < l; ++i) {
  TEMP_DATA[i] = TEMP_DATA[i] - min;
}
