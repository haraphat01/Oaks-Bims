// Approximate coordinates for each Nigerian state capital.
// Used as fallback when a property has no exact lat/lng.
export const NIGERIA_STATE_COORDS: Record<string, [number, number]> = {
  "Abia":       [5.5320,  7.4860],
  "Adamawa":    [9.3265, 12.3984],
  "Akwa Ibom":  [5.0077,  7.8536],
  "Anambra":    [6.2099,  6.9689],
  "Bauchi":     [10.3158, 9.8442],
  "Bayelsa":    [4.7719,  6.0677],
  "Benue":      [7.7333,  8.5167],
  "Borno":      [11.8333, 13.1500],
  "Cross River":[4.9517,  8.3220],
  "Delta":      [5.8904,  5.6805],
  "Ebonyi":     [6.3236,  8.1137],
  "Edo":        [6.3350,  5.6268],
  "Ekiti":      [7.7190,  5.3110],
  "Enugu":      [6.4584,  7.5460],
  "FCT":        [9.0579,  7.4951],
  "Gombe":      [10.2897, 11.1673],
  "Imo":        [5.4927,  7.0259],
  "Jigawa":     [12.2280, 9.5617],
  "Kaduna":     [10.5264, 7.4383],
  "Kano":       [12.0000, 8.5167],
  "Katsina":    [12.9897, 7.6003],
  "Kebbi":      [12.4600, 4.1975],
  "Kogi":       [7.7337,  6.6906],
  "Kwara":      [8.4966,  4.5426],
  "Lagos":      [6.5244,  3.3792],
  "Nasarawa":   [8.5378,  8.3252],
  "Niger":      [9.0579,  6.5569],
  "Ogun":       [7.1604,  3.3470],
  "Ondo":       [7.2500,  5.1950],
  "Osun":       [7.5629,  4.5196],
  "Oyo":        [7.3775,  3.9470],
  "Plateau":    [9.2182,  9.5179],
  "Rivers":     [4.8396,  6.9116],
  "Sokoto":     [13.0059, 5.2476],
  "Taraba":     [7.8700,  11.3600],
  "Yobe":       [12.2938, 11.4390],
  "Zamfara":    [12.1704, 6.6640],
};

// Nigeria geographic centre — used as default fallback
export const NIGERIA_CENTER: [number, number] = [9.082, 8.6753];

/** Deterministic sub-state jitter from a property UUID so co-state listings don't all stack. */
export function stateCoordWithJitter(state: string, id: string): [number, number] {
  const base = NIGERIA_STATE_COORDS[state] ?? NIGERIA_CENTER;
  const hex = id.replace(/-/g, "");
  const a = parseInt(hex.slice(0, 8), 16) || 0;
  const b = parseInt(hex.slice(8, 16), 16) || 0;
  const lat = base[0] + ((a % 10000) / 10000 - 0.5) * 0.7;
  const lng = base[1] + ((b % 10000) / 10000 - 0.5) * 0.7;
  return [lat, lng];
}
