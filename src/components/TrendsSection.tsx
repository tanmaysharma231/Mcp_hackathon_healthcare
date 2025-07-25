import { useState } from "react";
import { Calendar, Filter, Download } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// Sample glucose data
const glucoseData = [
  { time: '6:00', glucose: 95, meal: null },
  { time: '7:00', glucose: 110, meal: 'Breakfast' },
  { time: '8:00', glucose: 145, meal: null },
  { time: '9:00', glucose: 130, meal: null },
  { time: '10:00', glucose: 115, meal: null },
  { time: '11:00', glucose: 105, meal: null },
  { time: '12:00', glucose: 98, meal: 'Lunch' },
  { time: '13:00', glucose: 165, meal: null },
  { time: '14:00', glucose: 140, meal: null },
  { time: '15:00', glucose: 120, meal: null },
  { time: '16:00', glucose: 108, meal: null },
  { time: '17:00', glucose: 102, meal: null },
  { time: '18:00', glucose: 95, meal: 'Dinner' },
  { time: '19:00', glucose: 175, meal: null },
  { time: '20:00', glucose: 155, meal: null },
  { time: '21:00', glucose: 125, meal: null },
  { time: '22:00', glucose: 110, meal: null },
];

export function TrendsSection() {
  const [dateRange, setDateRange] = useState({
    start: "2025-01-20",
    end: "2025-01-25"
  });
  const [mealFilter, setMealFilter] = useState("all");

  const getGlucoseColor = (value: number) => {
    if (value < 70) return "#f59e0b"; // Low (yellow/warning)
    if (value > 140) return "#ef4444"; // High (red)
    return "#10b981"; // Normal (green)
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`Time: ${label}`}</p>
          <p className="text-sm">
            <span className="font-medium">Glucose: </span>
            <span style={{ color: getGlucoseColor(data.glucose) }}>
              {data.glucose} mg/dL
            </span>
          </p>
          {data.meal && (
            <p className="text-sm text-muted-foreground">
              🍽️ {data.meal}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-gradient-accent text-white">
          <CardTitle className="flex items-center gap-2">
            📈 Weekly Glucose Trends
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-40"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-40"
              />
            </div>
            
            <Select value={mealFilter} onValueChange={setMealFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by meal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Meals</SelectItem>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="ml-auto">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>

          {/* Chart */}
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={glucoseData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  domain={[60, 200]}
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                  label={{ value: 'Glucose (mg/dL)', angle: -90, position: 'insideLeft' }}
                />
                
                {/* Reference lines for glucose ranges */}
                <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="5 5" />
                <ReferenceLine y={140} stroke="#ef4444" strokeDasharray="5 5" />
                
                <Tooltip content={<CustomTooltip />} />
                
                <Line
                  type="monotone"
                  dataKey="glucose"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-glucose-normal"></div>
              <span>Normal (70-140 mg/dL)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-glucose-low"></div>
              <span>Low (&lt;70 mg/dL)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-glucose-high"></div>
              <span>High (&gt;140 mg/dL)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Glucose</p>
                <p className="text-2xl font-bold text-foreground">118 mg/dL</p>
              </div>
              <div className="w-12 h-12 bg-gradient-wellness rounded-full flex items-center justify-center">
                <span className="text-white text-xl">📊</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Time in Range</p>
                <p className="text-2xl font-bold text-accent">78%</p>
              </div>
              <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center">
                <span className="text-white text-xl">🎯</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Glucose Variability</p>
                <p className="text-2xl font-bold text-warning">Medium</p>
              </div>
              <div className="w-12 h-12 bg-warning rounded-full flex items-center justify-center">
                <span className="text-white text-xl">📈</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}