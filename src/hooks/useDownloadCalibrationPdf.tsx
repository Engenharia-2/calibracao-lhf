import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { CalibrationPDFDocument } from '../components/Calibration/CalibrationPDFDocument/CalibrationPDFDocument';

export function useDownloadCalibrationPdf() {
  const [isDownloading, setIsDownloading] = useState<number | null>(null);

  const downloadPdf = async (item: any) => {
    setIsDownloading(item.id);
    try {
      if (typeof window.electron?.getCalibrationHistory === 'function') {
        const history = await window.electron.getCalibrationHistory(item.equipment_id);
        const fullRecord = history.find((r: any) => r.id === item.id);
        
        if (!fullRecord) {
          alert('Não foi possível encontrar as leituras detalhadas para este registro.');
          return;
        }

        const doc = (
          <CalibrationPDFDocument
            record={fullRecord}
            equipmentName={item.equipment_name}
            equipmentNs={item.equipment_ns}
            equipmentOp={item.equipment_op}
            equipmentType={item.equipment_type || '-'}
            equipmentRange={item.equipment_range || '-'}
          />
        );

        const blob = await pdf(doc).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Formato YYMMDDOP
        let certNum = 'Certificado';
        if (fullRecord.created_at) {
          const dateObj = new Date(fullRecord.created_at);
          const y = String(dateObj.getFullYear()).slice(-2);
          const m = String(dateObj.getMonth() + 1).padStart(2, '0');
          const d = String(dateObj.getDate()).padStart(2, '0');
          const op = item.equipment_op || '0000';
          certNum = `${y}${m}${d}${op}`;
        }

        link.download = `Certificado-${certNum}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Erro ao baixar PDF:', err);
      alert('Erro ao processar o certificado PDF.');
    } finally {
      setIsDownloading(null);
    }
  };

  return {
    downloadPdf,
    isDownloading
  };
}
