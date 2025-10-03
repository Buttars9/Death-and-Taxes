/**
 * Tax Filing API — scoped to autofill and income persistence
 * Used by IncomeStep.jsx and other lifecycle-bound components
 */
export async function fetchAutofillData(userId) {
  try {
    const res = await fetch(`/api/autofill?userId=${encodeURIComponent(userId)}`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`Autofill fetch failed: ${res.status} ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error('🧠 Autofill error:', err);
    return { incomeSources: [] };
  }
}

export async function saveIncomeData(data) {
  try {
    const res = await fetch('/api/filings/' + encodeURIComponent(data.userId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: data }),
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`Income save failed: ${res.status} ${res.statusText}`);
    return await res.json();
  } catch (err) {
    // FIX: Detailed error logging
    console.error('💾 Income save error:', { message: err.message, stack: err.stack, data });
    throw err;
  }
}