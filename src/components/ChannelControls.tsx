import React from 'react';
import { Battery, Zap, Car, Thermometer } from 'lucide-react';

interface ChannelControlsProps {
  channel1: boolean;
  channel2: boolean;
  channel3: boolean;
  channel4: boolean;
  onChannel1Change: (enabled: boolean) => void;
  onChannel2Change: (enabled: boolean) => void;
  onChannel3Change: (enabled: boolean) => void;
  onChannel4Change: (enabled: boolean) => void;
}

const ChannelControls: React.FC<ChannelControlsProps> = ({
  channel1,
  channel2,
  channel3,
  channel4,
  onChannel1Change,
  onChannel2Change,
  onChannel3Change,
  onChannel4Change
}) => {
  const channels = [
    {
      id: 'ch1',
      label: 'CH1 - BATTERY',
      icon: Battery,
      color: 'green',
      enabled: channel1,
      onChange: onChannel1Change
    },
    {
      id: 'ch2', 
      label: 'CH2 - ALTERNATOR',
      icon: Zap,
      color: 'yellow',
      enabled: channel2,
      onChange: onChannel2Change
    },
    {
      id: 'ch3',
      label: 'CH3 - IGNITION',
      icon: Car,
      color: 'orange',
      enabled: channel3,
      onChange: onChannel3Change
    },
    {
      id: 'ch4',
      label: 'CH4 - SENSORS',
      icon: Thermometer,
      color: 'cyan',
      enabled: channel4,
      onChange: onChannel4Change
    }
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-2 flex-1">
        {channels.map((channel) => {
          const Icon = channel.icon;
          const colorClass = channel.enabled 
            ? channel.color === 'green' ? 'text-green-400 border-green-500' 
              : channel.color === 'yellow' ? 'text-yellow-400 border-yellow-500'
              : channel.color === 'orange' ? 'text-orange-400 border-orange-500'
              : 'text-cyan-400 border-cyan-500'
            : 'text-gray-500 border-gray-600';

          return (
            <div key={channel.id} className="flex items-center gap-3">
              <button
                onClick={() => channel.onChange(!channel.enabled)}
                className={`flex items-center gap-2 p-2 border-2 rounded transition-all ${colorClass} ${
                  channel.enabled ? 'bg-opacity-20' : ''
                } hover:bg-opacity-30`}
              >
                <Icon size={16} />
                <span className="text-xs font-mono whitespace-nowrap">{channel.label}</span>
              </button>
              
              <div className={`w-3 h-3 rounded-full ${
                channel.enabled 
                  ? channel.color === 'green' ? 'bg-green-400 shadow-green-400' 
                    : channel.color === 'yellow' ? 'bg-yellow-400 shadow-yellow-400'
                    : channel.color === 'orange' ? 'bg-orange-400 shadow-orange-400'
                    : 'bg-cyan-400 shadow-cyan-400'
                  : 'bg-gray-600'
              } ${channel.enabled ? 'shadow-lg animate-pulse' : ''}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChannelControls;