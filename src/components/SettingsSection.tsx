import { useState } from "react";
import { Save, Key, Moon, Sun, Shield, Bell } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface Settings {
  apiKey: string;
  darkMode: boolean;
  notifications: boolean;
  glucoseUnit: string;
  targetRange: {
    min: string;
    max: string;
  };
  emergencyContact: string;
  dataRetention: string;
}

export function SettingsSection() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>({
    apiKey: "",
    darkMode: false,
    notifications: true,
    glucoseUnit: "mg/dL",
    targetRange: {
      min: "70",
      max: "140"
    },
    emergencyContact: "",
    dataRetention: "1year"
  });

  const handleSave = () => {
    // In a real app, this would save to backend/localStorage
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleInputChange = (field: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleRangeChange = (field: 'min' | 'max', value: string) => {
    setSettings(prev => ({
      ...prev,
      targetRange: { ...prev.targetRange, [field]: value }
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-gradient-accent text-white">
          <CardTitle className="flex items-center gap-2">
            ⚙️ App Settings
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* API Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">API Configuration</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="api-key">AWS API Key (Optional)</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Paste your AWS API Key or Token"
                value={settings.apiKey}
                onChange={(e) => handleInputChange('apiKey', e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Connect to your AWS Bedrock agent for personalized insights. Leave empty to use demo mode.
              </p>
            </div>
          </div>

          <Separator />

          {/* Appearance */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {settings.darkMode ? (
                <Moon className="h-5 w-5 text-primary" />
              ) : (
                <Sun className="h-5 w-5 text-primary" />
              )}
              <h3 className="font-semibold text-foreground">Appearance</h3>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Toggle dark theme</p>
              </div>
              <Switch
                id="dark-mode"
                checked={settings.darkMode}
                onCheckedChange={(checked) => handleInputChange('darkMode', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Glucose Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Glucose Settings</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="glucose-unit">Glucose Unit</Label>
                <Select value={settings.glucoseUnit} onValueChange={(value) => handleInputChange('glucoseUnit', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mg/dL">mg/dL</SelectItem>
                    <SelectItem value="mmol/L">mmol/L</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Target Glucose Range</Label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Min"
                    value={settings.targetRange.min}
                    onChange={(e) => handleRangeChange('min', e.target.value)}
                  />
                </div>
                <span className="text-muted-foreground">to</span>
                <div className="flex-1">
                  <Input
                    placeholder="Max"
                    value={settings.targetRange.max}
                    onChange={(e) => handleRangeChange('max', e.target.value)}
                  />
                </div>
                <span className="text-muted-foreground">{settings.glucoseUnit}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Set your personal target glucose range for better insights
              </p>
            </div>
          </div>

          <Separator />

          {/* Notifications */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Notifications</h3>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts for glucose spikes and patterns
                </p>
              </div>
              <Switch
                id="notifications"
                checked={settings.notifications}
                onCheckedChange={(checked) => handleInputChange('notifications', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency-contact">Emergency Contact</Label>
              <Input
                id="emergency-contact"
                placeholder="Phone number or email"
                value={settings.emergencyContact}
                onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Contact to notify in case of severe glucose events
              </p>
            </div>
          </div>

          <Separator />

          {/* Data Management */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Data Management</h3>
            
            <div className="space-y-2">
              <Label htmlFor="data-retention">Data Retention</Label>
              <Select value={settings.dataRetention} onValueChange={(value) => handleInputChange('dataRetention', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">3 Months</SelectItem>
                  <SelectItem value="6months">6 Months</SelectItem>
                  <SelectItem value="1year">1 Year</SelectItem>
                  <SelectItem value="forever">Forever</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                How long to keep your glucose data
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                Export Data
              </Button>
              <Button variant="destructive" className="flex-1">
                Clear All Data
              </Button>
            </div>
          </div>

          <Separator />

          {/* Save Button */}
          <Button 
            onClick={handleSave}
            variant="wellness"
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardHeader>
          <CardTitle>About GlucoGuide Agent</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              <strong>Version:</strong> 1.0.0 (Demo)
            </p>
            <p>
              <strong>Built with:</strong> React, AWS Bedrock, Tailwind CSS
            </p>
            <p>
              <strong>Privacy:</strong> Your glucose data is processed securely and never shared without your consent.
            </p>
            <p>
              <strong>Support:</strong> For technical support, contact your healthcare provider or development team.
            </p>
            <div className="pt-4">
              <p className="text-center text-xs">
                © 2025 GlucoGuide. Built with AWS + Bedrock + Love ❤️
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}