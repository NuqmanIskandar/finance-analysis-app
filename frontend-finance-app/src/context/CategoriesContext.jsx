import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../api/client.js";

const CategoriesContext = createContext(null);

export function CategoriesProvider({ children }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        const data = await api.get("/categories");
        setCategories(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const addCategory = async (name) => {
        const created = await api.create_category(name);
        setCategories((prev) => [...prev, created]);
    };

    const removeCategory = async (id) => {
        await api.delete_category(id);
        setCategories((prev) => prev.filter((c) => c.id !== id));
    };

    return (
        <CategoriesContext.Provider value={{ categories, loading, addCategory, removeCategory }}>
            {children}
        </CategoriesContext.Provider>
    );
}

export function useCategories() {
    const ctx = useContext(CategoriesContext);
    if (!ctx) throw new Error("useCategories must be used within CategoriesProvider");
    return ctx;
}