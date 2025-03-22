import { useQuery } from "@tanstack/react-query";
import { useGameContext } from "@/contexts/GameContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AreaChart, BarChart } from "@/components/ui/chart";
import { Download } from "lucide-react";
import FinancialSummary from "@/components/FinancialSummary";

export default function Finances() {
  const { player } = useGameContext();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/transactions/player/1'],
    enabled: !!player,
  });

  // Categorize transactions
  const revenueTransactions = transactions?.filter(t => t.type === "revenue") || [];
  const expenseTransactions = transactions?.filter(t => t.type === "purchase" || parseFloat(t.amount) < 0) || [];
  
  // Calculate totals
  const totalRevenue = revenueTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalExpenses = Math.abs(expenseTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0));
  const profit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

  // Chart data for weekly breakdown
  const lastWeekTransactions = transactions?.filter(t => {
    const transactionDate = new Date(t.date);
    const now = player ? new Date(player.currentDate) : new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    return transactionDate >= weekAgo;
  }) || [];

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = player ? new Date(player.currentDate) : new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayStr = date.toISOString().split('T')[0];
    
    const dayTransactions = lastWeekTransactions.filter(t => t.date === dayStr);
    const dayRevenue = dayTransactions
      .filter(t => parseFloat(t.amount) > 0)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const dayExpense = Math.abs(dayTransactions
      .filter(t => parseFloat(t.amount) < 0)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0));
    
    return {
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      revenue: dayRevenue,
      expenses: dayExpense
    };
  });

  // Expense breakdown
  const expenseCategories = {
    "Aircraft Purchase": 0,
    "Fuel": 0,
    "Maintenance": 0,
    "Staff": 0,
    "Airport Fees": 0,
    "Other": 0
  };

  expenseTransactions.forEach(t => {
    if (t.description.includes("Purchased") && t.description.includes("Airbus")) {
      expenseCategories["Aircraft Purchase"] += Math.abs(parseFloat(t.amount));
    } else if (t.description.includes("Fuel")) {
      expenseCategories["Fuel"] += Math.abs(parseFloat(t.amount));
    } else if (t.description.includes("Maintenance")) {
      expenseCategories["Maintenance"] += Math.abs(parseFloat(t.amount));
    } else if (t.description.includes("Staff")) {
      expenseCategories["Staff"] += Math.abs(parseFloat(t.amount));
    } else if (t.description.includes("Fee") || t.description.includes("Airport")) {
      expenseCategories["Airport Fees"] += Math.abs(parseFloat(t.amount));
    } else {
      expenseCategories["Other"] += Math.abs(parseFloat(t.amount));
    }
  });

  const expenseChartData = Object.entries(expenseCategories)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Financial Management</h1>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Financial Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <AreaChart 
              data={chartData}
              categories={['revenue', 'expenses']}
              index="name"
              colors={['#28A745', '#DC3545']}
              valueFormatter={(value) => `$${value.toLocaleString()}`}
              className="h-80"
            />
          </CardContent>
        </Card>

        <FinancialSummary detailed />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">
                  All Transactions
                  <Badge variant="secondary" className="ml-2">{transactions?.length || 0}</Badge>
                </TabsTrigger>
                <TabsTrigger value="revenue">
                  Revenue
                  <Badge variant="secondary" className="ml-2">{revenueTransactions.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="expenses">
                  Expenses
                  <Badge variant="secondary" className="ml-2">{expenseTransactions.length}</Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                {isLoading ? (
                  <div className="text-center py-10">Loading transactions...</div>
                ) : transactions && transactions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map(transaction => (
                        <TableRow key={transaction.id}>
                          <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                            <Badge variant={transaction.type === "revenue" ? "success" : "destructive"}>
                              {transaction.type}
                            </Badge>
                          </TableCell>
                          <TableCell className={`text-right font-medium ${parseFloat(transaction.amount) >= 0 ? 'text-success' : 'text-danger'}`}>
                            {parseFloat(transaction.amount) >= 0 ? '+' : ''}
                            ${Math.abs(parseFloat(transaction.amount)).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-neutral-500">No transactions found</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="revenue" className="mt-4">
                {revenueTransactions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {revenueTransactions.map(transaction => (
                        <TableRow key={transaction.id}>
                          <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell className="text-right font-medium text-success">
                            +${parseFloat(transaction.amount).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-neutral-500">No revenue transactions</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="expenses" className="mt-4">
                {expenseTransactions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenseTransactions.map(transaction => (
                        <TableRow key={transaction.id}>
                          <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell className="text-right font-medium text-danger">
                            -${Math.abs(parseFloat(transaction.amount)).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-neutral-500">No expense transactions</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {expenseChartData.length > 0 ? (
              <>
                <BarChart 
                  data={expenseChartData}
                  index="name"
                  categories={['value']}
                  colors={['#DC3545']}
                  valueFormatter={(value) => `$${value.toLocaleString()}`}
                  className="h-60 mb-4"
                />
                <div className="space-y-2 mt-6">
                  {Object.entries(expenseCategories).map(([category, amount]) => (
                    amount > 0 && (
                      <div key={category} className="flex justify-between text-sm">
                        <span className="text-neutral-600">{category}</span>
                        <span className="font-medium">${amount.toLocaleString()}</span>
                      </div>
                    )
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-10">
                <p className="text-neutral-500">No expense data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
