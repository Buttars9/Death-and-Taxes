/**
 * Tax Filing API — scoped to autofill and income persistence
 * Used by IncomeStep.jsx and other lifecycle-bound components
 */

export async function fetchAutofillData(userId) {
  try {
    const res = await fetch(`/api/autofill?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error(`Autofill fetch failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('🧠 Autofill error:', err);
    return { incomeSources: [] };
  }
}

export async function saveIncomeData(data) {
  try {
    const res = await fetch('/api/saveIncome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Income save failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('💾 Income save error:', err);
    return { status: 'error' };
  }
}
