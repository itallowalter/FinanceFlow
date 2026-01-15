import React, { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import { Plus, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

const Debts: React.FC = () => {
  const { debts, accounts, addDebt, payDebt, deleteDebt } = useFinance();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [payModal, setPayModal] = useState<string | null>(null); // debt ID
  const [selectedAccount, setSelectedAccount] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    totalAmount: '',
    dueDate: '',
    installments: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Append T12:00:00 to ensure date is treated as local noon
    const dueDateWithTime = new Date(formData.dueDate + 'T12:00:00');

    addDebt({
      name: formData.name,
      totalAmount: parseFloat(formData.totalAmount),
      dueDate: dueDateWithTime.toISOString(),
      installments: formData.installments ? parseInt(formData.installments) : 1
    });
    setIsFormOpen(false);
    setFormData({ name: '', totalAmount: '', dueDate: '', installments: '' });
  };

  const handlePay = () => {
    if (payModal && selectedAccount) {
      payDebt(payModal, selectedAccount);
      setPayModal(null);
      setSelectedAccount('');
    }
  };

  // Sort: Overdue first, then Pending by date
  const sortedDebts = [...debts].sort((a, b) => {
    if (a.status === 'overdue' && b.status !== 'overdue') return -1;
    if (b.status === 'overdue' && a.status !== 'overdue') return 1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Controle de Dívidas</h2>
        <Button onClick={() => setIsFormOpen(!isFormOpen)}>
          <Plus size={18} className="mr-2" /> Nova Dívida
        </Button>
      </div>

      {isFormOpen && (
        <Card title="Adicionar Dívida" className="mb-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Descrição" 
              placeholder="Ex: Fatura Cartão, Empréstimo"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required
            />
            <Input 
              label="Valor Total" 
              type="number" 
              step="0.01"
              value={formData.totalAmount}
              onChange={e => setFormData({...formData, totalAmount: e.target.value})}
              required
            />
            <Input 
              label="Vencimento" 
              type="date" 
              value={formData.dueDate}
              onChange={e => setFormData({...formData, dueDate: e.target.value})}
              required
            />
            <Input 
              label="Parcelas (Opcional)" 
              type="number" 
              value={formData.installments}
              onChange={e => setFormData({...formData, installments: e.target.value})}
            />
            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Pay Modal */}
      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-surface p-6 rounded-xl w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">Pagar Dívida</h3>
            <p className="text-gray-400 mb-4">Selecione a conta para debitar o valor.</p>
            <Select 
              label="Conta de Pagamento"
              value={selectedAccount}
              onChange={e => setSelectedAccount(e.target.value)}
              options={[
                { value: '', label: 'Selecione...' },
                ...accounts.filter(a => a.role === 'spending').map(a => ({ value: a.id, label: `${a.name} (${a.balance})` }))
              ]}
            />
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setPayModal(null)}>Cancelar</Button>
              <Button onClick={handlePay} disabled={!selectedAccount}>Confirmar Pagamento</Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {sortedDebts.map(debt => (
          <div 
            key={debt.id} 
            className={`p-4 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
              debt.status === 'overdue' ? 'bg-rose-500/5 border-rose-500/30' : 
              debt.status === 'paid' ? 'bg-gray-800/50 border-gray-700 opacity-60' : 
              'bg-surface border-gray-700'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-full ${
                debt.status === 'paid' ? 'bg-gray-700 text-gray-400' :
                debt.status === 'overdue' ? 'bg-rose-500/20 text-rose-500' :
                'bg-amber-500/20 text-amber-500'
              }`}>
                {debt.status === 'paid' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
              </div>
              <div>
                <h4 className={`font-bold ${debt.status === 'paid' ? 'text-gray-400' : 'text-white'}`}>
                  {debt.name}
                </h4>
                <div className="flex gap-2 mt-1">
                  <Badge variant={
                    debt.status === 'paid' ? 'neutral' : 
                    debt.status === 'overdue' ? 'danger' : 'warning'
                  }>
                    {debt.status === 'paid' ? 'PAGO' : 
                     debt.status === 'overdue' ? 'ATRASADO' : 'PENDENTE'}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Vence: {format(new Date(debt.dueDate), 'dd/MM/yyyy')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
              <span className="text-xl font-bold text-white">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(debt.totalAmount)}
              </span>
              
              <div className="flex gap-2">
                {debt.status !== 'paid' && (
                  <Button 
                    variant="primary" 
                    className="py-1 px-3 text-sm bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => setPayModal(debt.id)}
                  >
                    Pagar
                  </Button>
                )}
                <button 
                  onClick={() => deleteDebt(debt.id)}
                  className="p-2 text-gray-600 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Debts;