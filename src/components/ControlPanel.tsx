import React from 'react';
import { RotateCcw, Settings, TrendingUp } from 'lucide-react';

interface ControlPanelProps {
  voltageScale: number;
  timeScale: number;
  triggerLevel: number;
  triggerMode: 'auto' | 'normal' | 'single';
  triggerSlope: 'rising' | 'falling';
  displayMode: 'normal' | 'xy' | 'roll';
  persistence: boolean;
  mathFunction: 'none' | 'add' | 'subtract' | 'multiply';
  onVoltageScaleChange: (value: number) => void;
  onTimeScaleChange: (value: number) => void;
  onTriggerLevelChange: (value: number) => void;
  onTriggerModeChange: (mode: 'auto' | 'normal' | 'single') => void;
  onTriggerSlopeChange: (slope: 'rising' | 'falling') => void;
  onDisplayModeChange: (mode: 'normal' | 'xy' | 'roll') => void;
  onPersistenceChange: (enabled: boolean) => void;
  onMathFunctionChange: (func: 'none' | 'add' | 'subtract' | 'multiply') => void;
  onReset: () => void;
  onAutoScale?: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  voltageScale,
  timeScale,
  triggerLevel,
  triggerMode,
  triggerSlope,
  displayMode,
  persistence,
  mathFunction,
  onVoltageScaleChange,
  onTimeScaleChange,
  onTriggerLevelChange,
  onTriggerModeChange,
  onTriggerSlopeChange,
  onDisplayModeChange,
  onPersistenceChange,
  onMathFunctionChange,
  onReset,
  onAutoScale
}) => {
  const voltageScales = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20];
  const timeScales = [1, 2, 5, 10, 20, 50, 100, 200];

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-3 gap-3 flex-1 overflow-auto">
        <div className="space-y-2">
          <div className="text-cyan-400 text-xs font-mono font-bold">SCALE</div>
          <div>
            <label className="block text-green-400 text-xs font-mono mb-1">
              VOLTAGE/DIV (V)
            </label>
            <select 
              value={voltageScale}
              onChange={(e) => onVoltageScaleChange(Number(e.target.value))}
              className="w-full bg-black border border-gray-500 text-green-400 text-xs font-mono p-1 rounded"
            >
              {voltageScales.map(scale => (
                <option key={scale} value={scale}>{scale}V</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-green-400 text-xs font-mono mb-1">
              TIME/DIV (ms)
            </label>
            <select 
              value={timeScale}
              onChange={(e) => onTimeScaleChange(Number(e.target.value))}
              className="w-full bg-black border border-gray-500 text-green-400 text-xs font-mono p-1 rounded"
            >
              {timeScales.map(scale => (
                <option key={scale} value={scale}>{scale}ms</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-cyan-400 text-xs font-mono font-bold">TRIGGER</div>
          <div>
            <label className="block text-amber-400 text-xs font-mono mb-1">
              LEVEL (V)
            </label>
            <input
              type="range"
              min="-20"
              max="20"
              step="0.1"
              value={triggerLevel}
              onChange={(e) => onTriggerLevelChange(Number(e.target.value))}
              className="w-full accent-amber-400"
            />
            <div className="text-amber-400 text-xs font-mono text-center">
              {triggerLevel.toFixed(1)}V
            </div>
          </div>
          
          <div>
            <label className="block text-amber-400 text-xs font-mono mb-1">
              MODE
            </label>
            <select 
              value={triggerMode}
              onChange={(e) => onTriggerModeChange(e.target.value as 'auto' | 'normal' | 'single')}
              className="w-full bg-black border border-gray-500 text-amber-400 text-xs font-mono p-1 rounded"
            >
              <option value="auto">AUTO</option>
              <option value="normal">NORMAL</option>
              <option value="single">SINGLE</option>
            </select>
          </div>
          
          <div>
            <label className="block text-amber-400 text-xs font-mono mb-1">
              SLOPE
            </label>
            <select 
              value={triggerSlope}
              onChange={(e) => onTriggerSlopeChange(e.target.value as 'rising' | 'falling')}
              className="w-full bg-black border border-gray-500 text-amber-400 text-xs font-mono p-1 rounded"
            >
              <option value="rising">RISING ↗</option>
              <option value="falling">FALLING ↘</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-cyan-400 text-xs font-mono font-bold">DISPLAY</div>
          
          <div>
            <label className="block text-purple-400 text-xs font-mono mb-1">
              MODE
            </label>
            <select 
              value={displayMode}
              onChange={(e) => onDisplayModeChange(e.target.value as 'normal' | 'xy' | 'roll')}
              className="w-full bg-black border border-gray-500 text-purple-400 text-xs font-mono p-1 rounded"
            >
              <option value="normal">NORMAL</option>
              <option value="xy">X-Y</option>
              <option value="roll">ROLL</option>
            </select>
          </div>
          
          <div>
            <label className="block text-purple-400 text-xs font-mono mb-1">
              MATH
            </label>
            <select 
              value={mathFunction}
              onChange={(e) => onMathFunctionChange(e.target.value as 'none' | 'add' | 'subtract' | 'multiply')}
              className="w-full bg-black border border-gray-500 text-purple-400 text-xs font-mono p-1 rounded"
            >
              <option value="none">OFF</option>
              <option value="add">CH1+CH2</option>
              <option value="subtract">CH1-CH2</option>
              <option value="multiply">CH1×CH2</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="persistence"
              checked={persistence}
              onChange={(e) => onPersistenceChange(e.target.checked)}
              className="accent-purple-400"
            />
            <label htmlFor="persistence" className="text-purple-400 text-xs font-mono">
              PERSIST
            </label>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-600 pt-2 mt-2 flex-shrink-0">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onReset}
            className="flex-1 min-w-0 bg-red-900 hover:bg-red-800 border border-red-600 text-red-200 py-1 px-2 rounded text-xs font-mono flex items-center justify-center gap-1 transition-colors"
          >
            <RotateCcw size={12} />
            RESET
          </button>
          
          <button className="flex-1 min-w-0 bg-blue-900 hover:bg-blue-800 border border-blue-600 text-blue-200 py-1 px-2 rounded text-xs font-mono flex items-center justify-center gap-1 transition-colors">
            <Settings size={12} />
            PRESET
          </button>
          
          <button 
            onClick={onAutoScale}
            className="flex-1 min-w-0 bg-green-900 hover:bg-green-800 border border-green-600 text-green-200 py-1 px-2 rounded text-xs font-mono flex items-center justify-center gap-1 transition-colors"
          >
            <TrendingUp size={12} />
            AUTO
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;