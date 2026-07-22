import styles from "./TransactionForm.module.css";
import { useState } from "react";
import { useCategories } from "../../context/CategoriesContext";
import { toCents, toDateInput } from "../../utils/format";
import { LoaderCircle } from "lucide-react";

// Shared "add transaction" form, used on Dashboard (quick add) and Transactions.
// onAdd(transaction) should call the API and throw on failure.
const TransactionForm = ({ onAdd }) => {
    const { categories, loading: categoriesLoading } = useCategories();

    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [type, setType] = useState("expense");
    const [date, setDate] = useState(toDateInput(new Date()));
    const [categoryId, setCategoryId] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);

        const cents = toCents(amount);
        if (cents === null || cents <= 0) {
            setError("Enter an amount greater than zero");
            return;
        }
        if (!categoryId) {
            setError("Pick a category — create one on the Categories page if the list is empty");
            return;
        }

        setSubmitting(true);
        try {
            await onAdd({
                name,
                amount: cents,
                type,
                transaction_date: `${date}T00:00:00`,
                category_id: categoryId,
            });
            setName("");
            setAmount("");
        } catch (err) {
            setError(err.message || "Could not add transaction");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.typeToggle}>
                <button
                    type="button"
                    className={type === "expense" ? styles.toggleActive : styles.toggle}
                    onClick={() => setType("expense")}
                >
                    Expense
                </button>
                <button
                    type="button"
                    className={type === "income" ? styles.toggleActive : styles.toggle}
                    onClick={() => setType("income")}
                >
                    Income
                </button>
            </div>

            <div className={styles.fields}>
                <input
                    className={styles.name}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    required
                />
                <input
                    className={styles.amount}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                />
                <input
                    className={styles.date}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    type="date"
                    required
                />
                <select
                    className={styles.category}
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                >
                    <option value="" disabled>
                        {categoriesLoading ? "Loading categories…" : "Category"}
                    </option>
                    {categories.map((c) => (
                        <option key={c.category_id} value={c.category_id}>
                            {c.name}
                        </option>
                    ))}
                </select>
                <button className={styles.submit} type="submit" disabled={submitting}>
                    {submitting ? <LoaderCircle className="spin" size={16} /> : "Add"}
                </button>
            </div>

            {error && <p className={styles.error}>{error}</p>}
        </form>
    );
};

export default TransactionForm;
