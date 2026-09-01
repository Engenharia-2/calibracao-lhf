import { Document, Page, Text, View, StyleSheet, Image, Font, Link } from '@react-pdf/renderer';
import { LHF_LOGO_BASE64 } from '../../../utils/logoBase64';
import { ROBOTO_REGULAR_BASE64, ROBOTO_BOLD_BASE64 } from '../../../utils/robotoBase64';

Font.register({
  family: 'Roboto',
  fonts: [
    { src: ROBOTO_REGULAR_BASE64 },
    { src: ROBOTO_BOLD_BASE64, fontWeight: 'bold' }
  ]
});

interface PDFPoint {
  group: string | null;
  targetValue: number;
  unit: string;
  averageStandard: number;
  averageEquipment: number;
  deviation: number;
  uncertaintyExpanded?: number;
  tolerance: number;
  status: string;
  resolution?: string | number;
  cycles?: Record<string, any>;
  kFactor?: number | string;
}

interface PDFSection {
  sectionName: string;
  standard?: {
    id: number | string;
    code: string;
    name: string;
    certificate_number: string;
  } | null;
  points: PDFPoint[];
}

interface PDFRecord {
  id: number;
  equipment_id: number;
  template_id: string;
  template_name: string;
  operator: string;
  temperature: number;
  humidity: number;
  mains_voltage: number | null;
  readings: PDFSection[];
  overall_status: string;
  started_at: string | null;
  created_at: string;
  client_company?: string | null;
  observations?: string | null;
  template_procedure?: string | null;
  location?: string | null;
  client_cnpj?: string | null;
  client_email?: string | null;
  client_adress?: string | null;
  client_city?: string | null;
  standard_code?: string | null;
  standard_name?: string | null;
  standard_certificate?: string | null;
  standard_certificate_url?: string | null;
  operator_signature_url?: string | null;
  applyStandardCorrection?: number | boolean | null;
  apply_standard_correction?: number | boolean | null;
}

interface CalibrationPDFDocumentProps {
  record: PDFRecord;
  equipmentName: string;
  equipmentNs: string;
  equipmentOp: string;
  equipmentType: string;
  equipmentRange: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Roboto',
    fontSize: 9,
    color: '#333333',
  },
  headerContainer: {
    borderBottomWidth: 2,
    borderBottomColor: '#0F398C',
    paddingBottom: 10,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  logoSection: {
    flexDirection: 'column',
  },
  logoImage: {
    width: 100,
    height: 44,
    marginBottom: 4,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F398C',
  },
  logoSubtext: {
    fontSize: 8,
    color: '#666666',
    marginTop: 2,
  },
  headerInfo: {
    textAlign: 'right',
    fontSize: 8,
    color: '#555555',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F398C',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 9,
    color: '#666666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0F398C',
    backgroundColor: '#F0F4FA',
    padding: '4 8',
    marginBottom: 8,
    marginTop: 12,
    textTransform: 'uppercase',
  },
  gridTwoCols: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 10,
  },
  col: {
    flex: 1,
  },
  rowItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  rowLabel: {
    width: 100,
    fontWeight: 'bold',
    color: '#555555',
  },
  rowVal: {
    flex: 1,
    color: '#333333',
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E1E4E8',
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F6F8FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E4E8',
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E4E8',
  },
  th: {
    padding: '6 8',
    fontWeight: 'bold',
    fontSize: 8,
  },
  td: {
    padding: '6 8',
    fontSize: 8,
  },
  colTarget: { flex: 1.5 },
  colStandard: { flex: 2, textAlign: 'right' },
  colEquipment: { flex: 2, textAlign: 'right' },
  colDeviation: { flex: 1.5, textAlign: 'right' },
  colUncertainty: { flex: 2, textAlign: 'right' },
  colStatus: { flex: 1.5, textAlign: 'center' },
  boldText: {
    fontWeight: 'bold',
  },
  statusApproved: {
    color: '#137333',
    fontWeight: 'bold',
  },
  statusRejected: {
    color: '#C5221F',
    fontWeight: 'bold',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8,
    color: '#777777',
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
    paddingTop: 5,
    marginHorizontal: 40,
  },
  footerNotes: {
    fontSize: 7,
    color: '#777777',
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
    paddingTop: 8,
  },
  signatureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  signatureBox: {
    alignItems: 'center',
    width: 200,
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#999999',
    width: '100%',
    marginBottom: 4,
    marginTop: 10,
  },
  signatureText: {
    fontSize: 8,
    color: '#666666',
  }
});


