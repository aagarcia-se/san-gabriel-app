import type { WithPayload } from '@/shared/api/apiEnvelope';

export interface Categoria {
    idCategoria: number,
    nombreCategoria: string,
    descripcionCategoria: string,
    estado: 'A' | 'N';
}

// POST /ingresarcategoria — Recibe el nombre y la descripcion de la categoria
// NO los manda. fechaCreacion se genera en el navegador (dayjs) y se
// envía sin mostrarse en el formulario.
export interface CrearCategoriaRequest {
    nombreCategoria: string;
    descripcionCategoria: string;
    fechaCreacion: string;
}
export type CrearCategoriaResponse = WithPayload<'idCategoria', number>;

// PUT /actualizarcategoria — idCategoria, nombreCategoria, descripcionCategoria.
export interface ActualizarCategoriaRequest {
    idCategoria: number;
    nombreCategoria: string;
    descripcionCategoria: string;
  }
  export type ActualizarCategoriaResponse = WithPayload<'categoriaActualizado', number>;
  

// GET /consultarcategorias responde:
// { status, message, categorias: [...] }
export type ConsultarCategoriasResponse = WithPayload<'categorias', Categoria[]>

// DELETE /desactivarCategoria/:idCategoria — borrado LÓGICO (pone
// estado='N'), no elimina el registro.
export type DesactivarCategoriaResponse = WithPayload<'categoriaDesactivada', number>;