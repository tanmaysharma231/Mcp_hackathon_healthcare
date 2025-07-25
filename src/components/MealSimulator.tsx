import { useState } from "react";
import { Calculator, TrendingUp, Clock, Utensils } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface MealForm {
  description: string;
  carbs: string;
  gi: string;
  insulin: string;
}

export function MealSimulator() {
  const [mealForm, setMealForm] = useState<MealForm>({
    description: "",
    carbs: "",
    gi: "",
    insulin: ""
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [showPrediction, setShowPrediction] = useState(false);

  // Sample prediction data
  const predictionData = [
    { time: 0, predicted_glucose: 95, baseline: 95 },
    { time: 15, predicted_glucose: 98, baseline: 95 },
    { time: 30, predicted_glucose: 115, baseline: 95 },
    { time: 45, predicted_glucose: 135, baseline: 95 },
    { time: 60, predicted_glucose: 155, baseline: 95 },
    { time: 75, predicted_glucose: 145, baseline: 95 },
    { time: 90, predicted_glucose: 130, baseline: 95 },
    { time: 105, predicted_glucose: 120, baseline: 95 },
    { time: 120, predicted_glucose: 110, baseline: 95 },
    { time: 135, predicted_glucose: 105, baseline: 95 },
    { time: 150, predicted_glucose: 100, baseline: 95 },
    { time: 165, predicted_glucose: 98, baseline: 95 },
    { time: 180, predicted_glucose: 95, baseline: 95 },
  ];

  const handleSimulate = async () => {
    if (!mealForm.description || !mealForm.carbs) return;
    
    setIsSimulating(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSimulating(false);
      setShowPrediction(true);
    }, 2000);
  };

  const handleInputChange = (field: keyof MealForm, value: string) => {
    setMealForm(prev => ({ ...prev, [field]: value }));
  };

  const presetMeals = [
    { name: "Oatmeal with Banana", carbs: "45", gi: "medium" },
    { name: "White Bread Toast (2 slices)", carbs: "30", gi: "high" },
    { name: "Greek Yogurt with Berries", carbs: "20", gi: "low" },
    { name: "Pasta with Tomato Sauce", carbs: "60", gi: "medium" },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`Time: ${label} min`}</p>
          <p className="text-sm text-primary">
            Predicted: {payload[0]?.value} mg/dL
          </p>
          <p className="text-sm text-muted-foreground">
            Baseline: {payload[1]?.value} mg/dL
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-gradient-primary text-white">
          <CardTitle className="flex items-center gap-2">
            🍽️ Simulate a Meal Impact
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Meal Input Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meal-description">Meal Description</Label>
                <Textarea
                  id="meal-description"
                  placeholder="E.g. 2 slices of whole wheat bread with peanut butter and banana"
                  value={mealForm.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="min-h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="carbs">Carbohydrates (g)</Label>
                  <Input
                    id="carbs"
                    type="number"
                    placeholder="45"
                    value={mealForm.carbs}
                    onChange={(e) => handleInputChange('carbs', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insulin">Insulin Units</Label>
                  <Input
                    id="insulin"
                    type="number"
                    placeholder="4"
                    value={mealForm.insulin}
                    onChange={(e) => handleInputChange('insulin', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gi">Glycemic Index</Label>
                <Select value={mealForm.gi} onValueChange={(value) => handleInputChange('gi', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select glycemic index" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (≤55)</SelectItem>
                    <SelectItem value="medium">Medium (56-69)</SelectItem>
                    <SelectItem value="high">High (≥70)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleSimulate}
                disabled={!mealForm.description || !mealForm.carbs || isSimulating}
                variant="wellness"
                className="w-full"
              >
                {isSimulating ? (
                  <>
                    <Calculator className="h-4 w-4 mr-2 animate-spin" />
                    Simulating Impact...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Simulate Impact
                  </>
                )}
              </Button>
            </div>

            {/* Quick Presets */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Quick Presets</h3>
              <div className="grid gap-2">
                {presetMeals.map((meal, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start h-auto p-3"
                    onClick={() => {
                      setMealForm({
                        description: meal.name,
                        carbs: meal.carbs,
                        gi: meal.gi,
                        insulin: ""
                      });
                    }}
                  >
                    <div className="text-left">
                      <div className="font-medium">{meal.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {meal.carbs}g carbs • {meal.gi} GI
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prediction Results */}
      {showPrediction && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Predicted Glucose Impact
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={predictionData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Time (minutes)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    domain={[80, 180]}
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Glucose (mg/dL)', angle: -90, position: 'insideLeft' }}
                  />
                  
                  <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="5 5" />
                  <ReferenceLine y={140} stroke="#ef4444" strokeDasharray="5 5" />
                  
                  <Tooltip content={<CustomTooltip />} />
                  
                  <Line
                    type="monotone"
                    dataKey="baseline"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Baseline"
                  />
                  
                  <Line
                    type="monotone"
                    dataKey="predicted_glucose"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                    name="Predicted"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Prediction Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Peak Glucose</p>
                    <p className="text-2xl font-bold text-warning">155 mg/dL</p>
                    <p className="text-xs text-muted-foreground">at 60 minutes</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Return to Baseline</p>
                    <p className="text-2xl font-bold text-accent">3 hours</p>
                    <p className="text-xs text-muted-foreground">180 minutes</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Impact Score</p>
                    <p className="text-2xl font-bold text-primary">Moderate</p>
                    <p className="text-xs text-muted-foreground">6.5/10</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}