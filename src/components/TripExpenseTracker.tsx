import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
}

interface TripExpenseTrackerProps {
  totalBudget: number;
  duration: number;
}

const TripExpenseTracker = ({ totalBudget, duration }: TripExpenseTrackerProps) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [category, setCategory] = useState<string>("accommodation");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remaining = totalBudget - totalSpent;
  const percentageSpent = (totalSpent / totalBudget) * 100;
  const dailyBudget = totalBudget / duration;
  const dailyAverage = totalSpent / Math.max(1, new Set(expenses.map(e => e.date)).size);

  const addExpense = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      category,
      amount: parseFloat(amount),
      description: description || category,
      date: new Date().toISOString().split('T')[0],
    };

    setExpenses([...expenses, newExpense]);
    setAmount("");
    setDescription("");
    toast.success("Expense added successfully");
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
    toast.success("Expense removed");
  };

  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trip Expense Tracker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Budget Overview */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Budget</p>
              <p className="text-2xl font-bold">₹{totalBudget.toLocaleString('en-IN')}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className={`text-2xl font-bold ${remaining < 0 ? 'text-destructive' : 'text-primary'}`}>
                ₹{remaining.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Budget Used</span>
              <span className="font-medium">{percentageSpent.toFixed(1)}%</span>
            </div>
            <Progress value={percentageSpent} className="h-3" />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-secondary/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Daily Budget</p>
              <p className="text-lg font-semibold">₹{dailyBudget.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-secondary/50 p-3 rounded-lg">
              <div className="flex items-center gap-1 mb-1">
                <p className="text-xs text-muted-foreground">Daily Avg</p>
                {dailyAverage > dailyBudget ? (
                  <TrendingUp className="w-3 h-3 text-destructive" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-primary" />
                )}
              </div>
              <p className={`text-lg font-semibold ${dailyAverage > dailyBudget ? 'text-destructive' : ''}`}>
                ₹{dailyAverage.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        {/* Add Expense Form */}
        <div className="space-y-3 border-t pt-4">
          <h4 className="font-semibold text-sm">Add New Expense</h4>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="accommodation">Accommodation</SelectItem>
                <SelectItem value="food">Food & Dining</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="activities">Activities</SelectItem>
                <SelectItem value="shopping">Shopping</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="What was this expense for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Button onClick={addExpense} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>

        {/* Category Breakdown */}
        {Object.keys(categoryTotals).length > 0 && (
          <div className="space-y-2 border-t pt-4">
            <h4 className="font-semibold text-sm">Spending by Category</h4>
            {Object.entries(categoryTotals).map(([cat, total]) => (
              <div key={cat} className="flex justify-between text-sm">
                <span className="capitalize text-muted-foreground">{cat}</span>
                <span className="font-semibold">₹{total.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        )}

        {/* Expense List */}
        {expenses.length > 0 && (
          <div className="space-y-2 border-t pt-4">
            <h4 className="font-semibold text-sm">Recent Expenses</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {expenses.slice().reverse().map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{expense.description}</p>
                    <p className="text-xs text-muted-foreground capitalize">{expense.category} • {expense.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">₹{expense.amount.toLocaleString('en-IN')}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteExpense(expense.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TripExpenseTracker;
