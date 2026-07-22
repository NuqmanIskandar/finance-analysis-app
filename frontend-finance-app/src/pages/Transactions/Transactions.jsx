import styles from "./Transactions.module.css";
import Navbar from "../../components/Navbar/Navbar";
import TransactionForm from "../../components/TransactionForm/TransactionForm";
import TransactionList from "../../components/TransactionList/TransactionList";
import { useTransaction } from "../../hooks/useTransactions";
import { useTransactionFilters } from "../../hooks/useTransactionFilters";
import { useCategories } from "../../context/CategoriesContext";
import { formatMoney } from "../../utils/format";

const Transactions = () => {
    const [filters, setFilters] = useTransactionFilters();
    const { transactions, loading, error, addTransaction, removeTransaction } = useTransaction(filters);
    const { categories } = useCategories();

    const hasFilters = Object.values(filters).some((v) => v !== null);

    const income = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

    return (
        <div>
            <Navbar />
            <main className="page">
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Add transaction</h2>
                    <TransactionForm onAdd={addTransaction} />
                </section>

                <section className={styles.section}>
                    <div className={styles.filterBar}>
                        <input
                            type="date"
                            value={filters.start || ""}
                            onChange={(e) => setFilters({ start: e.target.value })}
                            aria-label="From date"
                        />
                        <span className={styles.filterDash}>–</span>
                        <input
                            type="date"
                            value={filters.end || ""}
                            onChange={(e) => setFilters({ end: e.target.value })}
                            aria-label="To date"
                        />
                        <select
                            value={filters.type || ""}
                            onChange={(e) => setFilters({ type: e.target.value })}
                            aria-label="Type"
                        >
                            <option value="">All types</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                        <select
                            value={filters.category_id || ""}
                            onChange={(e) => setFilters({ category_id: e.target.value })}
                            aria-label="Category"
                        >
                            <option value="">All categories</option>
                            {categories.map((c) => (
                                <option key={c.category_id} value={c.category_id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        {hasFilters && (
                            <button
                                className={styles.clear}
                                onClick={() => setFilters({ start: null, end: null, category_id: null, type: null })}
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {!loading && transactions.length > 0 && (
                        <p className={styles.totals}>
                            {transactions.length} transaction{transactions.length === 1 ? "" : "s"}
                            {" · "}+{formatMoney(income)} in, −{formatMoney(expense)} out
                        </p>
                    )}

                    {error && <p className={styles.error}>{error}</p>}

                    <TransactionList
                        transactions={transactions}
                        loading={loading}
                        onDelete={removeTransaction}
                        emptyMessage={hasFilters
                            ? "Nothing matches these filters."
                            : "No transactions yet — add your first one above."}
                    />
                </section>
            </main>
        </div>
    );
};

export default Transactions;
