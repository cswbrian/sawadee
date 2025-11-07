import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { loadSettings, updateSetting, type Settings } from "@/lib/settings";

export const Settings = () => {
  const [settings, setSettings] = useState<Settings>(loadSettings());

  useEffect(() => {
    // Reload settings in case they changed elsewhere
    setSettings(loadSettings());
  }, []);

  const handleAdaptiveLearningToggle = (checked: boolean | "indeterminate") => {
    if (checked === "indeterminate") return;
    const updated = updateSetting("adaptiveLearning", checked);
    setSettings(updated);
  };

  return (
    <div className="bg-background p-4 pb-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quiz Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-2">
              <div className="flex-1 space-y-1">
                <Label htmlFor="adaptive-learning" className="text-base font-semibold">
                  Adaptive Learning
                </Label>
                <p className="text-sm text-muted-foreground">
                  Letters you struggle with will appear more frequently in quizzes to help you improve faster.
                </p>
              </div>
              <Checkbox
                id="adaptive-learning"
                checked={settings.adaptiveLearning}
                onCheckedChange={handleAdaptiveLearningToggle}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

