import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface CostBreakdownProps {
  totalCost: number;
}

const CostBreakdown = ({ totalCost }: CostBreakdownProps) => {
  const data = [
    { name: "Accommodation", value: Math.round(totalCost * 0.40), color: "hsl(var(--primary))" },
    { name: "Food & Dining", value: Math.round(totalCost * 0.30), color: "hsl(var(--secondary))" },
    { name: "Transport", value: Math.round(totalCost * 0.20), color: "hsl(var(--accent))" },
    { name: "Activities", value: Math.round(totalCost * 0.10), color: "hsl(var(--muted))" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
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
        <div className="mt-4 space-y-2">
          {data.map((item) => (
            <div key={item.name} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.name}</span>
              <span className="font-semibold">₹{item.value.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CostBreakdown;
