export interface CategoriaOpcion {
    id: number;
    nombre: string;
  }
  
  interface CategoriaFilterProps {
    categorias: CategoriaOpcion[];
    categoriaSeleccionada: number | null;
    onChange: (idCategoria: number | null) => void;
    disabled?: boolean;
    /** Texto del encabezado. Por defecto "Categoría". */
    label?: string;
  }
  
  /**
   * Filtro por categoría con dos presentaciones:
   * - Móvil: <select> nativo (el scroll horizontal de chips no se siente
   *   bien en pantallas angostas — no es obvio que hay más opciones fuera
   *   de vista y compite con el scroll vertical de la página).
   * - Desktop: chips con scroll horizontal.
   *
   * Si `categorias` viene vacío, no renderiza nada.
   */
  export function CategoriaFilter({
    categorias,
    categoriaSeleccionada,
    onChange,
    disabled,
    label = 'Categoría',
  }: CategoriaFilterProps) {
    if (categorias.length === 0) return null;
  
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
  
          {categoriaSeleccionada !== null && (
            <button
              type="button"
              onClick={() => onChange(null)}
              disabled={disabled}
              className="hidden text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 md:inline"
            >
              Ver todas
            </button>
          )}
        </div>
  
        {/* Móvil: select nativo */}
        <select
          value={categoriaSeleccionada ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          disabled={disabled}
          aria-label={`Filtrar por ${label.toLowerCase()}`}
          className="
            h-12
            w-full
            rounded-2xl
            border
            border-line
            bg-surface
            px-4
            text-sm
            font-medium
            text-ink
            outline-none
            transition
            focus:border-brand-500
            focus:ring-2
            focus:ring-brand-500/20
            disabled:cursor-not-allowed
            disabled:opacity-50
            md:hidden
          "
        >
          <option value="">Todas las categorías</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nombre}
            </option>
          ))}
        </select>
  
        {/* Desktop: chips */}
        <div className="hidden gap-2 overflow-x-auto pb-1 md:flex">
          <button
            type="button"
            onClick={() => onChange(null)}
            disabled={disabled}
            className={`
              shrink-0
              rounded-full
              px-4
              py-2.5
              text-sm
              font-semibold
              transition-all
              ${
                categoriaSeleccionada === null
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-surface-2 text-muted hover:bg-surface hover:text-ink'
              }
            `}
          >
            Todas
          </button>
  
          {categorias.map((categoria) => (
            <button
              key={categoria.id}
              type="button"
              onClick={() => onChange(categoria.id)}
              disabled={disabled}
              className={`
                shrink-0
                rounded-full
                px-4
                py-2.5
                text-sm
                font-semibold
                transition-all
                ${
                  categoriaSeleccionada === categoria.id
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'bg-surface-2 text-muted hover:bg-surface hover:text-ink'
                }
              `}
            >
              {categoria.nombre}
            </button>
          ))}
        </div>
      </div>
    );
  }