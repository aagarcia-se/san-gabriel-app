import { StyleSheet } from '@react-pdf/renderer';
import { pdfColors } from './pdfTheme';

// Fragmentos de estilo reutilizables entre distintos documentos PDF —
// combínalos con arrays de estilo: style={[pdfStyles.th, pdfStyles.w40]}
export const pdfStyles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: pdfColors.ink,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
  },
  subtitle: {
    fontSize: 10,
    color: pdfColors.muted,
    marginTop: 2,
  },
  badge: {
    fontSize: 9,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  badgeWarning: {
    backgroundColor: pdfColors.warningBg,
    color: pdfColors.warningText,
  },
  badgeSuccess: {
    backgroundColor: pdfColors.successBg,
    color: pdfColors.successText,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: pdfColors.line,
    paddingTop: 12,
  },
  infoItem: {
    width: '25%',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 8,
    color: pdfColors.muted,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 10,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    marginTop: 12,
  },
  table: {
    borderWidth: 1,
    borderColor: pdfColors.line,
    borderRadius: 4,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: pdfColors.surface2,
    borderBottomWidth: 1,
    borderBottomColor: pdfColors.line,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: pdfColors.line,
  },
  th: {
    padding: 6,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    color: pdfColors.muted,
  },
  td: {
    padding: 6,
    fontSize: 9,
  },
  textRight: {
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 32,
    right: 32,
    fontSize: 8,
    color: pdfColors.muted,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: pdfColors.line,
    paddingTop: 8,
  },
  // Anchos reutilizables — combinar con th/td
  w15: { width: '15%' },
  w20: { width: '20%' },
  w25: { width: '25%' },
  w30: { width: '30%' },
  w35: { width: '35%' },
  w40: { width: '40%' },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fce7ea',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoText: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: pdfColors.brand,
  },
});
