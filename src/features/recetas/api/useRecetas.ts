import { queryKeys } from "@/shared/api/queryClient";
import { useQuery } from "@tanstack/react-query";
import { getRecetas } from "./recetasApi";

export function useReceta(){
    return useQuery({
        queryKey: queryKeys.recetas.list(),
        queryFn: getRecetas,
        select: (data) => data.recetas,
    });
}