import { useTheme, themePresets } from './ThemeProvider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { X, Palette } from 'lucide-react';

export function ThemeSelector() {
  const { currentPreset, setThemePreset, showThemeSelector, setShowThemeSelector } = useTheme();

  if (!showThemeSelector) {
    return (
      <Button
        size="sm"
        variant="outline"
        className="fixed top-4 right-4 z-50 opacity-20 hover:opacity-100 transition-opacity"
        onClick={() => setShowThemeSelector(true)}
      >
        <Palette className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Card className="fixed top-4 right-4 z-50 p-4 w-72">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">Theme Presets</h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowThemeSelector(false)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="space-y-2">
        {themePresets.map((preset) => (
          <Button
            key={preset.name}
            variant={currentPreset.name === preset.name ? "default" : "outline"}
            className="w-full justify-start"
            onClick={() => setThemePreset(preset)}
          >
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div 
                  className="w-3 h-3 rounded-full border" 
                  style={{ backgroundColor: preset.colors.primary }}
                />
                <div 
                  className="w-3 h-3 rounded-full border" 
                  style={{ backgroundColor: preset.colors.secondary }}
                />
                <div 
                  className="w-3 h-3 rounded-full border" 
                  style={{ backgroundColor: preset.colors.accent }}
                />
              </div>
              <span className="text-sm">{preset.name}</span>
            </div>
          </Button>
        ))}
      </div>
    </Card>
  );
}