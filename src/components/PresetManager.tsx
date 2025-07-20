import React, { useState } from 'react';
import { Save, Trash2 } from 'lucide-react';

interface Preset {
  id: string;
  name: string;
  settings: {
    voltageScale: number;
    timeScale: number;
    triggerLevel: number;
    triggerMode: string;
    channels: boolean[];
  };
}

interface PresetManagerProps {
  onLoadPreset: (preset: Preset) => void;
  currentSettings: {
    voltageScale: number;
    timeScale: number;
    triggerLevel: number;
    triggerMode: string;
    channels: boolean[];
  };
}

const PresetManager: React.FC<PresetManagerProps> = ({
  onLoadPreset,
  currentSettings
}) => {
  const [presets, setPresets] = useState<Preset[]>([
    {
      id: '1',
      name: 'Battery Test',
      settings: {
        voltageScale: 2,
        timeScale: 50,
        triggerLevel: 12,
        triggerMode: 'auto',
        channels: [true, false, false, false]
      }
    },
    {
      id: '2', 
      name: 'Alternator Check',
      settings: {
        voltageScale: 5,
        timeScale: 10,
        triggerLevel: 14,
        triggerMode: 'normal',
        channels: [true, true, false, false]
      }
    },
    {
      id: '3',
      name: 'Ignition Analysis',
      settings: {
        voltageScale: 20,
        timeScale: 5,
        triggerLevel: 0,
        triggerMode: 'normal',
        channels: [false, false, true, false]
      }
    },
    {
      id: '4',
      name: 'Full Diagnostic',
      settings: {
        voltageScale: 10,
        timeScale: 20,
        triggerLevel: 5,
        triggerMode: 'auto',
        channels: [true, true, true, true]
      }
    }
  ]);

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  const savePreset = () => {
    if (!newPresetName.trim()) return;

    const newPreset: Preset = {
      id: Date.now().toString(),
      name: newPresetName,
      settings: currentSettings
    };

    setPresets([...presets, newPreset]);
    setNewPresetName('');
    setShowSaveDialog(false);
  };

  const deletePreset = (id: string) => {
    setPresets(presets.filter(p => p.id !== id));
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-2 mb-3">
        {presets.map((preset) => (
          <div key={preset.id} className="flex items-center gap-2">
            <button
              onClick={() => onLoadPreset(preset)}
              className="flex-1 bg-blue-900 hover:bg-blue-800 border border-blue-600 text-blue-200 py-1 px-2 rounded text-xs font-mono text-left transition-colors"
            >
              {preset.name}
            </button>
            <button
              onClick={() => deletePreset(preset.id)}
              className="bg-red-900 hover:bg-red-800 border border-red-600 text-red-200 p-1 rounded transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>

      {showSaveDialog ? (
        <div className="space-y-2">
          <input
            type="text"
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            placeholder="Preset name..."
            className="w-full bg-black border border-gray-500 text-green-400 text-xs font-mono p-1 rounded"
            onKeyPress={(e) => e.key === 'Enter' && savePreset()}
          />
          <div className="flex gap-1">
            <button
              onClick={savePreset}
              className="flex-1 bg-green-900 hover:bg-green-800 border border-green-600 text-green-200 py-1 px-2 rounded text-xs font-mono transition-colors"
            >
              SAVE
            </button>
            <button
              onClick={() => setShowSaveDialog(false)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 border border-gray-500 text-gray-300 py-1 px-2 rounded text-xs font-mono transition-colors"
            >
              CANCEL
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowSaveDialog(true)}
          className="w-full bg-green-900 hover:bg-green-800 border border-green-600 text-green-200 py-1 px-2 rounded text-xs font-mono flex items-center justify-center gap-1 transition-colors"
        >
          <Save size={12} />
          SAVE PRESET
        </button>
      )}
    </div>
  );
};

export default PresetManager;