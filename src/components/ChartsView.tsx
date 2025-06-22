import React, { useState, useMemo } from 'react';
import { useFinancial } from '@/contexts/FinancialContext';
import { TimePeriod, ChartType, ChartData } from '@/types/financial';
import { getCategoryInfo } from '@/utils/categories';
import { isTransactionInPeriod, formatCurrency } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  LineChart, 
  Line, 
  ResponsiveContainer,
  ComposedChart,
  Area,
  Legend,
  Tooltip
} from 'recharts';
import { 
  PieChart as PieIcon, 
  BarChart3, 
  TrendingUp, 
  Donut,
  Layers,
  DollarSign,
  Calendar,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';

const ChartsView = () => {
  const { activeWallet, getWalletTransactions } = useFinancial();
  const [selectedChart, setSelectedChart] = useState<ChartType>('pie');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const transactions = activeWallet ? getWalletTransactions(activeWallet.id) : [];

  // Obter todas as datas únicas das transações
  const availableDates = useMemo(() => {
    const dates = transactions.map(t => new Date(t.date).toISOString().split('T')[0]);
    return [...new Set(dates)].sort();
  }, [transactions]);

  // Filtrar transações pelo intervalo de datas selecionado
  const filteredTransactions = useMemo(() => {
    if (!dateRange.from && !dateRange.to) {
      return transactions; // Se nenhuma data selecionada, mostra todas
    }

    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const fromDate = dateRange.from ? new Date(dateRange.from) : new Date(0);
      const toDate = dateRange.to ? new Date(dateRange.to) : new Date();

      // Ajustar para incluir o dia inteiro
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(23, 59, 59, 999);
      transactionDate.setHours(12, 0, 0, 0);

      return transactionDate >= fromDate && transactionDate <= toDate;
    });
  }, [transactions, dateRange]);

  // Função para limpar filtros
  const clearDateFilter = () => {
    setDateRange({ from: undefined, to: undefined });
  };

  // Função para selecionar período rápido
  const selectQuickPeriod = (days: number) => {
    const today = new Date();
    const fromDate = new Date();
    fromDate.setDate(today.getDate() - days);
    setDateRange({ from: fromDate, to: today });
  };

  // Dados para gráfico de pizza - Despesas por categoria
  const pieChartData = useMemo(() => {
    const categoryTotals = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, transaction) => {
        const category = transaction.category;
        acc[category] = (acc[category] || 0) + transaction.amount;
        return acc;
      }, {} as Record<string, number>);

    const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

    return Object.entries(categoryTotals).map(([category, amount]) => {
      const categoryInfo = getCategoryInfo(category as any);
      return {
        name: categoryInfo.label,
        value: amount,
        percentage: total > 0 ? ((amount / total) * 100).toFixed(1) : '0',
        color: categoryInfo.color,
      };
    }).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Dados para gráfico de barras - Receitas vs Despesas por categoria
  const barChartData = useMemo(() => {
    const categoryData = filteredTransactions.reduce((acc, transaction) => {
      const category = transaction.category;
      if (!acc[category]) {
        acc[category] = { receitas: 0, despesas: 0 };
      }
      if (transaction.type === 'income') {
        acc[category].receitas += transaction.amount;
      } else {
        acc[category].despesas += transaction.amount;
      }
      return acc;
    }, {} as Record<string, { receitas: number; despesas: number }>);

    return Object.entries(categoryData).map(([category, data]) => {
      const categoryInfo = getCategoryInfo(category as any);
      return {
        categoria: categoryInfo.label,
        receitas: data.receitas,
        despesas: data.despesas,
        saldo: data.receitas - data.despesas,
        color: categoryInfo.color,
      };
    }).filter(item => item.receitas > 0 || item.despesas > 0);
  }, [filteredTransactions]);

  // Dados para gráfico de linha - Evolução temporal
  const lineChartData = useMemo(() => {
    const dailyTotals = filteredTransactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date).toLocaleDateString('pt-BR');
      if (!acc[date]) {
        acc[date] = { receitas: 0, despesas: 0 };
      }
      acc[date][transaction.type === 'income' ? 'receitas' : 'despesas'] += transaction.amount;
      return acc;
    }, {} as Record<string, { receitas: number; despesas: number }>);

    return Object.entries(dailyTotals)
      .map(([date, totals]) => ({
        data: date,
        receitas: totals.receitas,
        despesas: totals.despesas,
        saldo: totals.receitas - totals.despesas,
      }))
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  }, [filteredTransactions]);

  // Dados para gráfico doughnut - Receitas vs Despesas geral
  const doughnutData = useMemo(() => {
    const totals = filteredTransactions.reduce((acc, transaction) => {
      if (transaction.type === 'income') {
        acc.receitas += transaction.amount;
      } else {
        acc.despesas += transaction.amount;
      }
      return acc;
    }, { receitas: 0, despesas: 0 });

    const total = totals.receitas + totals.despesas;
    
    return [
      {
        name: 'Receitas',
        value: totals.receitas,
        percentage: total > 0 ? ((totals.receitas / total) * 100).toFixed(1) : '0',
        color: '#10b981',
      },
      {
        name: 'Despesas',
        value: totals.despesas,
        percentage: total > 0 ? ((totals.despesas / total) * 100).toFixed(1) : '0',
        color: '#ef4444',
      },
    ];
  }, [filteredTransactions]);

  // Dados para gráfico de barras empilhadas - Despesas por categoria ao longo do tempo
  const stackedBarData = useMemo(() => {
    const weeklyData = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, transaction) => {
        const date = new Date(transaction.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toLocaleDateString('pt-BR');
        
        if (!acc[weekKey]) {
          acc[weekKey] = {};
        }
        
        const category = transaction.category;
        acc[weekKey][category] = (acc[weekKey][category] || 0) + transaction.amount;
        return acc;
      }, {} as Record<string, Record<string, number>>);

    return Object.entries(weeklyData).map(([week, categories]) => {
      const data: any = { semana: week };
      Object.entries(categories).forEach(([category, amount]) => {
        const categoryInfo = getCategoryInfo(category as any);
        data[categoryInfo.label] = amount;
      });
      return data;
    }).sort((a, b) => new Date(a.semana).getTime() - new Date(b.semana).getTime());
  }, [filteredTransactions]);

  const chartTypes = [
    { key: 'pie', label: 'Pizza', icon: PieIcon, description: 'Despesas por Categoria' },
    { key: 'bar', label: 'Barras', icon: BarChart3, description: 'Receitas vs Despesas' },
    { key: 'line', label: 'Linha', icon: TrendingUp, description: 'Evolução Temporal' },
    { key: 'doughnut', label: 'Rosca', icon: Donut, description: 'Receitas vs Despesas' },
    { key: 'stacked', label: 'Empilhado', icon: Layers, description: 'Despesas por Semana' },
  ];

  if (!activeWallet) return null;

  const renderChart = () => {
    switch (selectedChart) {
      case 'pie':
        return (
          <div className="space-y-4">
            <ChartContainer config={{}} className="aspect-square max-h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
                            <p className="font-semibold text-gray-900 dark:text-white">{data.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {formatCurrency(data.value)} ({data.percentage}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            
            {/* Legenda */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {pieChartData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-xs text-gray-500">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'bar':
        return (
          <ChartContainer config={{}} className="aspect-[4/3] max-h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-600" />
                <XAxis dataKey="categoria" className="dark:fill-gray-300" />
                <YAxis className="dark:fill-gray-300" />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
                          <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
                          {payload.map((entry, index) => (
                            <p key={index} className="text-sm" style={{ color: entry.color }}>
                              {entry.name}: {formatCurrency(entry.value as number)}
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
                <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        );

      case 'line':
        return (
          <ChartContainer config={{}} className="aspect-[4/3] max-h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-600" />
                <XAxis dataKey="data" className="dark:fill-gray-300" />
                <YAxis className="dark:fill-gray-300" />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
                          <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
                          {payload.map((entry, index) => (
                            <p key={index} className="text-sm" style={{ color: entry.color }}>
                              {entry.name}: {formatCurrency(entry.value as number)}
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="receitas" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name="Receitas"
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="despesas" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  name="Despesas"
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="saldo" 
                  fill="#3b82f6" 
                  fillOpacity={0.3}
                  stroke="#3b82f6"
                  name="Saldo"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        );

      case 'doughnut':
        return (
          <div className="space-y-4">
            <ChartContainer config={{}} className="aspect-square max-h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={doughnutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {doughnutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
                            <p className="font-semibold text-gray-900 dark:text-white">{data.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {formatCurrency(data.value)} ({data.percentage}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            
            {/* Resumo financeiro */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800 dark:text-green-200">Receitas</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(doughnutData[0]?.value || 0)}
                </p>
                <p className="text-sm text-green-600">
                  {doughnutData[0]?.percentage || 0}% do total
                </p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-800 dark:text-red-200">Despesas</span>
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(doughnutData[1]?.value || 0)}
                </p>
                <p className="text-sm text-red-600">
                  {doughnutData[1]?.percentage || 0}% do total
                </p>
              </div>
            </div>
          </div>
        );

      case 'stacked':
        return (
          <ChartContainer config={{}} className="aspect-[4/3] max-h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stackedBarData}>
                <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-600" />
                <XAxis dataKey="semana" className="dark:fill-gray-300" />
                <YAxis className="dark:fill-gray-300" />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
                          <p className="font-semibold text-gray-900 dark:text-white">Semana: {label}</p>
                          {payload.map((entry, index) => (
                            <p key={index} className="text-sm" style={{ color: entry.color }}>
                              {entry.name}: {formatCurrency(entry.value as number)}
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                {pieChartData.map((category, index) => (
                  <Bar 
                    key={index}
                    dataKey={category.name} 
                    stackId="a" 
                    fill={category.color}
                    name={category.name}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        {/* Filtro de Datas */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center space-x-2">
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                        {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                      </>
                    ) : (
                      format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                    )
                  ) : (
                    <span>Selecionar período</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange({
                      from: range?.from || undefined,
                      to: range?.to || undefined
                    });
                    if (range?.from && range?.to) {
                      setIsDatePickerOpen(false);
                    }
                  }}
                  numberOfMonths={2}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
            
            {(dateRange.from || dateRange.to) && (
              <Button variant="ghost" size="sm" onClick={clearDateFilter}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Períodos rápidos */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectQuickPeriod(7)}
              className="text-xs"
            >
              7 dias
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectQuickPeriod(30)}
              className="text-xs"
            >
              30 dias
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectQuickPeriod(90)}
              className="text-xs"
            >
              90 dias
            </Button>
          </div>
        </div>

        {/* Tipos de Gráfico */}
        <div className="flex flex-wrap items-center gap-2">
          {chartTypes.map((chart) => {
            const IconComponent = chart.icon;
            return (
              <Button
                key={chart.key}
                variant={selectedChart === chart.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedChart(chart.key as ChartType)}
                className={selectedChart === chart.key ? 'bg-brand-rose-earthy hover:bg-brand-rose-light' : ''}
                title={chart.description}
              >
                <IconComponent className="w-4 h-4 mr-2" />
                {chart.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Informações do Filtro */}
      {(dateRange.from || dateRange.to) && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Período selecionado:</strong>{" "}
            {dateRange.from && dateRange.to
              ? `${format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} até ${format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}`
              : dateRange.from
              ? `A partir de ${format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })}`
              : `Até ${format(dateRange.to!, "dd/MM/yyyy", { locale: ptBR })}`}
            {" "}({filteredTransactions.length} transações)
          </p>
        </div>
      )}

      {/* Chart */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-brand-primary dark:text-brand-yellow-pastel">
            {chartTypes.find(chart => chart.key === selectedChart)?.description || 'Análise Financeira'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length > 0 ? (
            renderChart()
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <BarChart3 className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
                Nenhum dado encontrado
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {dateRange.from || dateRange.to 
                  ? "Não há transações no período selecionado"
                  : "Adicione algumas transações para visualizar os gráficos"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartsView;
