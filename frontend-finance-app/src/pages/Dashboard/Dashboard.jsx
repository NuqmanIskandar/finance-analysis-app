import styles from "./Dashboard.module.css";
import Navbar from "../../components/Navbar/Navbar";
import TransactionForm from "../../components/TransactionForm/TransactionForm";
import TransactionList from "../../components/TransactionList/TransactionList";
import { useTransaction } from "../../hooks/useTransactions";
import { api } from "../../api/client";
import { formatMoney, firstOfMonth } from "../../utils/format";
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

const NO_FILTERS = { start: null, end: null, category_id: null, type: null };

const Dashboard = () => {
    const { transactions, loading, addTransaction } = useTransaction(NO_FILTERS);

    const [summary, setSummary] = useState(null);
    const [monthSummary, setMonthSummary] = useState(null);

    const fetchSummaries = useCallback(async () => {
        const [allTime, thisMonth] = await Promise.all([
            api.analytics_summary(),
            api.analytics_summary({ start: firstOfMonth() }),
        ]);
        setSummary(allTime);
        setMonthSummary(thisMonth);
    }, []);

    useEffect(() => {
        fetchSummaries();
    }, [fetchSummaries]);

    // Adding a transaction changes the totals too, so refresh both
    async function handleAdd(transaction) {
        await addTransaction(transaction);
        fetchSummaries();
    }

    const cards = [
        { label: "Balance", value: summary ? formatMoney(summary.net) : null },
        { label: "Income this month", value: monthSummary ? formatMoney(monthSummary.income) : null },
        { label: "Spent this month", value: monthSummary ? formatMoney(monthSummary.expense) : null },
    ];

    return (
        <div>
            <Navbar />
            <main className="page">
                <div className={styles.cards}>
                    {cards.map(({ label, value }) => (
                        <div className={styles.card} key={label}>
                            <span className={styles.cardLabel}>{label}</span>
                            {value === null ? (
                                <div className={`${styles.cardSkeleton} shimmer`} />
                            ) : (
                                <span className={styles.cardValue}>{value}</span>
                            )}
                        </div>
                    ))}
                </div>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Quick add</h2>
                    <TransactionForm onAdd={handleAdd} />
                </section>

                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Recent</h2>
                        <Link className={styles.viewAll} to="/transactions">View all</Link>
                    </div>
                    <TransactionList
                        transactions={transactions.slice(0, 5)}
                        loading={loading}
                    />
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
