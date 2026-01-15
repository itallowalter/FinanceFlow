import React, { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import Card from '../../components/ui/Card';
import { 
  ArrowUpRight, ArrowDownRight, Wallet, ShieldCheck, AlertTriangle, 
  ChevronLeft, ChevronRight, TrendingUp, Landmark, PiggyBank,
  Utensils, Car, Banknote, Gamepad2, HeartPulse, ShoppingBag, Home, GraduationCap, Zap, CircleDollarSign, Target
} from 'lucide-react';
import { format, addMonths, isSameMonth } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, ReferenceLine 
} from 'recharts';
import ProgressBar from '../../components/ui/ProgressBar';

const Dashboard: React.FC = () => {
  const { 
    getSpendingBalance, 
    getReserveBalance, 
    getMonthlyCashflow, 
    getDailyCashflow,
    getExpensesByCategory,
    debts,
    accounts,
    transactions,
    goals
  } = useFinance();

  const [currentDate, setCurrentDate] = useState(new Date());

  const spendingBalance = getSpendingBalance();
  const reserveBalance = getReserveBalance();
  
  // Filtered Data
  const { income, expense } = getMonthlyCashflow(currentDate);
  
  // Transform daily data for the positive/negative bar chart
  const rawDailyData = getDailyCashflow(currentDate);
  const dailyData = rawDailyData.map(item => ({
    ...item,
    income: item.income,
    expense: item.expense * -1 // Make expense negative for the chart
  }));

  const categoryData = getExpensesByCategory(currentDate);

  // Debts Logic - Filter by Selected Month
  const monthlyDebts = debts.filter(d => isSameMonth(new Date(d.dueDate), currentDate));
  
  // Calculate total for the month (regardless of status, to show the burden of that month)
  // OR strictly pending/overdue? "Dívidas do Mês" usually implies what I have to pay.
  // Let's show pending/overdue for the selected month + any overdue from previous months if looking at current?
  // To keep it simple and consistent with "Month Selector": show debts due in that month.
  const unpaidMonthlyDebts = monthlyDebts.filter(d => d.status !== 'paid');
  const nextDebt = unpaidMonthlyDebts.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
  const totalDebtsMonth = monthlyDebts.reduce((acc, curr) => acc + curr.totalAmount, 0);

  // Recent Transactions (Filtered by Month)
  const recentTransactions = transactions
    .filter(t => isSameMonth(new Date(t.date), currentDate))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  // Featured Goal (Highest Priority/Closest)
  const featuredGoal = goals.length > 0 ? goals[0] : null;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const handlePrevMonth = () => setCurrentDate(prev => addMonths(prev, -1));
  const handleNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));

  // Icons Helpers
  const getAccountIcon = (type: string) => {
    switch (type) {
        case 'bank': return <Landmark size={20} />;
        case 'investment': return <PiggyBank size={20} />;
        default: return <Wallet size={20} />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Alimentação': return <Utensils size={16} />;
      case 'Transporte': return <Car size={16} />;
      case 'Salário': return <Banknote size={16} />;
      case 'Lazer': return <Gamepad2 size={16} />;
      case 'Saúde': return <HeartPulse size={16} />;
      case 'Compras': return <ShoppingBag size={16} />;
      case 'Moradia': return <Home size={16} />;
      case 'Educação': return <GraduationCap size={16} />;
      case 'Contas': return <Zap size={16} />;
      default: return <CircleDollarSign size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header aligned like the image */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         {/* Month Selector Left */}
         <div className="flex items-center bg-surface border border-gray-700 rounded-lg p-1 w-fit">
          <button onClick={handlePrevMonth} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors">
            <ChevronLeft size={20} />
          </button>
          <span className="px-4 font-semibold text-white min-w-[140px] text-center capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <button onClick={handleNextMonth} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="text-right">
          <h2 className="text-3xl font-bold text-white mb-1">Visão Geral</h2>
        </div>
      </header>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Giro (Green) */}
        <div className="bg-surface rounded-xl border border-emerald-500/30 p-6 relative overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <div className="absolute top-0 right-0 p-6 opacity-20">
             <div className="p-3 bg-emerald-500 rounded-xl text-emerald-100">
               <Wallet size={32} />
             </div>
          </div>
          <p className="text-gray-400 font-medium mb-1">Giro Disponível</p>
          <h3 className="text-3xl font-bold text-white mb-2">{formatCurrency(spendingBalance)}</h3>
          <div className="flex items-center text-sm text-emerald-500 font-medium">
             <TrendingUp size={16} className="mr-1" />
             <span>Saldo positivo</span>
          </div>
        </div>

        {/* Card 2: Patrimonio (Blue/Purple) */}
        <div className="bg-surface rounded-xl border border-indigo-500/30 p-6 relative overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.1)]">
          <div className="absolute top-0 right-0 p-6 opacity-20">
             <div className="p-3 bg-indigo-500 rounded-xl text-indigo-100">
               <ShieldCheck size={32} />
             </div>
          </div>
          <p className="text-gray-400 font-medium mb-1">Patrimônio (Reservas)</p>
          <h3 className="text-3xl font-bold text-white mb-4">{formatCurrency(reserveBalance)}</h3>
          {/* Decorative bar */}
          <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
             <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 w-3/4"></div>
          </div>
        </div>

        {/* Card 3: Dividas (Red) */}
        <div className="bg-surface rounded-xl border border-rose-500/30 p-6 relative overflow-hidden shadow-[0_0_15px_rgba(244,63,94,0.1)]">
          <div className="absolute top-0 right-0 p-6">
             <div className="p-2 bg-rose-500/20 rounded-lg text-rose-500">
               <AlertTriangle size={24} />
             </div>
          </div>
          <p className="text-gray-400 font-medium mb-1">Dívidas do Mês</p>
          <h3 className="text-3xl font-bold text-white mb-2">{formatCurrency(totalDebtsMonth)}</h3>
          <p className="text-sm text-gray-500">
             Vencendo: <span className="text-gray-300">{nextDebt ? nextDebt.name : 'Nada pendente'}</span>
          </p>
        </div>
      </div>

      {/* Middle Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart - Fluxo */}
        <Card title="Fluxo de Caixa Mensal" className="lg:col-span-2 min-h-[350px]">
          <div className="flex items-center gap-4 text-xs mb-4">
             <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500"></div> <span className="text-gray-400">Receitas</span></div>
             <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-rose-500"></div> <span className="text-gray-400">Despesas</span></div>
          </div>
          <div className="h-[280px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={dailyData} stackOffset="sign">
                 <ReferenceLine y={0} stroke="#334155" />
                 <XAxis 
                    dataKey="day" 
                    stroke="#64748b" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    interval={2}
                  />
                 <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => [formatCurrency(Math.abs(value)), '']}
                  />
                 <Bar dataKey="income" fill="#10b981" radius={[4, 4, 4, 4]} barSize={8} />
                 <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 4, 4]} barSize={8} />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </Card>

        {/* Donut Chart - Categories */}
        <Card title="Gastos por Categoria" className="min-h-[350px]">
          {categoryData.length > 0 ? (
            <div className="h-[280px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                     itemStyle={{ color: '#fff' }}
                     formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none pr-16">
                 <span className="text-xs text-gray-500">Total</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[280px] text-gray-500">
               <p>Sem dados</p>
            </div>
          )}
        </Card>
      </div>

      {/* Bottom Section: Accounts, Recent Tx, Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         
         {/* Widget: Minhas Contas */}
         <Card title="Minhas Contas" className="h-full">
            <div className="space-y-4 mt-2">
               {accounts.slice(0, 4).map(acc => (
                 <div key={acc.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                       <div className={`p-2 rounded-lg transition-colors ${acc.role === 'reserve' ? 'bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white' : 'bg-primary/20 text-primary group-hover:bg-primary group-hover:text-white'}`}>
                          {getAccountIcon(acc.type)}
                       </div>
                       <div>
                          <p className="text-sm font-semibold text-white">{acc.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{acc.type === 'wallet' ? 'Carteira' : acc.type}</p>
                       </div>
                    </div>
                    <span className="font-bold text-white tracking-tight">{formatCurrency(acc.balance)}</span>
                 </div>
               ))}
               {accounts.length === 0 && <p className="text-sm text-gray-500">Nenhuma conta cadastrada.</p>}
            </div>
         </Card>

         {/* Widget: Transações Recentes */}
         <Card title="Transações Recentes" className="h-full">
            <div className="space-y-4 mt-2">
               {recentTransactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-800 rounded-full text-gray-400">
                           {getCategoryIcon(tx.category)}
                        </div>
                        <div>
                           <p className="text-sm font-medium text-white truncate max-w-[100px]">{tx.description}</p>
                           <p className="text-[10px] text-gray-500">{format(new Date(tx.date), 'dd/MM/yyyy')}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className={`text-sm font-bold ${tx.type === 'expense' ? 'text-rose-500' : 'text-emerald-500'}`}>
                           {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount)}
                        </p>
                     </div>
                  </div>
               ))}
               {recentTransactions.length === 0 && <p className="text-sm text-gray-500">Sem movimentações neste mês.</p>}
            </div>
         </Card>

         {/* Widget: Meta em Destaque */}
         <Card title="Meta em Destaque" className="h-full relative overflow-hidden group">
            {featuredGoal ? (
               <div className="mt-2 h-full flex flex-col justify-between">
                  <div className="flex items-start gap-4">
                     <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl text-white shadow-lg">
                        <Target size={24} />
                     </div>
                     <div>
                        <h4 className="text-lg font-bold text-white">{featuredGoal.name}</h4>
                        <p className="text-xs text-gray-400">Categoria do momento</p>
                     </div>
                  </div>

                  <div className="mt-6 mb-2">
                     <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progresso</span>
                        <span>{Math.floor((featuredGoal.currentAmount / featuredGoal.targetAmount) * 100)}%</span>
                     </div>
                     {/* Custom gradient progress bar */}
                     <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                           className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" 
                           style={{ width: `${Math.min((featuredGoal.currentAmount / featuredGoal.targetAmount) * 100, 100)}%` }}
                        ></div>
                     </div>
                     <div className="flex justify-between mt-2">
                        <span className="text-sm text-white font-bold">{formatCurrency(featuredGoal.currentAmount)}</span>
                        <span className="text-sm text-gray-500">{formatCurrency(featuredGoal.targetAmount)}</span>
                     </div>
                  </div>
                  {/* Decorative glow */}
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full group-hover:bg-purple-500/30 transition-all"></div>
               </div>
            ) : (
               <div className="flex flex-col items-center justify-center h-full text-gray-500 pb-6">
                  <Target size={32} className="mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma meta ativa.</p>
               </div>
            )}
         </Card>

      </div>
    </div>
  );
};

export default Dashboard;