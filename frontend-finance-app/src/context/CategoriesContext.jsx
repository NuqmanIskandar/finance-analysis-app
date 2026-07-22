import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../api/client.js";

const CategoriesContext = createContext(null);

export function CategoriesProvider({ children }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false)
    const [deletingId, setDeletingId] = useState(null)

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.get("/categories");
            setCategories(data);
        } catch {
            // a 401 here triggers the auth:expired flow in api/client.js
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const addCategory = async (name) => {
        setAdding(true);
        try {
            const created = await api.create_category(name);
            setCategories((prev) => [...prev, created]);
        } finally {
            setAdding(false);
        }
    };

    const removeCategory = async (id) => {
        setDeletingId(id);
        try {
            await api.delete_category(id);

            setCategories((prev) =>
                prev.filter((c) => c.category_id !== id)
            );
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <CategoriesContext.Provider
            value={{
                categories,
                loading,
                adding,
                deletingId,
                addCategory,
                removeCategory
            }}
        >
            {children}
        </CategoriesContext.Provider>
    );
}

export function useCategories() {
    const ctx = useContext(CategoriesContext);
    if (!ctx) throw new Error("useCategories must be used within CategoriesProvider");
    return ctx;
}