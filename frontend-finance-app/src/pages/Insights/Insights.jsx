import styles from "./Insights.module.css";
import Navbar from "../../components/Navbar/Navbar";
import { api } from "../../api/client";
import { formatMoney, toDateInput } from "../../utils/format";
import { useState, useEffect } from "react";
import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// Monochrome data palette: darkest slice = biggest spend
const GRAYS = ["#161616", "#3f3f3f", "#6b6b6b", "#8f8f8f", "#b3b3b3", "#d4d4d4"];
const INCOME_COLOR = "#161616";
const EXPENSE_COLOR = "#a3a3a3";

const RANGES = [
    { key: "3m", label: "3 months", months: 3 },
    { key: "6m", label: "6 months", months: 6 },
    { key: "12m", label: "12 months", months: 12 },
    { key: "all", label: "All time", months: null },
];

function rangeStart(months) {
    if (months === null) return undefined;
    const now = new Date();
    return toDateInput(new Date(now.getFullYear(), now.getMonth() - (months - 1), 1));
}

function monthLabel(isoPeriod) {
    return new Date(isoPeriod).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

const Insights = () => {
    const [range, setRange] = useState("6m");
    const [byCategory, setByCategory] = useState(null);
    const [timeline, setTimeline] = useState(null);
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const months = RANGES.find((r) => r.key === range).months;
        const start = rangeStart(months);

        setByCategory(null);
        setTimeline(null);
        setSummary(null);
        setError(null);

        Promise.all([
            api.analytics_by_category({ type: "expense", start }),
            api.analytics_timeline({ granularity: "month", start }),
            api.analytics_summary({ start }),
        ])
            .then(([categories, months, totals]) => {
                setByCategory(categories.map((c) => ({ ...c, total: c.total / 100 })));
                setTimeline(months.map((m) => ({
                    period: monthLabel(m.period),
                    income: m.income / 100,
                    expense: m.expense / 100,
                })));
                setSummary(totals);
            })
            .catch((err) => setError(err.message || "Could not load insights"));
    }, [range]);

    const loading = !error && (byCategory === null || timeline === null || summary === null);
    const isEmpty = !loading && !error && summary.transaction_count === 0;

    const dollars = (value) =>
        value.toLocaleString("en-US", { style: "currency", currency: "USD" });

    return (
        <div>
            <Navbar />
            <main className="page">
                <div className={styles.rangeBar}>
                    {RANGES.map(({ key, label }) => (
                        <button
                            key={key}
                            className={range === key ? styles.rangeActive : styles.range}
                            onClick={() => setRange(key)}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {error && <p className={styles.error}>{error}</p>}

                {loading && (
                    <div className={styles.chartGrid}>
                        <div className={`${styles.chartSkeleton} shimmer`} />
                        <div className={`${styles.chartSkeleton} shimmer`} />
                    </div>
                )}

                {isEmpty && (
                    <p className={styles.empty}>
                        No transactions in this period yet. Add some on the Transactions page and the charts will fill in.
                    </p>
                )}

                {!loading && !error && !isEmpty && (
                    <>
                        <p className={styles.summaryLine}>
                            +{formatMoney(summary.income)} in · −{formatMoney(summary.expense)} out ·{" "}
                            <strong>{formatMoney(summary.net)} net</strong>
                        </p>

                        <div className={styles.chartGrid}>
                            <section className={styles.chartCard}>
                                <h2 className={styles.chartTitle}>Spending by category</h2>
                                {byCategory.length === 0 ? (
                                    <p className={styles.empty}>No expenses in this period.</p>
                                ) : (
                                    <ResponsiveContainer width="100%" height={280}>
                                        <PieChart>
                                            <Pie
                                                data={byCategory}
                                                dataKey="total"
                                                nameKey="name"
                                                innerRadius="55%"
                                                outerRadius="85%"
                                                paddingAngle={2}
                                                stroke="none"
                                            >
                                                {byCategory.map((entry, i) => (
                                                    <Cell key={entry.name} fill={GRAYS[i % GRAYS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => dollars(value)} />
                                            <Legend
                                                iconType="circle"
                                                iconSize={8}
                                                formatter={(value) => <span className={styles.legendText}>{value}</span>}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </section>

                            <section className={styles.chartCard}>
                                <h2 className={styles.chartTitle}>Income vs expense</h2>
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={timeline} barGap={2}>
                                        <XAxis
                                            dataKey="period"
                                            tickLine={false}
                                            axisLine={{ stroke: "#e7e7e7" }}
                                            tick={{ fontSize: 12, fill: "#9a9a9a" }}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 12, fill: "#9a9a9a" }}
                                            tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
                                            width={52}
                                        />
                                        <Tooltip
                                            formatter={(value) => dollars(value)}
                                            cursor={{ fill: "rgba(0,0,0,0.04)" }}
                                        />
                                        <Legend
                                            iconType="circle"
                                            iconSize={8}
                                            formatter={(value) => <span className={styles.legendText}>{value}</span>}
                                        />
                                        <Bar dataKey="income" name="Income" fill={INCOME_COLOR} radius={[3, 3, 0, 0]} />
                                        <Bar dataKey="expense" name="Expense" fill={EXPENSE_COLOR} radius={[3, 3, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </section>
                        </div>

                        {byCategory.length > 0 && (
                            <section className={styles.breakdown}>
                                <h2 className={styles.chartTitle}>Breakdown</h2>
                                <ul className={styles.breakdownList}>
                                    {byCategory.map((c, i) => (
                                        <li className={styles.breakdownRow} key={c.name}>
                                            <span
                                                className={styles.dot}
                                                style={{ backgroundColor: GRAYS[i % GRAYS.length] }}
                                            />
                                            <span className={styles.breakdownName}>{c.name}</span>
                                            <span className={styles.breakdownCount}>
                                                {c.transaction_count}×
                                            </span>
                                            <span className={styles.breakdownTotal}>{dollars(c.total)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default Insights;
