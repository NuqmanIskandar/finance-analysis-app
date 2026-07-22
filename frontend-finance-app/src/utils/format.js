// Amounts are stored as integer cents in the database.

const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

export function formatMoney(cents) {
    return currency.format(cents / 100);
}

// Signed variant for transaction rows: "+$2,500.00" / "−$85.00"
export function formatSigned(cents, type) {
    const value = currency.format(cents / 100);
    return type === "income" ? `+${value}` : `\u2212${value}`;
}

// "2026-07-01T10:15:00" -> "Jul 1, 2026"
export function formatDate(isoString) {
    return new Date(isoString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

// Convert a dollars string from an <input> into integer cents.
export function toCents(dollarsString) {
    const parsed = parseFloat(dollarsString);
    if (Number.isNaN(parsed)) return null;
    return Math.round(parsed * 100);
}

// "YYYY-MM-DD" for date inputs / query params, in local time.
export function toDateInput(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export function firstOfMonth() {
    const now = new Date();
    return toDateInput(new Date(now.getFullYear(), now.getMonth(), 1));
}
