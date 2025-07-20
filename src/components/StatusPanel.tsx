import React from 'react';
import { Cpu } from 'lucide-react';

interface StatusPanelProps {
  isRunning: boolean;
  sampleRate: number;
  measurements: {
    ch1Voltage: number;
    ch2Voltage: number;
    ch3Voltage: number;
    ch4Voltage: number;
    frequency: number;
    peakToPeak: number;
    rms: number;
    duty: number;
  };
  systemInfo: {
    cpuUsage: number;
    memoryUsage: number;
    temperature: number;
  };
}

const StatusPanel: React.FC<StatusPanelProps> = ({
  isRunning,
  sampleRate,
  measurements,
  systemInfo
}) => {
  return (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-green-400 text-xs font-mono">STATUS:</span>
          <div className={`flex items-center gap-2 ${isRunning ? 'text-green-400' : 'text-red-400'}`}>
            <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="text-xs font-mono">{isRunning ? 'RUNNING' : 'STOPPED'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-green-400 text-xs font-mono">SAMPLE RATE:</span>
          <span className="text-yellow-400 text-xs font-mono">{sampleRate}kS/s</span>
        </div>

        <div className="border-t border-gray-600 pt-2 space-y-1">
          <div className="text-cyan-400 text-xs font-mono font-bold">CHANNELS</div>
          <div className="flex items-center justify-between">
            <span className="text-green-400 text-xs font-mono">CH1 (BAT):</span>
            <span className="text-green-400 text-xs font-mono">{measurements.ch1Voltage.toFixed(2)}V</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-yellow-400 text-xs font-mono">CH2 (ALT):</span>
            <span className="text-yellow-400 text-xs font-mono">{measurements.ch2Voltage.toFixed(2)}V</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-orange-400 text-xs font-mono">CH3 (IGN):</span>
            <span className="text-orange-400 text-xs font-mono">{measurements.ch3Voltage.toFixed(1)}V</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-cyan-400 text-xs font-mono">CH4 (SEN):</span>
            <span className="text-cyan-400 text-xs font-mono">{measurements.ch4Voltage.toFixed(2)}V</span>
          </div>
        </div>

        <div className="border-t border-gray-600 pt-2 space-y-1">
          <div className="text-cyan-400 text-xs font-mono font-bold">ANALYSIS</div>
          <div className="flex items-center justify-between">
            <span className="text-purple-400 text-xs font-mono">FREQ:</span>
            <span className="text-purple-400 text-xs font-mono">{measurements.frequency}Hz</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-purple-400 text-xs font-mono">P-P:</span>
            <span className="text-purple-400 text-xs font-mono">{measurements.peakToPeak.toFixed(1)}V</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-purple-400 text-xs font-mono">RMS:</span>
            <span className="text-purple-400 text-xs font-mono">{measurements.rms.toFixed(2)}V</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-purple-400 text-xs font-mono">DUTY:</span>
            <span className="text-purple-400 text-xs font-mono">{measurements.duty.toFixed(1)}%</span>
          </div>
        </div>

        <div className="border-t border-gray-600 pt-2 space-y-1">
          <div className="flex items-center gap-1 text-cyan-400 text-xs font-mono font-bold">
            <Cpu size={12} />
            SYSTEM
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs font-mono">CPU:</span>
            <span className="text-gray-400 text-xs font-mono">{systemInfo.cpuUsage}%</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs font-mono">MEM:</span>
            <span className="text-gray-400 text-xs font-mono">{systemInfo.memoryUsage}%</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs font-mono">TEMP:</span>
            <span className="text-gray-400 text-xs font-mono">{systemInfo.temperature}°C</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusPanel;