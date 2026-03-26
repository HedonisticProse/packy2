/**
 * Parse and evaluate a quantity expression.
 * - Empty / falsy → 1
 * - Plain number → Math.ceil(n), or 1 if invalid/non-positive
 * - (expr) → replace 'd' with trip duration, eval, Math.ceil, or 1 on error
 *
 * Examples (duration = 7):
 *   "3"        → 3
 *   "(2d+2)"   → 16
 *   "(d/3+2)"  → 5   (Math.ceil(7/3 + 2))
 *   "(2d+d/3)" → 17  (Math.ceil(14 + 7/3))
 */
export function parseQuantity(str_quantity, duration) {
	const s = (str_quantity ?? '').trim();
	if (!s) return 1;

	if (s.startsWith('(') && s.endsWith(')')) {
		const expr = s.slice(1, -1).replace(/d/g, String(duration ?? 0));
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
