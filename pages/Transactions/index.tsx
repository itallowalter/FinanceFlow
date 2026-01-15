import React, { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { 
  Plus, Trash2, ArrowRight, ArrowDownCircle, ArrowUpCircle,
  Utensils, Car, Banknote, Gamepad2, HeartPulse, ShoppingBag, Home, GraduationCap, Zap, CircleDollarSign
} from 'lucide-react';
import { TransactionType } from '../../types';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

const Transactions: React.FC = () => {
  const { transactions, accounts, addTransaction, deleteTransaction } = useFinance();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [txType, setTxType] = useState<TransactionType>('expense');
  
  // Helper to get local date string YYYY-MM-DD
  const getTodayLocal = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    accountId: '',
    relatedAccountId: '',
    category: '',
    date: getTodayLocal()
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountId) return alert('Selecione uma conta');
    if (txType === 'transfer' && !formData.relatedAccountId) return alert('Selecione a conta destino');

    // Append T12:00:00 to ensure date is treated as local noon, avoiding timezone shifts to previous day
    const dateWithTime = new Date(formData.date + 'T12:00:00');

    addTransaction({
      type: txType,
      accountId: formData.accountId,
      relatedAccountId: txType === 'transfer' ? formData.relatedAccountId : undefined,
      amount: parseFloat(formData.amount),
      category: txType === 'transfer' ? 'Transferência' : formData.category,
      date: dateWithTime.toISOString(),
      description: formData.description
    });
    
    setIsFormOpen(false);
    setFormData(prev => ({ ...prev, description: '', amount: '', category: '' }));
  };

  const getAccountName = (id?: string) => accounts.find(a => a.id === id)?.name || 'Conta desconhecida';

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Alimentação': return <Utensils size={20} />;
      case 'Transporte': return <Car size={20} />;
      case 'Salário': return <Banknote size={20} />;
      case 'Lazer': return <Gamepad2 size={20} />;
      case 'Saúde': return <HeartPulse size={20} />;
      case 'Compras': return <ShoppingBag size={20} />;
      case 'Moradia': return <Home size={20} />;
      case 'Educação': return <GraduationCap size={20} />;
      case 'Contas': return <Zap size={20} />;
      default: return <CircleDollarSign size={20} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Alimentação': return 'bg-orange-500';
      case 'Transporte': return 'bg-blue-500';
      case 'Salário': return 'bg-emerald-500';
      case 'Lazer': return 'bg-purple-500';
      case 'Saúde': return 'bg-rose-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Transações</h2>
        <Button onClick={() => setIsFormOpen(!isFormOpen)}>
          <Plus size={18} className="mr-2" /> Nova Transação
        </Button>
      </div>

      {isFormOpen && (
        <Card title="Nova Movimentação" className="mb-6 animate-in slide-in-from-top-4">
          <div className="flex gap-4 mb-6">
            <button 
              type="button"
              onClick={() => setTxType('expense')}
              className={`flex-1 py-2 rounded-lg border font-medium transition-all ${txType === 'expense' ? 'bg-rose-500/20 border-rose-500 text-rose-500' : 'border-gray-700 text-gray-400 hover:bg-surface'}`}
            >
              Despesa
            </button>
            <button 
              type="button"
              onClick={() => setTxType('income')}
              className={`flex-1 py-2 rounded-lg border font-medium transition-all ${txType === 'income' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'border-gray-700 text-gray-400 hover:bg-surface'}`}
            >
              Receita
            </button>
            <button 
              type="button"
              onClick={() => setTxType('transfer')}
              className={`flex-1 py-2 rounded-lg border font-medium transition-all ${txType === 'transfer' ? 'bg-blue-500/20 border-blue-500 text-blue-500' : 'border-gray-700 text-gray-400 hover:bg-surface'}`}
            >
              Transferência
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Descrição" 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              required
            />
            <Input 
              label="Valor" 
              type="number" 
              step="0.01"
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
              required
            />
            <Input 
              label="Data" 
              type="date"
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
              required
            />
            
            {txType !== 'transfer' && (
              <Input 
                label="Categoria" 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                list="categories"
                required
              />
            )}
            
            <datalist id="categories">
                <option value="Alimentação" />
                <option value="Transporte" />
                <option value="Salário" />
                <option value="Lazer" />
                <option value="Saúde" />
                <option value="Compras" />
                <option value="Moradia" />
                <option value="Educação" />
                <option value="Contas" />
            </datalist>

            <Select 
              label={txType === 'transfer' ? "Conta Origem" : "Conta"}
              value={formData.accountId}
              onChange={e => setFormData({...formData, accountId: e.target.value})}
              options={[
                { value: '', label: 'Selecione...' },
                ...accounts.map(acc => ({ value: acc.id, label: acc.name }))
              ]}
              required
            />

            {txType === 'transfer' && (
              <Select 
                label="Conta Destino"
                value={formData.relatedAccountId}
                onChange={e => setFormData({...formData, relatedAccountId: e.target.value})}
                options={[
                  { value: '', label: 'Selecione...' },
                  ...accounts.filter(acc => acc.id !== formData.accountId).map(acc => ({ value: acc.id, label: acc.name }))
                ]}
                required
              />
            )}

            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
              <Button type="submit">Confirmar</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {transactions.length === 0 && (
            <div className="text-center py-10 text-gray-500">
                Nenhuma transação registrada.
            </div>
        )}
        {transactions.map(tx => (
          <div key={tx.id} className="bg-surface rounded-xl border border-gray-700/50 p-4 flex items-center justify-between group hover:border-gray-600 transition-all">
             <div className="flex items-center gap-4">
               
               {/* Category Icon with Circle */}
               <div className={`p-3 rounded-full text-white shadow-lg ${
                  tx.type === 'transfer' ? 'bg-blue-500' : 
                  tx.type === 'income' ? 'bg-emerald-500' : 
                  getCategoryColor(tx.category)
               }`}>
                 {tx.type === 'transfer' ? <ArrowRight size={20} /> : getCategoryIcon(tx.category)}
               </div>

               <div>
                 <p className="font-semibold text-white text-lg">{tx.description}</p>
                 <div className="flex items-center text-sm text-gray-400 gap-2 mt-0.5">
                   <span>{format(new Date(tx.date), "dd/MM", { locale: ptBR })}</span>
                   <span>•</span>
                   <span className="bg-gray-800 px-2 py-0.5 rounded text-xs">{tx.category}</span>
                   <span>•</span>
                   <span>
                     {tx.type === 'transfer' 
                       ? `${getAccountName(tx.accountId)} -> ${getAccountName(tx.relatedAccountId)}` 
                       : getAccountName(tx.accountId)}
                   </span>
                 </div>
               </div>
             </div>
             
             <div className="flex items-center gap-6">
               <span className={`font-bold text-lg ${
                 tx.type === 'income' ? 'text-emerald-400' :
                 tx.type === 'expense' ? 'text-rose-400' :
                 'text-blue-400'
               }`}>
                 {tx.type === 'expense' ? '-' : '+'}
                 {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.amount)}
               </span>
               <button 
                 onClick={() => deleteTransaction(tx.id)}
                 className="p-2 text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
               >
                 <Trash2 size={18} />
               </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Transactions;