import { Document, Page, Text, View } from '@react-pdf/renderer';
import { pdfStyles } from '@/shared/pdf/pdfStyles';
import { buildOrdenProduccionViewModel } from '../lib/ordenProduccionViewModel';
import type { IngredienteConsumido, OrdenProduccionDetalle } from '../types/ordenesProduccion.types';

interface OrdenProduccionPdfDocumentProps {
  detalle: OrdenProduccionDetalle;
  ingredientes: IngredienteConsumido[];
}

export function OrdenProduccionPdfDocument({
  detalle,
  ingredientes,
}: OrdenProduccionPdfDocumentProps) {
  const { encabezadoOrden } = detalle;
  const esPendiente = encabezadoOrden.estadoOrden === 'P';
  const vm = buildOrdenProduccionViewModel(detalle, ingredientes);

  return (
    <Document title={`Orden de producción #${encabezadoOrden.idOrdenProduccion}`}>
      <Page size="LETTER" style={pdfStyles.page}>
        <View style={pdfStyles.headerRow}>
          <View style={pdfStyles.brandRow}>
            <View style={pdfStyles.logoCircle}>
              <Text style={pdfStyles.logoText}>SG</Text>
            </View>
            <View>
              <Text style={pdfStyles.brandTitle}>Panadería San Gabriel</Text>
              <Text style={pdfStyles.subtitle}>
                Orden de producción #{encabezadoOrden.idOrdenProduccion}
              </Text>
            </View>
          </View>
          <Text
            style={[
              pdfStyles.badge,
              esPendiente ? pdfStyles.badgeWarning : pdfStyles.badgeSuccess,
            ]}
          >
            {esPendiente ? 'Pendiente' : 'Completada'}
          </Text>
        </View>

        <View style={pdfStyles.infoGrid}>
          <View style={pdfStyles.infoItem}>
            <Text style={pdfStyles.infoLabel}>Sucursal</Text>
            <Text style={pdfStyles.infoValue}>{encabezadoOrden.nombreSucursal}</Text>
          </View>
          <View style={pdfStyles.infoItem}>
            <Text style={pdfStyles.infoLabel}>Panadero</Text>
            <Text style={pdfStyles.infoValue}>{encabezadoOrden.nombrePanadero}</Text>
          </View>
          <View style={pdfStyles.infoItem}>
            <Text style={pdfStyles.infoLabel}>Turno</Text>
            <Text style={pdfStyles.infoValue}>{encabezadoOrden.ordenTurno}</Text>
          </View>
          <View style={pdfStyles.infoItem}>
            <Text style={pdfStyles.infoLabel}>Fecha a producir</Text>
            <Text style={pdfStyles.infoValue}>{encabezadoOrden.fechaAProducir}</Text>
          </View>
          <View style={pdfStyles.infoItem}>
            <Text style={pdfStyles.infoLabel}>Creada por</Text>
            <Text style={pdfStyles.infoValue}>{encabezadoOrden.nombreUsuario.trim()}</Text>
          </View>
          <View style={pdfStyles.infoItem}>
            <Text style={pdfStyles.infoLabel}>Fecha de creación</Text>
            <Text style={pdfStyles.infoValue}>{encabezadoOrden.fechaCreacion}</Text>
          </View>
          <View style={pdfStyles.infoItem}>
            <Text style={pdfStyles.infoLabel}>Fecha de cierre</Text>
            <Text style={pdfStyles.infoValue}>{encabezadoOrden.fechaCierre ?? 'Sin cerrar'}</Text>
          </View>
        </View>

        {vm.productosBandejas.length > 0 && (
          <>
            <Text style={pdfStyles.sectionTitle}>Productos por bandejas</Text>
            <View style={pdfStyles.table}>
              <View style={pdfStyles.tableHeaderRow}>
                <Text style={[pdfStyles.th, pdfStyles.w35]}>Producto</Text>
                <Text style={[pdfStyles.th, pdfStyles.w25]}>Categoría</Text>
                <Text style={[pdfStyles.th, pdfStyles.w15, pdfStyles.textRight]}>Bandejas</Text>
                <Text style={[pdfStyles.th, pdfStyles.w15, pdfStyles.textRight]}>Unidades</Text>
                <Text style={[pdfStyles.th, pdfStyles.w15, pdfStyles.textRight]}>Harina (Lb)</Text>
              </View>
              {vm.productosBandejas.map((producto) => (
                <View key={producto.idDetalleOrdenProduccion} style={pdfStyles.tableRow}>
                  <Text style={[pdfStyles.td, pdfStyles.w35]}>{producto.nombreProducto}</Text>
                  <Text style={[pdfStyles.td, pdfStyles.w25]}>{producto.nombreCategoria}</Text>
                  <Text style={[pdfStyles.td, pdfStyles.w15, pdfStyles.textRight]}>
                    {producto.cantidadBandejas}
                  </Text>
                  <Text style={[pdfStyles.td, pdfStyles.w15, pdfStyles.textRight]}>
                    {producto.cantidadUnidades}
                  </Text>
                  <Text style={[pdfStyles.td, pdfStyles.w15, pdfStyles.textRight]}>
                    {vm.harinaPorProductoBandeja.get(producto.nombreProducto) ?? '—'}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {vm.productosHarina.length > 0 && (
          <>
            <Text style={pdfStyles.sectionTitle}>Productos por harina</Text>
            <View style={pdfStyles.table}>
              <View style={pdfStyles.tableHeaderRow}>
                <Text style={[pdfStyles.th, pdfStyles.w40]}>Producto</Text>
                <Text style={[pdfStyles.th, pdfStyles.w40]}>Categoría</Text>
                <Text style={[pdfStyles.th, pdfStyles.w20, pdfStyles.textRight]}>Harina (Lb)</Text>
              </View>
              {vm.productosHarina.map((producto) => (
                <View key={producto.idDetalleOrdenProduccion} style={pdfStyles.tableRow}>
                  <Text style={[pdfStyles.td, pdfStyles.w40]}>{producto.nombreProducto}</Text>
                  <Text style={[pdfStyles.td, pdfStyles.w40]}>{producto.nombreCategoria}</Text>
                  <Text style={[pdfStyles.td, pdfStyles.w20, pdfStyles.textRight]}>
                    {producto.cantidadHarina}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {vm.hayResumenHarina && (
          <>
            <Text style={pdfStyles.sectionTitle}>Resumen de harina</Text>
            <View style={pdfStyles.table}>
              <View style={pdfStyles.tableRow}>
                <Text style={[pdfStyles.td, pdfStyles.w40]}>Productos por bandejas</Text>
                <Text style={[pdfStyles.td, pdfStyles.w40]}></Text>
                <Text style={[pdfStyles.td, pdfStyles.w20, pdfStyles.textRight]}>
                  {vm.sumaBandejas} Lb
                </Text>
              </View>
              <View style={pdfStyles.tableRow}>
                <Text style={[pdfStyles.td, pdfStyles.w40]}>Productos por harina</Text>
                <Text style={[pdfStyles.td, pdfStyles.w40]}></Text>
                <Text style={[pdfStyles.td, pdfStyles.w20, pdfStyles.textRight]}>
                  {vm.sumaHarina} Lb
                </Text>
              </View>
              <View style={pdfStyles.tableRow}>
                <Text style={[pdfStyles.td, pdfStyles.w40, { fontFamily: 'Helvetica-Bold' }]}>
                  Total general
                </Text>
                <Text style={[pdfStyles.td, pdfStyles.w40]}></Text>
                <Text
                  style={[
                    pdfStyles.td,
                    pdfStyles.w20,
                    pdfStyles.textRight,
                    { fontFamily: 'Helvetica-Bold' },
                  ]}
                >
                  {vm.totalHarina} Lb
                </Text>
              </View>
            </View>
          </>
        )}

        {vm.hayOtrosIngredientes && (
          <>
            <Text style={pdfStyles.sectionTitle}>Otros ingredientes</Text>
            <View style={pdfStyles.table}>
              <View style={pdfStyles.tableHeaderRow}>
                <Text style={[pdfStyles.th, pdfStyles.w35]}>Producto</Text>
                <Text style={[pdfStyles.th, pdfStyles.w35]}>Ingrediente</Text>
                <Text style={[pdfStyles.th, pdfStyles.w30, pdfStyles.textRight]}>
                  Cantidad usada
                </Text>
              </View>
              {vm.productosConsumo.flatMap((producto) =>
                producto.ingredientes.map((ing, index) => (
                  <View
                    key={`${producto.producto}-${ing.Ingrediente}-${index}`}
                    style={pdfStyles.tableRow}
                  >
                    <Text style={[pdfStyles.td, pdfStyles.w35]}>{producto.producto}</Text>
                    <Text style={[pdfStyles.td, pdfStyles.w35]}>{ing.Ingrediente}</Text>
                    <Text style={[pdfStyles.td, pdfStyles.w30, pdfStyles.textRight]}>
                      {ing.CantidadUsada} {ing.UnidadMedida}
                    </Text>
                  </View>
                )),
              )}
            </View>
          </>
        )}

        <Text style={pdfStyles.footer} fixed>
          Generado el {new Date().toLocaleString('es-GT')} — Panadería San Gabriel
        </Text>
      </Page>
    </Document>
  );
}