import { useSearchParams } from "react-router-dom";
import { useMemo } from "react";

export function useTransactionFilters() {
    const [searchParams, setSearchParams] = useSearchParams();

    const filters = useMemo(() => ({
        start: searchParams.get("start") || null,
        end: searchParams.get("end") || null,
        category_id: searchParams.get("category_id") || null,
        type: searchParams.get("type") || null,
    }), [searchParams]);

    const setFilters = (updates) => {
        const next = new URLSearchParams(searchParams);
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === "") {
                next.delete(key);
            } else {
                next.set(key, value);
            }
        });
        setSearchParams(next);
    };

    return [filters, setFilters];
}