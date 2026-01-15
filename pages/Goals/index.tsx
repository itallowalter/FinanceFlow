import React, { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import ProgressBar from '../../components/ui/ProgressBar';
import { Plus, Trash2, Target } from 'lucide-react';
import { format, differenceInCalendarDays } from 'date-fns';

const Goals: React.FC = () => {
  const { goals, accounts, addGoal, deleteGoal } = useFinance();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    deadline: '',
    linkedReserveAccountId: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Append T12:00:00 to ensure date is treated as local noon
    const deadlineWithTime = new Date(formData.deadline + 'T12:00:00');

    addGoal({
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount),
      deadline: deadlineWithTime.toISOString(),
      linkedReserveAccountId: formData.linkedReserveAccountId || undefined
    });
    setIsFormOpen(false);
    setFormData({ name: '', targetAmount: '', deadline: '', linkedReserveAccountId: '' });
  };

  const reserveAccounts = accounts.filter(a => a.role === 'reserve');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Metas Financeiras</h2>
        <Button onClick={() => setIsFormOpen(!isFormOpen)}>
          <Plus size={18} className="mr-2" /> Nova Meta
        </Button>
      </div>

      {isFormOpen && (
        <Card title="Criar Nova Meta" className="mb-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Nome do Objetivo" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required
            />
            <Input 
              label="Valor Alvo" 
              type="number" 
              value={formData.targetAmount}
              onChange={e => setFormData({...formData, targetAmount: e.target.value})}
              required
            />
            <Input 
              label="Prazo" 
              type="date" 
              value={formData.deadline}
              onChange={e => setFormData({...formData, deadline: e.target.value})}
              required
            />
            <Select 
              label="Vincular a Conta Reserva (Opcional)"
              value={formData.linkedReserveAccountId}
              onChange={e => setFormData({...formData, linkedReserveAccountId: e.target.value})}
              options={[
                { value: '', label: 'Sem vínculo (Virtual)' },
                ...reserveAccounts.map(acc => ({ value: acc.id, label: `${acc.name} (${acc.balance})` }))
              ]}
            />
            <p className="md:col-span-2 text-xs text-gray-500">
              * Ao vincular a uma conta reserva, o saldo da meta será atualizado automaticamente quando você transferir para essa conta.
            </p>
            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
              <Button type="submit">Criar Meta</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map(goal => {
           const progress = (goal.currentAmount / goal.targetAmount) * 100;
           const daysLeft = differenceInCalendarDays(new Date(goal.deadline), new Date());
           
           return (
             <Card key={goal.id}>
               <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-3">
                   <div className="p-3 bg-primary/20 rounded-full text-primary">
                     <Target size={24} />
                   </div>
                   <div>
                     <h3 className="text-lg font-bold text-white">{goal.name}</h3>
                     <p className="text-sm text-gray-400">
                       {daysLeft < 0 ? (
                         <span className="text-rose-500 font-medium">Expirado</span>
                       ) : (
                         <span className="text-emerald-500">{daysLeft} dias restantes</span>
                       )}
                     </p>
                   </div>
                 </div>
                 <button onClick={() => deleteGoal(goal.id)} className="text-gray-600 hover:text-rose-500 transition-colors">
                   <Trash2 size={18} />
                 </button>
               </div>
               
               <div className="mb-4">
                 <div className="flex justify-between items-end mb-2">
                   <div>
                     <p className="text-gray-400 text-xs uppercase tracking-wide">Atual</p>
                     <p className="text-2xl font-bold text-white">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.currentAmount)}
                     </p>
                   </div>
                   <div className="text-right">
                      <p className="text-gray-400 text-xs uppercase tracking-wide">Alvo</p>
                      <p className="text-lg font-medium text-gray-300">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.targetAmount)}
                      </p>
                   </div>
                 </div>

                 <div className="flex items-center gap-4">
                   <ProgressBar current={goal.currentAmount} total={goal.targetAmount} />
                   <span className="text-xl font-bold text-primary min-w-[3.5rem] text-right">
                     {Math.floor(progress)}%
                   </span>
                 </div>
               </div>
               
               {goal.linkedReserveAccountId && (
                 <div className="pt-3 border-t border-gray-700/50 text-xs text-gray-500 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    Sincronizado com conta reserva
                 </div>
               )}
             </Card>
           );
        })}
      </div>
    </div>
  );
};

export default Goals;