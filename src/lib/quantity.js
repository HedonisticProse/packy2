/**
 * Parse and evaluate a quantity expression.
 * - Empty / falsy → 1
 * - Plain number → Math.ceil(n), or 1 if invalid/non-positive
 * - Expression containing d/D or n/N → replace with trip duration, eval, Math.ceil, or 1 on error
 *   Parentheses are optional; the presence of d/D/n/N signals a duration-based expression.
 *   d and D = trip duration (days); n and N = trip duration (treated as alias for d for now)
 *
 * Examples (duration = 7):
 *   "3"      → 3
 *   "2d+2"   → 16
 *   "d/3+2"  → 5   (Math.ceil(7/3 + 2))
 *   "d/9"    → 1   (Math.ceil(7/9))
 *   "6d+6"   → 48
 */
export function parseQuantity(str_quantity, duration) {
	const s = (str_quantity ?? '').trim();
	if (!s) return 1;

	// Duration-based if it contains d, D, n, or N
	if (/[dDnN]/.test(s)) {
		const expr = s
			.replace(/[dD]/g, String(duration ?? 0))
			.replace(/[nN]/g, String(duration ?? 0));
		try {
			// eslint-disable-next-line no-eval
			const result = eval(expr);
			if (typeof result !== 'number' || !isFinite(result)) return 1;
			return Math.ceil(result);
		} catch {
			return 1;
		}
	}

	const n = Number(s);
	return isNaN(n) || n <= 0 ? 1 : Math.ceil(n);
}
