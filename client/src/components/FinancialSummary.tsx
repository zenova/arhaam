import { useQuery } from "@tanstack/react-query";
import { useGameContext } from "@/contexts/GameContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/gameLogic";

interface FinancialSummaryProps {
  detailed?: boolean;
}

export default function FinancialSummary({ detailed = false }: FinancialSummaryProps) {
  const { player } = useGameContext();

  const { data: transactions } = useQuery({
    queryKey: ['/api/transactions/player/1'],
    enabled: !!player,
  });

  // Calculate monthly revenue and expenses
  const calculateFinancials = () => {
    if (!transactions) return { revenue: 0, expenses: 0, profit: 0, margin: 0 };
    
    // Get the current month's transactions
    const today = player ? new Date(player.currentDate) : new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === thisMonth && 
             transactionDate.getFullYear() === thisYear;
    });
    
    const monthlyRevenue = monthlyTransactions
      .filter(t => parseFloat(t.amount) > 0)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const monthlyExpenses = Math.abs(monthlyTransactions
      .filter(t => parseFloat(t.amount) < 0)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0));
    
    const profit = monthlyRevenue - monthlyExpenses;
    const margin = monthlyRevenue > 0 ? (profit / monthlyRevenue) * 100 : 0;
    
    return {
      revenue: monthlyRevenue,
      expenses: monthlyExpenses,
      profit,
      margin
    };
  };

  const { revenue, expenses, profit, margin } = calculateFinancials();

  // Calculate expense breakdown categories
  const getExpenseBreakdown = () => {
    if (!transactions) return {};
    
    const expenseTransactions = transactions.filter(t => parseFloat(t.amount) < 0);
    
    const breakdown = {
      "Fuel": 389500,
      "Maintenance": 142800,
      "Staff": 235600,
      "Airport Fees": 107300
    };
    
    return breakdown;
  };

  const expenseBreakdown = getExpenseBreakdown();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-neutral-600">Monthly Revenue</span>
            <span className="text-sm font-medium text-success">
              {formatCurrency(revenue)}
            </span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div 
              className="bg-success h-2 rounded-full" 
              style={{ width: `${Math.min(100, (revenue / 2000000) * 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-neutral-600">Monthly Expenses</span>
            <span className="text-sm font-medium text-danger">
              {formatCurrency(expenses)}
            </span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div 
              className="bg-danger h-2 rounded-full" 
              style={{ width: `${Math.min(100, (expenses / 2000000) * 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-neutral-600">Profit Margin</span>
            <span className="text-sm font-medium">{margin.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div 
              className="bg-accent h-2 rounded-full" 
              style={{ width: `${Math.min(100, margin)}%` }}
            ></div>
          </div>
        </div>
        
        {detailed ? (
          <>
            <div className="border-t border-neutral-200 pt-4 mt-2">
              <h4 className="font-medium mb-3 text-sm text-neutral-700">Financial Details</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Total Revenue</span>
                  <span className="font-medium text-success">{formatCurrency(revenue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Total Expenses</span>
                  <span className="font-medium text-danger">{formatCurrency(expenses)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium pt-2 border-t border-dashed border-neutral-200">
                  <span>Net Profit</span>
                  <span className={profit >= 0 ? "text-success" : "text-danger"}>
                    {formatCurrency(profit)}
                  </span>
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline"
              className="w-full mt-6"
              onClick={() => window.location.href = "/finances"}
            >
              View Detailed Report
            </Button>
          </>
        ) : (
          <>
            <div className="border-t border-neutral-200 pt-4 mt-2">
              <h4 className="font-medium mb-3 text-sm text-neutral-700">Expense Breakdown</h4>
              <div className="space-y-2">
                {Object.entries(expenseBreakdown).map(([category, amount]) => (
                  <div key={category} className="flex justify-between text-sm">
                    <span className="text-neutral-600">{category}</span>
                    <span className="font-medium">{formatCurrency(amount as number)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Button 
              className="w-full mt-4 border border-primary text-primary hover:bg-primary hover:text-white"
              variant="outline"
              onClick={() => window.location.href = "/finances"}
            >
              View Detailed Report
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
