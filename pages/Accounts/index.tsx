import React, { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Plus, Trash2, Wallet, Landmark, PiggyBank } from 'lucide-react';
import { Account, AccountType, AccountRole } from '../../types';

const Accounts: React.FC = () => {
  const { accounts, addAccount, deleteAccount } = useFinance();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'wallet' as AccountType,
    role: 'spending' as AccountRole,
    balance: '',
    color: '#a855f7'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAccount({
      ...formData,
      balance: parseFloat(formData.balance) || 0
    });
    setIsFormOpen(false);
    setFormData({ name: '', type: 'wallet', role: 'spending', balance: '', color: '#a855f7' });
  };

  const getIcon = (type: AccountType) => {
    switch (type) {
      case 'bank': return <Landmark size={20} />;
      case 'investment': return <PiggyBank size={20} />;
      default: return <Wallet size={20} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Minhas Contas</h2>
        <Button onClick={() => setIsFormOpen(!isFormOpen)}>
          <Plus size={18} className="mr-2" /> Nova Conta
        </Button>
      </div>

      {isFormOpen && (
        <Card title="Nova Conta" className="mb-6 animate-in slide-in-from-top-4">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Nome da Conta" 
              placeholder="Ex: Nubank, Carteira"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required
            />
            <Input 
              label="Saldo Inicial" 
              type="number" 
              step="0.01"
              value={formData.balance}
              onChange={e => setFormData({...formData, balance: e.target.value})}
              required
            />
            <Select 
              label="Tipo"
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value as AccountType})}
              options={[
                { value: 'wallet', label: 'Carteira Física' },
                { value: 'bank', label: 'Conta Bancária' },
                { value: 'investment', label: 'Investimento' }
              ]}
            />
            <Select 
              label="Função"
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value as AccountRole})}
              options={[
                { value: 'spending', label: 'Giro (Dia a dia)' },
                { value: 'reserve', label: 'Reserva / Patrimônio' }
              ]}
            />
            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
              <Button type="submit">Salvar Conta</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(acc => (
          <Card key={acc.id} className="relative group overflow-hidden">
             <div className={`absolute top-0 left-0 w-1 h-full ${acc.role === 'reserve' ? 'bg-emerald-500' : 'bg-primary'}`}></div>
             <div className="flex justify-between items-start mb-4 pl-2">
               <div className="flex items-center gap-3">
                 <div className={`p-2 rounded-lg ${acc.role === 'reserve' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-primary/20 text-primary'}`}>
                   {getIcon(acc.type)}
                 </div>
                 <div>
                   <h3 className="font-semibold text-white">{acc.name}</h3>
                   <span className="text-xs text-gray-500 uppercase">{acc.role === 'reserve' ? 'Reserva' : 'Giro'}</span>
                 </div>
               </div>
               <button 
                 onClick={() => deleteAccount(acc.id)}
                 className="text-gray-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
               >
                 <Trash2 size={18} />
               </button>
             </div>
             <div className="pl-2">
               <p className="text-sm text-gray-400 mb-1">Saldo Atual</p>
               <h4 className="text-xl font-bold text-white">
                 {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(acc.balance)}
               </h4>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Accounts;