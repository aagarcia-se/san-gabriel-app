import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { pdfStyles } from '@/shared/pdf/pdfStyles';
import { buildOrdenProduccionViewModel } from '../lib/ordenProduccionViewModel';
import type { IngredienteConsumido, OrdenProduccionDetalle } from '../types/ordenesProduccion.types';

interface OrdenProduccionPdfDocumentProps {
  detalle: OrdenProduccionDetalle;
  ingredientes: IngredienteConsumido[];
}

// Estilos locales solo para las secciones de productos (tags de sección,
// columna de numeración y la barra de total). El resto del documento
// (encabezado, franja de marca, badge de estado, grid de info) se queda
// exactamente como está en pdfStyles — no se toca ese diseño.
// El acento de color usa el rosa/rojo de marca de la app (brand-600 #E11D48
// sobre fondo brand-50 #FFF1F2) para que el toque de color combine con el
// resto del sistema en vez de introducir un color nuevo.
const localStyles = StyleSheet.create({
  sectionTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#020617',
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginTop: 14,
    marginBottom: 6,
  },
  numCol: {
    width: '8%',
  },
  productoColBandejas: {
    width: '42%',
  },
  cantidadColBandejas: {
    width: '25%',
  },
  productoColHarina: {
    width: '62%',
  },
  cantidadColHarina: {
    width: '30%',
  },
  totalBox: {
    marginTop: 14,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
  },
  totalValue: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#E11D48',
  },
});

interface FilaHarina {
  key: string;
  nombreProducto: string;
  harina: number;
}

export function OrdenProduccionPdfDocument({
  detalle,
  ingredientes,
}: OrdenProduccionPdfDocumentProps) {
  const { encabezadoOrden } = detalle;
  const esPendiente = encabezadoOrden.estadoOrden === 'P';
  const vm = buildOrdenProduccionViewModel(detalle, ingredientes);

  // Tabla de harina unificada: la harina de TODOS los productos de bandeja
  // se colapsa en una sola fila (nombre fijo "Frances") con la suma total,
  // en vez de enumerar cada producto de bandeja por separado. Los productos
  // solicitados directamente por harina sí se enumeran uno por uno.
  const filasHarina: FilaHarina[] = [
    ...(vm.sumaBandejas > 0
      ? [{ key: 'bandejas-total', nombreProducto: 'Frances', harina: vm.sumaBandejas }]
      : []),
    ...vm.productosHarina.map((p) => ({
      key: `harina-${p.idDetalleOrdenProduccion}`,
      nombreProducto: p.nombreProducto,
      harina: p.cantidadHarina,
    })),
  ];

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
            <Text style={localStyles.sectionTag}>Bandejas</Text>
            <View style={pdfStyles.table}>
              <View style={pdfStyles.tableHeaderRow}>
                <Text style={[pdfStyles.th, localStyles.numCol]}>#</Text>
                <Text style={[pdfStyles.th, localStyles.productoColBandejas]}>Producto</Text>
                <Text
                  style={[pdfStyles.th, localStyles.cantidadColBandejas, pdfStyles.textRight]}
                >
                  Bandejas
                </Text>
                <Text
                  style={[pdfStyles.th, localStyles.cantidadColBandejas, pdfStyles.textRight]}
                >
                  Unidades / Filas
                </Text>
              </View>
              {vm.productosBandejas.map((producto, index) => (
                <View key={producto.idDetalleOrdenProduccion} style={pdfStyles.tableRow}>
                  <Text style={[pdfStyles.td, localStyles.numCol]}>{index + 1}</Text>
                  <Text style={[pdfStyles.td, localStyles.productoColBandejas]}>
                    {producto.nombreProducto}
                  </Text>
                  <Text
                    style={[pdfStyles.td, localStyles.cantidadColBandejas, pdfStyles.textRight]}
                  >
                    {producto.cantidadBandejas}
                  </Text>
                  <Text
                    style={[pdfStyles.td, localStyles.cantidadColBandejas, pdfStyles.textRight]}
                  >
                    {producto.cantidadUnidades}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {filasHarina.length > 0 && (
          <>
            <Text style={localStyles.sectionTag}>Harina</Text>
            <View style={pdfStyles.table}>
              <View style={pdfStyles.tableHeaderRow}>
                <Text style={[pdfStyles.th, localStyles.numCol]}>#</Text>
                <Text style={[pdfStyles.th, localStyles.productoColHarina]}>Producto</Text>
                <Text style={[pdfStyles.th, localStyles.cantidadColHarina, pdfStyles.textRight]}>
                  Harina
                </Text>
              </View>
              {filasHarina.map((fila, index) => (
                <View key={fila.key} style={pdfStyles.tableRow}>
                  <Text style={[pdfStyles.td, localStyles.numCol]}>{index + 1}</Text>
                  <Text style={[pdfStyles.td, localStyles.productoColHarina]}>
                    {fila.nombreProducto}
                  </Text>
                  <Text style={[pdfStyles.td, localStyles.cantidadColHarina, pdfStyles.textRight]}>
                    {fila.harina} Lb
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {vm.hayResumenHarina && (
          <View style={localStyles.totalBox}>
            <Text style={localStyles.totalLabel}>TOTAL HARINA:</Text>
            <Text style={localStyles.totalValue}>{vm.totalHarina} Lb</Text>
          </View>
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