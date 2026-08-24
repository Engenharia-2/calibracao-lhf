import { useState, useEffect } from 'react';
import { IReferenceStandard } from '../../services/standards/ApiStandardsRepository';
import { StandardModal } from '../../components/Standard/StandardModal/StandardModal';
import { StandardTable } from '../../components/Standard/StandardTable/StandardTable';
import { Button } from '../../components/ui/Button/Button';
import { PageHeader } from '../../components/ui/PageHeader/PageHeader';
import './Standards.css';

export function Standards() {
  const [standards, setStandards] = useState<IReferenceStandard[]>([]);
  const [selectedStandard, setSelectedStandard] = useState<IReferenceStandard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStandards = standards.filter(std => {
    const term = searchTerm.toLowerCase();
    return (
      (std.name?.toLowerCase() || '').includes(term) ||
      (std.code?.toLowerCase() || '').includes(term) ||
      (std.certificate_number?.toLowerCase() || '').includes(term)
    );
  });

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



  return (
    <div className="standards-page">
      <PageHeader 
        onSearch={setSearchTerm}
        searchPlaceholder="Buscar por nome, código ou certificado..."
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
        ) : filteredStandards.length === 0 ? (
          <div className="empty-state">
            <h3>Nenhum padrão encontrado</h3>
            <p>Não há padrões que correspondam à busca "{searchTerm}".</p>
          </div>
        ) : (
          <StandardTable standards={filteredStandards} onEdit={handleEdit} onDelete={handleDelete} />
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
