import React, { useState, useEffect } from 'react';
import { Play, Pause, Power, Download, Upload, HelpCircle, LayoutGrid, Monitor, Settings, BarChart3, Zap, FileText, X } from 'lucide-react';
import Oscilloscope from './components/Oscilloscope';
import ControlPanel from './components/ControlPanel';
import ChannelControls from './components/ChannelControls';
import StatusPanel from './components/StatusPanel';
import FFTAnalyzer from './components/FFTAnalyzer';
import PresetManager from './components/PresetManager';
import WindowManager from './components/WindowManager';

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [isPowered, setIsPowered] = useState(true);
  const [channel1, setChannel1] = useState(true);
  const [channel2, setChannel2] = useState(true);
  const [channel3, setChannel3] = useState(false);
  const [channel4, setChannel4] = useState(false);
  const [voltageScale, setVoltageScale] = useState(5);
  const [timeScale, setTimeScale] = useState(10);
  const [triggerLevel, setTriggerLevel] = useState(0);
  const [triggerMode, setTriggerMode] = useState<'auto' | 'normal' | 'single'>('auto');
  const [triggerSlope, setTriggerSlope] = useState<'rising' | 'falling'>('rising');
  const [displayMode, setDisplayMode] = useState<'normal' | 'xy' | 'roll'>('normal');
  const [persistence, setPersistence] = useState(false);
  const [mathFunction, setMathFunction] = useState<'none' | 'add' | 'subtract' | 'multiply'>('none');
  const [showFFT, setShowFFT] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [visibleWindows, setVisibleWindows] = useState({
    oscilloscope: true,
    'status-panel': true,
    'control-panel': true,
    'channel-controls': true,
    'quick-actions': true,
    'fft-analyzer': false,
    'preset-manager': false
  });
  const [windowManagerPosition, setWindowManagerPosition] = useState(() => {
    const saved = localStorage.getItem('window-manager-position');
    return saved ? JSON.parse(saved) : { x: 8, y: 8 };
  });
  const [isDraggingManager, setIsDraggingManager] = useState(false);
  const [managerDragStart, setManagerDragStart] = useState({ x: 0, y: 0 });
  const [showWindowManager, setShowWindowManager] = useState(true);
  const [measurements, setMeasurements] = useState({
    ch1Voltage: 12.6,
    ch2Voltage: 14.2,
    ch3Voltage: -180.5,
    ch4Voltage: 2.5,
    frequency: 30,
    peakToPeak: 0.8,
    rms: 12.4,
    duty: 45.2
  });
  const [systemInfo, setSystemInfo] = useState({
    cpuUsage: 15,
    memoryUsage: 42,
    temperature: 38
  });

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setMeasurements({
          ch1Voltage: 12.6 + (Math.random() - 0.5) * 0.2,
          ch2Voltage: 14.2 + (Math.random() - 0.5) * 0.4,
          ch3Voltage: -180 + (Math.random() - 0.5) * 100,
          ch4Voltage: 2.5 + (Math.random() - 0.5) * 1.0,
          frequency: 30 + Math.floor(Math.random() * 10),
          peakToPeak: 0.8 + (Math.random() - 0.5) * 0.3,
          rms: 12.4 + (Math.random() - 0.5) * 0.5,
          duty: 45.2 + (Math.random() - 0.5) * 10
        });
        
        setSystemInfo({
          cpuUsage: 15 + Math.floor(Math.random() * 20),
          memoryUsage: 42 + Math.floor(Math.random() * 15),
          temperature: 38 + Math.floor(Math.random() * 8)
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [isRunning]);

  // Save window manager position when it changes
  useEffect(() => {
    localStorage.setItem('window-manager-position', JSON.stringify(windowManagerPosition));
  }, [windowManagerPosition]);

  // Window Manager drag handlers
  useEffect(() => {
    const handleManagerMouseMove = (e: MouseEvent) => {
      if (isDraggingManager) {
        const newX = e.clientX - managerDragStart.x;
        const newY = e.clientY - managerDragStart.y;
        
        // Keep window manager within viewport bounds
        const maxX = window.innerWidth - 200; // Approximate width
        const maxY = window.innerHeight - 400; // Approximate height
        
        const clampedX = Math.max(0, Math.min(newX, maxX));
        const clampedY = Math.max(0, Math.min(newY, maxY));
        
        setWindowManagerPosition({ x: clampedX, y: clampedY });
      }
    };

    const handleManagerMouseUp = () => {
      setIsDraggingManager(false);
    };

    if (isDraggingManager) {
      document.addEventListener('mousemove', handleManagerMouseMove);
      document.addEventListener('mouseup', handleManagerMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleManagerMouseMove);
        document.removeEventListener('mouseup', handleManagerMouseUp);
      };
    }
  }, [isDraggingManager, managerDragStart]);

  const handleScreenshot = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `oscilloscope-${new Date().toISOString().slice(0, 19)}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const handleLoadPreset = (preset: { settings: { voltageScale: number; timeScale: number; triggerLevel: number; triggerMode: string; channels: boolean[] } }) => {
    setVoltageScale(preset.settings.voltageScale);
    setTimeScale(preset.settings.timeScale);
    setTriggerLevel(preset.settings.triggerLevel);
    setTriggerMode(preset.settings.triggerMode as 'auto' | 'normal' | 'single');
    setChannel1(preset.settings.channels[0]);
    setChannel2(preset.settings.channels[1]);
    setChannel3(preset.settings.channels[2]);
    setChannel4(preset.settings.channels[3]);
    setShowPresets(false);
  };

  const getCurrentSettings = () => ({
    voltageScale,
    timeScale,
    triggerLevel,
    triggerMode,
    channels: [channel1, channel2, channel3, channel4]
  });

  const handleReset = () => {
    console.log('Reset button clicked');
    setIsRunning(false);
    setVoltageScale(5);
    setTimeScale(10);
    setTriggerLevel(0);
    setChannel1(true);
    setChannel2(true);
    setChannel3(false);
    setChannel4(false);
    setTriggerMode('auto');
    setTriggerSlope('rising');
    setDisplayMode('normal');
    setPersistence(false);
    setMathFunction('none');
  };

  const handleAutoScale = () => {
    // Auto-scale logic - adjust scales based on signal characteristics
    setVoltageScale(2); // Smaller voltage scale for better resolution
    setTimeScale(5); // Faster time scale for better detail
    setTriggerLevel(0); // Center trigger
    setTriggerMode('auto');
    setTriggerSlope('rising');
    setDisplayMode('normal');
    setPersistence(false);
    setMathFunction('none');
  };

  if (!isPowered) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <button
          onClick={() => setIsPowered(true)}
          className="bg-green-900 hover:bg-green-800 border-2 border-green-600 text-green-200 py-4 px-8 rounded-lg text-lg font-mono flex items-center gap-3 transition-colors shadow-lg"
        >
          <Power size={24} />
          POWER ON
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-2 flex flex-col">
      {/* Header */}
      <div className="bg-black border-2 border-gray-600 rounded-lg mb-2 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-green-400 text-lg font-mono font-bold">
              CAR-SCOPE v2.1
            </div>
            <div className="text-amber-400 text-xs font-mono">
              Automotive Electrical Diagnostic Oscilloscope
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex items-center gap-1 py-1 px-3 rounded border font-mono text-xs transition-colors ${
                isRunning 
                  ? 'bg-red-900 hover:bg-red-800 border-red-600 text-red-200'
                  : 'bg-green-900 hover:bg-green-800 border-green-600 text-green-200'
              }`}
            >
              {isRunning ? <Pause size={12} /> : <Play size={12} />}
              {isRunning ? 'STOP' : 'START'}
            </button>
            
            <button
              onClick={() => {
                setShowFFT(!showFFT);
                setVisibleWindows(prev => ({ ...prev, 'fft-analyzer': !showFFT }));
              }}
              className={`py-1 px-3 rounded border font-mono text-xs transition-colors ${
                showFFT
                  ? 'bg-cyan-900 hover:bg-cyan-800 border-cyan-600 text-cyan-200'
                  : 'bg-gray-700 hover:bg-gray-600 border-gray-500 text-gray-300'
              }`}
            >
              FFT
            </button>
            
            <button
              onClick={() => {
                setShowPresets(!showPresets);
                setVisibleWindows(prev => ({ ...prev, 'preset-manager': !showPresets }));
              }}
              className={`py-1 px-3 rounded border font-mono text-xs transition-colors ${
                showPresets
                  ? 'bg-blue-900 hover:bg-blue-800 border-blue-600 text-blue-200'
                  : 'bg-gray-700 hover:bg-gray-600 border-gray-500 text-gray-300'
              }`}
            >
              PRESETS
            </button>
            
            <button
              onClick={() => {
                // Trigger grid arrangement by calling the WindowManager's grid function
                const event = new CustomEvent('arrange-grid');
                window.dispatchEvent(event);
              }}
              className="bg-purple-900 hover:bg-purple-800 border border-purple-600 text-purple-200 py-1 px-3 rounded font-mono text-xs flex items-center gap-1 transition-colors"
            >
              <LayoutGrid size={12} />
              GRID
            </button>
            
            <button
              onClick={() => setShowHelp(!showHelp)}
              className={`py-1 px-3 rounded border font-mono text-xs transition-colors flex items-center gap-1 ${
                showHelp
                  ? 'bg-orange-900 hover:bg-orange-800 border-orange-600 text-orange-200'
                  : 'bg-gray-700 hover:bg-gray-600 border-gray-500 text-gray-300'
              }`}
            >
              <HelpCircle size={12} />
              HELP
            </button>
            
            <button
              onClick={() => setShowWindowManager(!showWindowManager)}
              className={`py-1 px-3 rounded border font-mono text-xs transition-colors flex items-center gap-1 ${
                showWindowManager
                  ? 'bg-green-900 hover:bg-green-800 border-green-600 text-green-200'
                  : 'bg-gray-700 hover:bg-gray-600 border-gray-500 text-gray-300'
              }`}
            >
              <Settings size={12} />
              MANAGER
            </button>
            
            <button
              onClick={() => setIsPowered(false)}
              className="bg-gray-700 hover:bg-gray-600 border border-gray-500 text-gray-300 py-1 px-3 rounded font-mono text-xs flex items-center gap-1 transition-colors"
            >
              <Power size={12} />
              POWER
            </button>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999]">
          <div className="bg-gray-800 border-2 border-gray-600 rounded-lg p-6 max-w-md">
            <h3 className="text-amber-400 text-lg font-mono mb-4">KEYBOARD SHORTCUTS</h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-green-400">Ctrl+S:</span>
                <span className="text-gray-300">Screenshot</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-400">C:</span>
                <span className="text-gray-300">Toggle Cursors</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-400">Space:</span>
                <span className="text-gray-300">Start/Stop</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-400">R:</span>
                <span className="text-gray-300">Reset</span>
              </div>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="mt-4 w-full bg-gray-700 hover:bg-gray-600 border border-gray-500 text-gray-300 py-2 px-4 rounded font-mono text-sm transition-colors"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* Window Management Panel */}
      {showWindowManager && (
        <div 
          className="fixed top-2 left-2 z-[9998] bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg cursor-move select-none"
          style={{
            left: windowManagerPosition.x,
            top: windowManagerPosition.y
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget || (e.target as HTMLElement).closest('h4')) {
              setIsDraggingManager(true);
              setManagerDragStart({ x: e.clientX - windowManagerPosition.x, y: e.clientY - windowManagerPosition.y });
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
        <h4 className="text-amber-300 text-xs font-mono font-bold mb-2">WINDOW MANAGER</h4>
        <div className="space-y-1">
          <button
            onClick={() => setVisibleWindows({
              oscilloscope: true,
              'status-panel': true,
              'control-panel': true,
              'channel-controls': true,
              'quick-actions': true,
              'fft-analyzer': showFFT,
              'preset-manager': showPresets
            })}
            className="w-full text-left px-2 py-1 rounded text-xs font-mono transition-colors bg-blue-900 text-blue-200 border border-blue-600 hover:bg-blue-800 flex items-center gap-1 mb-2"
          >
            <LayoutGrid size={10} />
            Show All Windows
          </button>
          
          <button
            onClick={() => setVisibleWindows({
              oscilloscope: false,
              'status-panel': false,
              'control-panel': false,
              'channel-controls': false,
              'quick-actions': false,
              'fft-analyzer': false,
              'preset-manager': false
            })}
            className="w-full text-left px-2 py-1 rounded text-xs font-mono transition-colors bg-red-900 text-red-200 border border-red-600 hover:bg-red-800 flex items-center gap-1 mb-2"
          >
            <X size={10} />
            Hide All Windows
          </button>
          <button
            onClick={() => setVisibleWindows(prev => ({ ...prev, oscilloscope: !prev.oscilloscope }))}
            className={`w-full text-left px-2 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1 ${
              visibleWindows.oscilloscope 
                ? 'bg-green-900 text-green-200 border border-green-600' 
                : 'bg-gray-700 text-gray-300 border border-gray-500 hover:bg-gray-600'
            }`}
          >
            <Monitor size={10} />
            Oscilloscope
          </button>
          
          <button
            onClick={() => setVisibleWindows(prev => ({ ...prev, 'status-panel': !prev['status-panel'] }))}
            className={`w-full text-left px-2 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1 ${
              visibleWindows['status-panel'] 
                ? 'bg-green-900 text-green-200 border border-green-600' 
                : 'bg-gray-700 text-gray-300 border border-gray-500 hover:bg-gray-600'
            }`}
          >
            <BarChart3 size={10} />
            Status Panel
          </button>
          
          <button
            onClick={() => setVisibleWindows(prev => ({ ...prev, 'control-panel': !prev['control-panel'] }))}
            className={`w-full text-left px-2 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1 ${
              visibleWindows['control-panel'] 
                ? 'bg-green-900 text-green-200 border border-green-600' 
                : 'bg-gray-700 text-gray-300 border border-gray-500 hover:bg-gray-600'
            }`}
          >
            <Settings size={10} />
            Control Panel
          </button>
          
          <button
            onClick={() => setVisibleWindows(prev => ({ ...prev, 'channel-controls': !prev['channel-controls'] }))}
            className={`w-full text-left px-2 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1 ${
              visibleWindows['channel-controls'] 
                ? 'bg-green-900 text-green-200 border border-green-600' 
                : 'bg-gray-700 text-gray-300 border border-gray-500 hover:bg-gray-600'
            }`}
          >
            <Zap size={10} />
            Channel Controls
          </button>
          
          <button
            onClick={() => setVisibleWindows(prev => ({ ...prev, 'quick-actions': !prev['quick-actions'] }))}
            className={`w-full text-left px-2 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1 ${
              visibleWindows['quick-actions'] 
                ? 'bg-green-900 text-green-200 border border-green-600' 
                : 'bg-gray-700 text-gray-300 border border-gray-500 hover:bg-gray-600'
            }`}
          >
            <FileText size={10} />
            Quick Actions
          </button>
          
          <button
            onClick={() => {
              setShowFFT(!showFFT);
              setVisibleWindows(prev => ({ ...prev, 'fft-analyzer': !showFFT }));
            }}
            className={`w-full text-left px-2 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1 ${
              visibleWindows['fft-analyzer'] 
                ? 'bg-green-900 text-green-200 border border-green-600' 
                : 'bg-gray-700 text-gray-300 border border-gray-500 hover:bg-gray-600'
            }`}
          >
            <BarChart3 size={10} />
            FFT Analyzer
          </button>
          
          <button
            onClick={() => {
              setShowPresets(!showPresets);
              setVisibleWindows(prev => ({ ...prev, 'preset-manager': !showPresets }));
            }}
            className={`w-full text-left px-2 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1 ${
              visibleWindows['preset-manager'] 
                ? 'bg-green-900 text-green-200 border border-green-600' 
                : 'bg-gray-700 text-gray-300 border border-gray-500 hover:bg-gray-600'
            }`}
          >
            <FileText size={10} />
            Preset Manager
          </button>
        </div>
      </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 relative">
        {/* Draggable Windows */}
        <WindowManager
          windows={[
          {
            id: 'oscilloscope',
            title: 'Oscilloscope Display',
            component: (
              <Oscilloscope
                isRunning={isRunning}
                channel1={channel1}
                channel2={channel2}
                channel3={channel3}
                channel4={channel4}
                voltageScale={voltageScale}
                timeScale={timeScale}
                triggerLevel={triggerLevel}
                triggerMode={triggerMode}
                triggerSlope={triggerSlope}
                displayMode={displayMode}
                persistence={persistence}
                mathFunction={mathFunction}
                onScreenshot={handleScreenshot}
              />
            ),
            defaultPosition: { x: 20, y: 80 },
            defaultSize: { width: 900, height: 450 },
            isVisible: visibleWindows.oscilloscope
          },
          {
            id: 'status-panel',
            title: 'Status & Measurements',
            component: (
              <StatusPanel
                isRunning={isRunning}
                sampleRate={100}
                measurements={measurements}
                systemInfo={systemInfo}
              />
            ),
            defaultPosition: { x: 940, y: 80 },
            defaultSize: { width: 350, height: 450 },
            isVisible: visibleWindows['status-panel']
          },
          {
            id: 'control-panel',
            title: 'Control Panel',
            component: (
              <ControlPanel
                voltageScale={voltageScale}
                timeScale={timeScale}
                triggerLevel={triggerLevel}
                triggerMode={triggerMode}
                triggerSlope={triggerSlope}
                displayMode={displayMode}
                persistence={persistence}
                mathFunction={mathFunction}
                onVoltageScaleChange={setVoltageScale}
                onTimeScaleChange={setTimeScale}
                onTriggerLevelChange={setTriggerLevel}
                onTriggerModeChange={setTriggerMode}
                onTriggerSlopeChange={setTriggerSlope}
                onDisplayModeChange={setDisplayMode}
                onPersistenceChange={setPersistence}
                onMathFunctionChange={setMathFunction}
                onReset={handleReset}
                onAutoScale={handleAutoScale}
              />
            ),
            defaultPosition: { x: 20, y: 550 },
            defaultSize: { width: 400, height: 350 },
            isVisible: visibleWindows['control-panel']
          },
          {
            id: 'channel-controls',
            title: 'Channel Controls',
            component: (
              <ChannelControls
                channel1={channel1}
                channel2={channel2}
                channel3={channel3}
                channel4={channel4}
                onChannel1Change={setChannel1}
                onChannel2Change={setChannel2}
                onChannel3Change={setChannel3}
                onChannel4Change={setChannel4}
              />
            ),
            defaultPosition: { x: 440, y: 550 },
            defaultSize: { width: 400, height: 350 },
            isVisible: visibleWindows['channel-controls']
          },
          {
            id: 'quick-actions',
            title: 'Quick Actions',
            component: (
              <div className="flex flex-col h-full">
                <div className="space-y-2 flex-1">
                  <button
                    onClick={handleScreenshot}
                    className="w-full bg-purple-900 hover:bg-purple-800 border border-purple-600 text-purple-200 py-2 px-3 rounded text-sm font-mono flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download size={16} />
                    SCREENSHOT
                  </button>
                  
                  <button className="w-full bg-indigo-900 hover:bg-indigo-800 border border-indigo-600 text-indigo-200 py-2 px-3 rounded text-sm font-mono flex items-center justify-center gap-2 transition-colors">
                    <Upload size={16} />
                    EXPORT DATA
                  </button>
                  
                  <button 
                    onClick={handleAutoScale}
                    className="w-full bg-teal-900 hover:bg-teal-800 border border-teal-600 text-teal-200 py-2 px-3 rounded text-sm font-mono flex items-center justify-center gap-2 transition-colors"
                  >
                    AUTO SCALE
                  </button>
                </div>
              </div>
            ),
            defaultPosition: { x: 860, y: 550 },
            defaultSize: { width: 350, height: 350 },
            isVisible: visibleWindows['quick-actions']
          },
          {
            id: 'fft-analyzer',
            title: 'FFT Analyzer',
            component: (
              <FFTAnalyzer
                isRunning={isRunning}
                channel1={channel1}
                channel2={channel2}
                channel3={channel3}
                channel4={channel4}
              />
            ),
            defaultPosition: { x: 20, y: 920 },
            defaultSize: { width: 700, height: 350 },
            isVisible: showFFT
          },
          {
            id: 'preset-manager',
            title: 'Preset Manager',
            component: (
              <PresetManager
                onLoadPreset={handleLoadPreset}
                currentSettings={getCurrentSettings()}
              />
            ),
            defaultPosition: { x: 740, y: 920 },
            defaultSize: { width: 600, height: 350 },
            isVisible: showPresets
          }
        ]}
        onWindowClose={(windowId) => {
          if (windowId === 'fft-analyzer') {
            setShowFFT(false);
            setVisibleWindows(prev => ({ ...prev, 'fft-analyzer': false }));
          } else if (windowId === 'preset-manager') {
            setShowPresets(false);
            setVisibleWindows(prev => ({ ...prev, 'preset-manager': false }));
          } else {
            // Hide other windows
            setVisibleWindows(prev => ({ ...prev, [windowId]: false }));
          }
        }}
      />
      </div>

      {/* Footer */}
      <div className="mt-2 text-center text-gray-500 text-xs font-mono">
        CarScope Pro v2.1 - Automotive Electrical Diagnostic Tool | Compatible with 12V/24V Systems | Press F1 for Help
      </div>
    </div>
  );
}

export default App;