function getDecimalPlaces(resolution?: number | string | null): number | undefined {
  if (resolution === undefined || resolution === null || resolution === '') return undefined;
  const resStr = String(resolution).replace(',', '.');
  if (!resStr.includes('.')) return 0;
  return resStr.split('.')[1].length;
}

function formatWithResolution(value: any, decs: number | undefined): string {
  if (value === undefined || value === null || value === '' || value === '-') return '-';
  const num = Number(String(value).replace(',', '.'));
  if (isNaN(num)) return String(value);
  return decs !== undefined ? num.toFixed(decs) : String(num);
}

export function CalibrationPDFDocument({ record, equipmentName, equipmentNs, equipmentOp, equipmentType, equipmentRange }: CalibrationPDFDocumentProps) {
  const rangeStr = equipmentRange || 'N/A';
  const formattedDate = new Date(record.created_at).toLocaleDateString('pt-BR');
  const issuedDate = new Date().toLocaleDateString('pt-BR');
  const dateObj = new Date(record.created_at);
  const [day, month, year] = dateObj.toLocaleDateString('pt-BR').split('/');
  const yearYY = year.slice(-2);
  const certNumber = `${yearYY}${month}${day}${equipmentOp}`;

  const uniqueStandardsMap = new Map();
  if (record.readings && record.readings.length > 0) {
    record.readings.forEach(sec => {
      if (sec.standard) {
        uniqueStandardsMap.set(sec.standard.code, sec.standard);
      }
    });
  }
  const standardsList = Array.from(uniqueStandardsMap.values());

  // Padrão LHF default se não houver cliente preenchido
  const clientCompany = record.client_company || 'LHF Sistemas de Teste e Medição Ltda';
  const clientCnpj = record.client_cnpj || '10.994.190/0001-63';
  const clientEmail = record.client_email || 'vendas@lhf.ind.br';
  const clientAddress = record.client_company 
    ? (record.client_adress || 'Sem endereço cadastrado')
    : 'R. Christina Enriconi Marcatto, 100 - Jaraguá Esquerdo';
  const clientCity = record.client_company 
    ? (record.client_city || '') 
    : 'Jaraguá do Sul - SC';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho Fixo (Repetirá em todas as páginas) */}
        <View style={styles.headerContainer} fixed>
          <View style={styles.logoSection}>
            <Image src={LHF_LOGO_BASE64} style={styles.logoImage} />
          </View>
          <View style={styles.headerInfo}>
            <Text>CNPJ: 10.994.190/0001-63 | IE: 255.905.149</Text>
            <Text>Jaraguá do Sul - SC | Telefone: (47) 3370-2441</Text>
            <Text>vendas@lhf.ind.br | www.lhf.ind.br</Text>
          </View>
        </View>

        {/* Título do Relatório */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Relatório de Calibração de Equipamento</Text>
          <Text style={styles.subtitle}>Certificado Nº {certNumber}</Text>
        </View>

        {/* Grid de Informações do Equipamento e Cliente */}
        <View style={styles.gridTwoCols}>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Equipamento Calibrado</Text>
            <View style={styles.rowItem}>
              <Text style={styles.rowLabel}>Descrição:</Text>
              <Text style={styles.rowVal}>{equipmentType}</Text>
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.rowLabel}>N° Série (NS):</Text>
              <Text style={styles.rowVal}>{equipmentNs}</Text>
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.rowLabel}>Fabricante:</Text>
              <Text style={styles.rowVal}>LHF</Text>
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.rowLabel}>Modelo:</Text>
              <Text style={styles.rowVal}>{equipmentName}</Text>
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.rowLabel}>Faixa Medição:</Text>
              <Text style={styles.rowVal}>{rangeStr}</Text>
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.rowLabel}>Data Calibração:</Text>
              <Text style={styles.rowVal}>{formattedDate}</Text>
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.rowLabel}>Data Emissão:</Text>
              <Text style={styles.rowVal}>{issuedDate}</Text>
            </View>
          </View>

          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Informações do Cliente</Text>
            <View style={styles.rowItem}>
              <Text style={styles.rowLabel}>Nome/Empresa:</Text>
              <Text style={styles.rowVal}>{clientCompany}</Text>
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.rowLabel}>CNPJ:</Text>
              <Text style={styles.rowVal}>{clientCnpj}</Text>
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.rowLabel}>Email:</Text>
              <Text style={styles.rowVal}>{clientEmail}</Text>
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.rowLabel}>Endereço:</Text>
              <Text style={styles.rowVal}>{clientAddress}</Text>
            </View>
            {clientCity ? (
              <View style={styles.rowItem}>
                <Text style={styles.rowLabel}>Cidade/UF:</Text>
                <Text style={styles.rowVal}>{clientCity}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Condições Ambientais e Padrões */}
        <View style={styles.gridTwoCols}>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Condições Ambientais</Text>
            <View style={styles.rowItem}>
              <Text style={styles.rowLabel}>Local:</Text>
              <Text style={styles.rowVal}>{record.location || 'Laboratório de Calibração LHF'}</Text>
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.rowLabel}>Temperatura:</Text>
              <Text style={styles.rowVal}>{record.temperature} °C</Text>
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.rowLabel}>Umidade:</Text>
              <Text style={styles.rowVal}>{record.humidity} %</Text>
            </View>
            {record.mains_voltage && (
              <View style={styles.rowItem}>
                <Text style={styles.rowLabel}>Rede Alimentadora:</Text>
                <Text style={styles.rowVal}>{record.mains_voltage} VCA</Text>
              </View>
            )}
          </View>

          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Padrões de Referência Utilizados</Text>
            {standardsList.length > 0 ? (
              standardsList.map((std: any, idx) => (
                <View key={idx} style={{ marginBottom: 6 }}>
                  <Text style={[{ color: '#333333' }, styles.boldText]}>[{std.code}] {std.name}</Text>
                  <Text style={{ color: '#333333' }}>Certificado: {std.certificate_number}</Text>
                </View>
              ))
            ) : record.standard_code ? (
              <>
                <View style={styles.rowItem}>
                  <Text style={styles.rowLabel}>Código:</Text>
                  <Text style={styles.rowVal}>{record.standard_code}</Text>
                </View>
                <View style={styles.rowItem}>
                  <Text style={styles.rowLabel}>Descrição:</Text>
                  <Text style={styles.rowVal}>{record.standard_name}</Text>
                </View>
                <View style={styles.rowItem}>
                  <Text style={styles.rowLabel}>Certificado RBC:</Text>
                  {record.standard_certificate_url ? (
                    <Link src={record.standard_certificate_url} style={[styles.rowVal, { color: '#076DF2', textDecoration: 'underline' }]}>
                      {record.standard_certificate}
                    </Link>
                  ) : (
                    <Text style={styles.rowVal}>{record.standard_certificate}</Text>
                  )}
                </View>
              </>
            ) : (
              <Text style={{ color: '#777777', marginTop: 4 }}>
                Nenhum padrão de referência externo registrado para esta calibração.
              </Text>
            )}
          </View>
        </View>

        {/* Procedimento da Calibração */}
        {record.template_procedure && (
          <View style={{ marginBottom: 15, padding: 8, backgroundColor: '#f1f5f9', borderRadius: 4 }}>
            <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#0F398C', marginBottom: 3 }}>Procedimento da Calibração:</Text>
            <Text style={{ fontSize: 8, color: '#333333', lineHeight: 1.4 }}>{record.template_procedure}</Text>
          </View>
        )}

        {/* Resultados da Calibração */}
        {record.readings && record.readings.map((sec, sIdx) => {
          const sectionContent = (
            <View key={sIdx} style={{ marginBottom: 15 }} wrap={false}>
              <Text style={{ fontWeight: 'bold', fontSize: 9, marginBottom: 4, color: '#333333' }}>
                Seção: {sec.sectionName}
              </Text>
              
              <View style={styles.table}>
                {/* Header da Tabela */}
                  <View style={styles.tableHeader}>
                    <Text style={[styles.th, { flex: 1.5 }]}>Ponto</Text>
                    <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>SMP</Text>
                    <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>SMC</Text>
                    <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>Desvio</Text>
                    <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>Incert.(U)</Text>
                    <Text style={[styles.th, { flex: 0.5, textAlign: 'center' }]}>k</Text>
                    {sec.points && sec.points.length > 0 && sec.points[0].cycles && Object.keys(sec.points[0].cycles).map((_, i) => (
                      <Text key={i} style={[styles.th, { flex: 1, textAlign: 'center' }]}>Leitura {i + 1}</Text>
                    ))}
                  </View>
  
                  {/* Linhas da Tabela */}
                  {sec.points && sec.points.map((pt: any, pIdx: number) => {
                    const decs = getDecimalPlaces(pt.resolution);
                    const cyclesKeys = pt.cycles ? Object.keys(pt.cycles) : [];
                    return (
                    <View key={pIdx} style={styles.tableRow}>
                      <Text style={[styles.td, { flex: 1.5 }, styles.boldText]}>
                        {pt.group ? pt.group : `Ponto ${pIdx + 1}`}
                      </Text>
                      <Text style={[styles.td, { flex: 1, textAlign: 'center' }]}>
                        {pt.averageStandard !== undefined && pt.averageStandard !== null ? `${pt.averageStandard} ${pt.unit || ''}`.trim() : '-'}
                      </Text>
                      <Text style={[styles.td, { flex: 1, textAlign: 'center' }]}>
                        {pt.averageEquipment !== undefined && pt.averageEquipment !== null && pt.averageEquipment !== '' ? `${formatWithResolution(pt.averageEquipment, decs)} ${pt.unit || ''}`.trim() : '-'}
                      </Text>
                      <Text style={[styles.td, { flex: 1, textAlign: 'center' }, styles.boldText]}>
                        {pt.deviation !== undefined && pt.deviation !== null && pt.deviation !== '' ? `${formatWithResolution(pt.deviation, decs)} ${pt.unit || ''}`.trim() : '-'}
                      </Text>
                      <Text style={[styles.td, { flex: 1, textAlign: 'center' }]}>
                        {pt.uncertaintyExpanded !== undefined && pt.uncertaintyExpanded !== null && pt.uncertaintyExpanded !== '' ? `${Number(String(pt.uncertaintyExpanded).replace(',','.')).toFixed(2)} ${pt.unit || ''}`.trim() : '-'}
                      </Text>
                      <Text style={[styles.td, { flex: 0.5, textAlign: 'center' }]}>
                        {pt.kFactor !== undefined && pt.kFactor !== null ? pt.kFactor : 2}
                      </Text>
                      {cyclesKeys.map((cKey, cIdx) => {
                        const cycle = pt.cycles[cKey];
                        return (
                          <Text key={cIdx} style={[styles.td, { flex: 1, textAlign: 'center' }]}>
                            {cycle && cycle.equipment !== undefined && cycle.equipment !== null && cycle.equipment !== '' 
                              ? formatWithResolution(cycle.equipment, decs) 
                              : '-'}
                          </Text>
                        );
                      })}
                    </View>
                  )})}
              </View>
            </View>
          );

          if (sIdx === 0) {
            return (
              <View key={sIdx} wrap={false}>
                <Text style={styles.sectionTitle}>Resultados da Calibração</Text>
                {sectionContent}
              </View>
            );
          }

          return sectionContent;
        })}

        {/* Rodapé Explicativo */}
        <Text style={styles.footerNotes}>
          * SMC - Sistema de Medição Convencional (Equipamento sob Teste) / ** SMP - Sistema de Medição Padrão (Equipamento de Referência).
          Os resultados apresentados referem-se exclusivamente ao equipamento identificado e nas condições ambientais registradas.
        </Text>

        {/* Observações da Calibração */}
        {record.observations && (
          <View style={{ marginTop: 15, padding: 8, backgroundColor: '#f9f9f9', borderLeftWidth: 3, borderLeftColor: '#0F398C' }}>
            <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#0F398C', marginBottom: 3 }}>Observações:</Text>
            <Text style={{ fontSize: 8, color: '#333333', lineHeight: 1.4 }}>{record.observations}</Text>
          </View>
        )}

        {/* Assinatura */}
        <View style={[styles.signatureContainer, { justifyContent: 'center' }]} wrap={false}>
          <View style={styles.signatureBox}>
            {record.operator_signature_url ? (
              <Image src={record.operator_signature_url} style={{ width: 120, height: 40, objectFit: 'contain' }} />
            ) : (
              <View style={{ height: 40 }} />
            )}
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>Técnico Responsável</Text>
            <Text style={[styles.signatureText, { fontWeight: 'bold' }]}>{record.operator}</Text>
          </View>
                </View>

        {/* Paginação */}
        <Text 
          style={styles.pageNumber} 
          render={({ pageNumber, totalPages }) => (`Página ${pageNumber} de ${totalPages}`)} 
          fixed 
        />
      </Page>
    </Document>
  );
}
