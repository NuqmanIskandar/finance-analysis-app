import { useState, useEffect, useCallback } from "react";
import { api } from "../api/client";

export function useTransaction(filters) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.list_transactions(filters);
            setTransactions(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [JSON.stringify(filters)]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const removeTransaction = async (id) => {
        await api.delete_transaction(id);
        setTransactions((prev) => prev.filter((t) => t.id !== id));
    };

    const addTransaction = async (transaction) => {
        const created = await api.create_transaction(transaction);
        setTransactions((prev) => [created, ...prev]);
        return created;
    };

    return { transactions, loading, error, refetch: fetchTransactions, removeTransaction, addTransaction };
}