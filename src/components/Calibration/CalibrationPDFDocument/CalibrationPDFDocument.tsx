import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
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
}

interface PDFSection {
  sectionName: string;
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
  client_cnpj?: string | null;
  client_email?: string | null;
  standard_code?: string | null;
  standard_name?: string | null;
  standard_certificate?: string | null;
}

interface CalibrationPDFDocumentProps {
  record: PDFRecord;
  equipmentName: string;
  equipmentNs: string;
  equipmentOp: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Roboto',
    fontSize: 9,
    color: '#333333',
    lineHeight: 1.4,
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
  },
  signatureText: {
    fontSize: 8,
    color: '#666666',
  }
});

export function CalibrationPDFDocument({ record, equipmentName, equipmentNs, equipmentOp }: CalibrationPDFDocumentProps) {
  // Encontra a faixa de medição (mínimo e máximo dos alvos das leituras)
  let minVal = Infinity;
  let maxVal = -Infinity;
  let unit = 'Ω';

  if (record.readings && record.readings.length > 0) {
    record.readings.forEach(sec => {
      if (sec.points && sec.points.length > 0) {
        sec.points.forEach(pt => {
          if (pt.targetValue < minVal) minVal = pt.targetValue;
          if (pt.targetValue > maxVal) {
            maxVal = pt.targetValue;
            unit = pt.unit;
          }
        });
      }
    });
  }

  const rangeStr = minVal !== Infinity ? `${minVal} a ${maxVal} ${unit}` : 'N/A';
  const formattedDate = new Date(record.created_at).toLocaleDateString('pt-BR');

  // Padrão LHF default se não houver cliente preenchido
  const clientCompany = record.client_company || 'LHF Sistemas de Teste e Medição Ltda';
  const clientCnpj = record.client_cnpj || '10.994.190/0001-63';
  const clientEmail = record.client_email || 'vendas@lhf.ind.br';
  const clientAddress = record.client_company 
    ? 'Endereço cadastrado no sistema'
    : 'R. Christina Enriconi Marcatto, 100 - Jaraguá Esquerdo';
  const clientCity = record.client_company ? '' : 'Jaraguá do Sul - SC';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho da Empresa */}
        <View style={styles.headerContainer}>
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
          <Text style={styles.subtitle}>Certificado Nº {record.id}</Text>
        </View>

        {/* Grid de Informações do Equipamento e Cliente */}
        <View style={styles.gridTwoCols}>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Equipamento Calibrado</Text>
            <View style={styles.rowItem}>
              <Text style={styles.rowLabel}>Descrição:</Text>
              <Text style={styles.rowVal}>{equipmentName}</Text>
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
              <Text style={styles.rowLabel}>Modelo/OP:</Text>
              <Text style={styles.rowVal}>{record.template_name} (OP: {equipmentOp})</Text>
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.rowLabel}>Faixa Medição:</Text>
              <Text style={styles.rowVal}>{rangeStr}</Text>
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.rowLabel}>Data Calibração:</Text>
              <Text style={styles.rowVal}>{formattedDate}</Text>
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
              <Text style={styles.rowVal}>Laboratório de Calibração LHF</Text>
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
            <Text style={styles.sectionTitle}>Padrão de Referência Utilizado</Text>
            {record.standard_code ? (
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
                  <Text style={styles.rowVal}>{record.standard_certificate}</Text>
                </View>
              </>
            ) : (
              <Text style={{ color: '#777777', marginTop: 4 }}>
                Nenhum padrão de referência externo registrado para esta calibração.
              </Text>
            )}
          </View>
        </View>

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
                  <Text style={[styles.th, styles.colTarget]}>Valor Alvo</Text>
                  <Text style={[styles.th, styles.colStandard]}>SMP (Média Padrão)</Text>
                  <Text style={[styles.th, styles.colEquipment]}>SMC (Média Equip.)</Text>
                  <Text style={[styles.th, styles.colDeviation]}>Desvio</Text>
                  <Text style={[styles.th, styles.colUncertainty]}>Incerteza (U)</Text>
                  <Text style={[styles.th, styles.colStatus]}>Status</Text>
                </View>

                {/* Linhas da Tabela */}
                {sec.points && sec.points.map((pt, pIdx) => (
                  <View key={pIdx} style={styles.tableRow}>
                    <Text style={[styles.td, styles.colTarget, styles.boldText]}>
                      {pt.targetValue} {pt.unit}
                    </Text>
                    <Text style={[styles.td, styles.colStandard]}>
                      {pt.averageStandard} {pt.unit}
                    </Text>
                    <Text style={[styles.td, styles.colEquipment]}>
                      {pt.averageEquipment} {pt.unit}
                    </Text>
                    <Text style={[styles.td, styles.colDeviation, styles.boldText]}>
                      {pt.deviation} {pt.unit}
                    </Text>
                    <Text style={[styles.td, styles.colUncertainty]}>
                      {pt.uncertaintyExpanded !== undefined ? `${pt.uncertaintyExpanded} ${pt.unit}` : '-'}
                    </Text>
                    <Text style={[
                      styles.td, 
                      styles.colStatus, 
                      pt.status === 'Aprovado' ? styles.statusApproved : styles.statusRejected
                    ]}>
                      {pt.status}
                    </Text>
                  </View>
                ))}
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

        {/* Assinatura */}
        <View style={styles.signatureContainer} wrap={false}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>Técnico Responsável</Text>
            <Text style={[styles.signatureText, { fontWeight: 'bold' }]}>{record.operator}</Text>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>LHF Sistemas de Teste e Medição</Text>
            <Text style={styles.signatureText}>Controle de Qualidade</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
