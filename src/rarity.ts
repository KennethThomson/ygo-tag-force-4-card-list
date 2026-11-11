/** Pull-rate order, best first — used for sorting, since alphabetical is coincidental. */
export const RARITY_RANK: Record<string, number> = {
  'Ultra Rare': 4,
  'Super Rare': 3,
  'Rare': 2,
  'Common': 1,
};

export const RARITY_CLASS: Record<string, string> = {
  'Common': 'rarity-common',
  'Rare': 'rarity-rare',
  'Super Rare': 'rarity-super',
  'Ultra Rare': 'rarity-ultra',
};
