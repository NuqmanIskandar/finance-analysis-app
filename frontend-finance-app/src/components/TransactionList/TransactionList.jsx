import styles from "./TransactionList.module.css";
import { useCategories } from "../../context/CategoriesContext";
import { formatSigned, formatDate } from "../../utils/format";
import { Trash2, LoaderCircle } from "lucide-react";
import { useState } from "react";

// Shared list of transaction rows.
// - onDelete omitted -> read-only (Dashboard recent list)
// - onDelete provided -> shows delete icon per row (Transactions page)
const TransactionList = ({ transactions, loading, onDelete, emptyMessage = "No transactions yet — add your first one above." }) => {
    const { categories } = useCategories();
    const [deletingId, setDeletingId] = useState(null);

    const categoryName = (id) => {
        if (!id) return "Uncategorized";
        const match = categories.find((c) => c.category_id === id);
        return match ? match.name : "Uncategorized";
    };

    async function handleDelete(id) {
        setDeletingId(id);
        try {
            await onDelete(id);
        } finally {
            setDeletingId(null);
        }
    }

    if (loading) {
        return (
            <ul className={styles.list}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <li className={styles.row} key={i}>
                        <div className={`${styles.skeleton} shimmer`} style={{ width: "40%" }} />
                        <div className={`${styles.skeleton} shimmer`} style={{ width: "15%" }} />
                    </li>
                ))}
            </ul>
        );
    }

    if (transactions.length === 0) {
        return <p className={styles.empty}>{emptyMessage}</p>;
    }

    return (
        <ul className={styles.list}>
            {transactions.map((t) => (
                <li className={styles.row} key={t.transaction_id}>
                    <div className={styles.main}>
                        <span className={styles.name}>{t.name}</span>
                        <span className={styles.meta}>
                            {categoryName(t.category_id)} · {formatDate(t.transaction_date)}
                        </span>
                    </div>
                    <span className={t.type === "income" ? styles.income : styles.expense}>
                        {formatSigned(t.amount, t.type)}
                    </span>
                    {onDelete && (
                        deletingId === t.transaction_id ? (
                            <LoaderCircle className={`${styles.loader} spin`} size={16} />
                        ) : (
                            <button
                                className={styles.delete}
                                onClick={() => handleDelete(t.transaction_id)}
                                aria-label={`Delete ${t.name}`}
                            >
                                <Trash2 size={16} />
                            </button>
                        )
                    )}
                </li>
            ))}
        </ul>
    );
};

export default TransactionList;
