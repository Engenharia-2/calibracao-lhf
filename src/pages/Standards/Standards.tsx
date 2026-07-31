import { useState, useEffect } from 'react';
import { IReferenceStandard } from '../../services/standards/ApiStandardsRepository';
import { StandardModal } from '../../components/Standard/StandardModal/StandardModal';
import { Button } from '../../components/ui/Button/Button';
import { PageHeader } from '../../components/ui/PageHeader/PageHeader';
import './Standards.css';

export function Standards() {
  const [standards, setStandards] = useState<IReferenceStandard[]>([]);
  const [selectedStandard, setSelectedStandard] = useState<IReferenceStandard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStandards = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await window.electron.getStandards();
      setStandards(list);
    } catch (err) {
      console.error('Erro ao buscar padrões:', err);
      setError('Erro ao carregar os padrões de referência.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStandards();
  }, []);

  const handleCreateNew = () => {
    setSelectedStandard(null);
    setIsModalOpen(true);
  };

  const handleEdit = (std: IReferenceStandard) => {
    setSelectedStandard(std);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir este padrão de referência?')) return;
    try {
      await window.electron.deleteStandard(id);
      fetchStandards();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir padrão.');
    }
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    fetchStandards();
  };

  const isExpired = (validityDateStr: string) => {
    if (!validityDateStr) return false;
    const val = new Date(validityDateStr);
    const today = new Date();
    return val < today;
  };

  return (
    <div className="standards-page">
      <PageHeader 
        title="Padrões de Referência RBC" 
        subtitle="Cadastre e gerencie os equipamentos padrões de calibração externa com seus respectivos certificados e incertezas."
        action={
          <Button variant="primary" onClick={handleCreateNew}>
            + Novo Padrão
          </Button>
        }
      />

      <div className="page-content">
        {isLoading ? (
          <div className="loading-state">Carregando padrões de referência...</div>
        ) : error ? (
          <div className="error-banner">{error}</div>
        ) : standards.length === 0 ? (
          <div className="empty-state">
            <h3>Nenhum padrão de referência cadastrado</h3>
            <p>Utilize o botão acima para cadastrar seu primeiro equipamento padrão RBC.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código do Padrão</th>
                  <th>Descrição</th>
                  <th>Certificado RBC</th>
                  <th>Validade</th>
                  <th>Pontos Cadastrados</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {standards.map((std) => {
                  let pointsCount = 0;
                  if (typeof std.points === 'string') {
                    try { pointsCount = JSON.parse(std.points).length; } catch(e) {}
                  } else if (Array.isArray(std.points)) {
                    pointsCount = std.points.length;
                  }

                  const expired = isExpired(std.validity_date);

                  return (
                    <tr key={std.id}>
                      <td><strong>{std.code}</strong></td>
                      <td>{std.name}</td>
                      <td>{std.certificate_number}</td>
                      <td>
                        <span className={`validity-badge ${expired ? 'expired' : 'valid'}`}>
                          {new Date(std.validity_date).toLocaleDateString('pt-BR')} {expired ? '(Vencido)' : ''}
                        </span>
                      </td>
                      <td>{pointsCount} pontos</td>
                      <td>
                        <div className="action-buttons-cell">
                          <Button size="sm" variant="secondary" onClick={() => handleEdit(std)}>
                            Editar
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => handleDelete(std.id!)}>
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <StandardModal
          isOpen={isModalOpen}
          standard={selectedStandard}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
