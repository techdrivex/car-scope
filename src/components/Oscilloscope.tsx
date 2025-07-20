import React, { useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';

interface OscilloscopeProps {
  isRunning: boolean;
  channel1: boolean;
  channel2: boolean;
  channel3: boolean;
  channel4: boolean;
  voltageScale: number;
  timeScale: number;
  triggerLevel: number;
  triggerMode: 'auto' | 'normal' | 'single';
  triggerSlope: 'rising' | 'falling';
  displayMode: 'normal' | 'xy' | 'roll';
  persistence: boolean;
  mathFunction: 'none' | 'add' | 'subtract' | 'multiply';
  onScreenshot: () => void;
}

const Oscilloscope: React.FC<OscilloscopeProps> = ({
  isRunning,
  channel1,
  channel2,
  channel3,
  channel4,
  voltageScale,
  timeScale,
  triggerLevel,
  triggerMode,
  triggerSlope,
  displayMode,
  persistence,
  mathFunction,
  onScreenshot
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const [cursors, setCursors] = useState({
    voltage1: 0,
    voltage2: 0,
    time1: 0,
    time2: 0,
    enabled: false
  });

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Redraw immediately after resize
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawGrid();
      }
    };

    resizeCanvas();
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas.parentElement!);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Draw grid function
  const drawGrid = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#003300';
    ctx.lineWidth = 1;

    // Vertical grid lines
    for (let x = 0; x <= canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let y = 0; y <= canvas.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Center lines (brighter)
    ctx.strokeStyle = '#006600';
    ctx.lineWidth = 2;
    
    // Vertical center
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    // Horizontal center
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 's' && e.ctrlKey) {
        e.preventDefault();
        onScreenshot();
      }
      if (e.key === 'c') {
        setCursors(prev => ({ ...prev, enabled: !prev.enabled }));
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    const drawGrid = () => {
      ctx.strokeStyle = '#003300';
      ctx.lineWidth = 1;

      // Vertical grid lines
      for (let x = 0; x <= canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Horizontal grid lines
      for (let y = 0; y <= canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Center lines (brighter)
      ctx.strokeStyle = '#006600';
      ctx.lineWidth = 2;
      
      // Vertical center
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();

      // Horizontal center
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    const drawWaveform = (data: number[], color: string, offset: number = 0, lineWidth: number = 2) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      
      ctx.beginPath();
      data.forEach((value, index) => {
        const x = (index / data.length) * canvas.width;
        const y = canvas.height / 2 - (value * voltageScale * 20) + offset;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    const drawCursors = () => {
      if (!cursors.enabled) return;

      ctx.strokeStyle = '#ff00ff';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      // Voltage cursors
      const v1Y = canvas.height / 2 - (cursors.voltage1 * voltageScale * 20);
      const v2Y = canvas.height / 2 - (cursors.voltage2 * voltageScale * 20);
      
      ctx.beginPath();
      ctx.moveTo(0, v1Y);
      ctx.lineTo(canvas.width, v1Y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, v2Y);
      ctx.lineTo(canvas.width, v2Y);
      ctx.stroke();

      // Time cursors
      const t1X = (cursors.time1 / 100) * canvas.width;
      const t2X = (cursors.time2 / 100) * canvas.width;

      ctx.beginPath();
      ctx.moveTo(t1X, 0);
      ctx.lineTo(t1X, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(t2X, 0);
      ctx.lineTo(t2X, canvas.height);
      ctx.stroke();

      ctx.setLineDash([]);

      // Cursor labels
      ctx.fillStyle = '#ff00ff';
      ctx.font = '10px monospace';
      ctx.fillText(`V1: ${cursors.voltage1.toFixed(1)}V`, 5, v1Y - 5);
      ctx.fillText(`V2: ${cursors.voltage2.toFixed(1)}V`, 5, v2Y - 5);
      ctx.fillText(`T1: ${cursors.time1.toFixed(1)}ms`, t1X + 5, 15);
      ctx.fillText(`T2: ${cursors.time2.toFixed(1)}ms`, t2X + 5, 30);
      
      // Delta measurements
      const deltaV = Math.abs(cursors.voltage2 - cursors.voltage1);
      const deltaT = Math.abs(cursors.time2 - cursors.time1);
      ctx.fillText(`ΔV: ${deltaV.toFixed(1)}V`, canvas.width - 100, 15);
      ctx.fillText(`ΔT: ${deltaT.toFixed(1)}ms`, canvas.width - 100, 30);
    };
    const generateCarElectricalData = (time: number, type: 'battery' | 'alternator' | 'ignition' | 'sensor') => {
      const points = 400;
      const data: number[] = [];

      for (let i = 0; i < points; i++) {
        const t = (time + i * timeScale) / 1000;
        let value = 0;

        switch (type) {
          case 'battery':
            // Battery voltage with small ripple
            value = 12.6 + Math.sin(t * 120 * Math.PI) * 0.1 + Math.random() * 0.05;
            break;
          case 'alternator':
            // Alternator output with rectifier ripple
            value = 14.2 + Math.sin(t * 720 * Math.PI) * 0.8 + Math.sin(t * 360 * Math.PI) * 0.3;
            break;
          case 'ignition': {
            // Ignition coil primary
            const cycle = t * 30; // 30 Hz ignition
            const cyclePos = cycle - Math.floor(cycle);
            if (cyclePos < 0.1) {
              value = 12 * (1 - cyclePos * 10); // Sharp drop
            } else if (cyclePos < 0.2) {
              value = -300 + Math.random() * 50; // Negative spike
            } else {
              value = Math.random() * 0.5; // Low level with noise
            }
            break;
          }
          case 'sensor':
            // O2 sensor or MAP sensor
            value = 2.5 + Math.sin(t * 8 * Math.PI) * 1.5 + Math.sin(t * 40 * Math.PI) * 0.3;
            break;
        }

        data.push(value);
      }

      return data;
    };

    const applyMathFunction = (data1: number[], data2: number[]) => {
      if (mathFunction === 'none') return data1;
      
      return data1.map((val, idx) => {
        const val2 = data2[idx] || 0;
        switch (mathFunction) {
          case 'add': return val + val2;
          case 'subtract': return val - val2;
          case 'multiply': return val * val2;
          default: return val;
        }
      });
    };
    const animate = () => {
      if (!isRunning) return;

      if (!persistence) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        // Fade previous traces
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      drawGrid();

      let channel1Data: number[] = [];
      let channel2Data: number[] = [];

      if (channel1) {
        channel1Data = generateCarElectricalData(timeRef.current, 'battery');
        drawWaveform(channel1Data, '#00ff00');
      }

      if (channel2) {
        channel2Data = generateCarElectricalData(timeRef.current, 'alternator');
        drawWaveform(channel2Data, '#ffff00', -20);
      }

      if (channel3) {
        const ignitionData = generateCarElectricalData(timeRef.current, 'ignition');
        drawWaveform(ignitionData, '#ff6600', 40);
      }

      if (channel4) {
        const sensorData = generateCarElectricalData(timeRef.current, 'sensor');
        drawWaveform(sensorData, '#00ffff', 60);
      }

      // Math function display
      if (mathFunction !== 'none' && channel1 && channel2) {
        const mathData = applyMathFunction(channel1Data, channel2Data);
        drawWaveform(mathData, '#ff00ff', 80, 1);
      }

      // Trigger line
      ctx.strokeStyle = '#ff0044';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      const triggerY = canvas.height / 2 - (triggerLevel * voltageScale * 20);
      ctx.moveTo(0, triggerY);
      ctx.lineTo(canvas.width, triggerY);
      ctx.stroke();
      ctx.setLineDash([]);

      drawCursors();

      // Trigger indicator
      if (triggerMode !== 'auto') {
        ctx.fillStyle = triggerMode === 'single' ? '#ff6600' : '#00ff00';
        ctx.fillRect(canvas.width - 20, 10, 10, 10);
        ctx.fillStyle = '#fff';
        ctx.font = '8px monospace';
        ctx.fillText(triggerMode.toUpperCase(), canvas.width - 60, 20);
      }

      timeRef.current += 16; // ~60fps
      animationRef.current = requestAnimationFrame(animate);
    };

    if (isRunning) {
      animate();
    } else {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawGrid();
    }

    // Initial draw
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid();

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, channel1, channel2, channel3, channel4, voltageScale, timeScale, triggerLevel, triggerMode, triggerSlope, displayMode, persistence, mathFunction, cursors, onScreenshot]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 bg-black rounded overflow-hidden relative">
        <div className="absolute top-2 right-2 flex gap-1 z-10">
          <button
            onClick={onScreenshot}
            className="bg-gray-700 hover:bg-gray-600 text-white p-1 rounded text-xs"
            title="Screenshot (Ctrl+S)"
          >
            <Camera size={12} />
          </button>
          <button
            onClick={() => setCursors(prev => ({ ...prev, enabled: !prev.enabled }))}
            className={`p-1 rounded text-xs ${cursors.enabled ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
            title="Toggle Cursors (C)"
          >
            ⊞
          </button>
        </div>
        <canvas
          ref={canvasRef}
          className="block bg-black w-full h-full rounded"
          onClick={(e) => {
            if (cursors.enabled) {
              const canvas = e.currentTarget;
              const rect = canvas.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              const voltageValue = (canvas.height / 2 - y) / (voltageScale * 20);
              const timeValue = (x / canvas.width) * 100;
              
              setCursors(prev => ({
                ...prev,
                voltage1: voltageValue,
                time1: timeValue
              }));
            }
          }}
        />
      </div>
    </div>
  );
};

export default Oscilloscope;