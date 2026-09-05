import type { WithPayload } from '@/shared/api/apiEnvelope';

export interface Categoria {
    idCategoria: number,
    nombreCategoria: string,
    descripcionCategoria: string,
    estado: 'A' | 'N';
}

// GET /consultarcategorias responde:
// { status, message, categorias: [...] }
export type ConsultarCategoriasResponse = WithPayload<'categorias', Categoria[]>

// DELETE /desactivarCategoria/:idCategoria — borrado LÓGICO (pone
// estado='N'), no elimina el registro.
export type DesactivarCategoriaResponse = WithPayload<'categoriaDesactivada', number>;