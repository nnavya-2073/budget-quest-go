import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CostBreakdownProps {
  totalCost: number;
  duration?: number;
}

const CostBreakdown = ({ totalCost, duration = 5 }: CostBreakdownProps) => {
  const data = [
    { name: "Accommodation", value: Math.round(totalCost * 0.40), color: "hsl(var(--primary))" },
    { name: "Food & Dining", value: Math.round(totalCost * 0.30), color: "hsl(var(--secondary))" },
    { name: "Transport", value: Math.round(totalCost * 0.20), color: "hsl(var(--accent))" },
    { name: "Activities", value: Math.round(totalCost * 0.10), color: "hsl(var(--muted))" },
  ];

  const dailyCost = Math.round(totalCost / duration);
  const dailyBreakdown = [
    { category: "Accommodation", amount: Math.round(totalCost * 0.40 / duration), percentage: 40 },
    { category: "Meals (3x/day)", amount: Math.round(totalCost * 0.30 / duration), percentage: 30 },
    { category: "Local Transport", amount: Math.round(totalCost * 0.20 / duration), percentage: 20 },
    { category: "Activities & Entertainment", amount: Math.round(totalCost * 0.10 / duration), percentage: 10 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="total" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="total">Total Cost</TabsTrigger>
            <TabsTrigger value="daily">Daily Expenses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="total" className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {data.map((item) => (
                <div key={item.name} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-semibold">₹{item.value.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="daily" className="space-y-4">
            <div className="bg-primary/10 p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">Average Daily Budget</p>
              <p className="text-3xl font-bold text-primary">₹{dailyCost.toLocaleString('en-IN')}</p>
              <p className="text-xs text-muted-foreground mt-1">For {duration} day trip</p>
            </div>
            
            <div className="space-y-3">
              {dailyBreakdown.map((item) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.category}</span>
                    <span className="font-semibold">₹{item.amount.toLocaleString('en-IN')}/day</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-secondary h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full" 
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-right">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CostBreakdown;
