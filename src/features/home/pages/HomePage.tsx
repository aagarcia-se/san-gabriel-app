// Dashboard — pantalla separada de "Inicio". Placeholder hasta que
// definamos qué métricas/indicadores mostrar aquí.
export function HomePage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
        <p className="text-sm text-muted">Aquí irán tus métricas e indicadores clave.</p>
      </div>

      <div className="card">
        <p className="text-sm text-muted">
          Cuando definamos qué KPIs mostrar (ventas del día, producción,
          stock crítico, etc.) los agregamos aquí.
        </p>
      </div>
    </div>
  );
}
