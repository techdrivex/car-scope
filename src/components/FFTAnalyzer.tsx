import React, { useEffect, useRef } from 'react';

interface FFTAnalyzerProps {
  isRunning: boolean;
  channel1: boolean;
  channel2: boolean;
  channel3: boolean;
  channel4: boolean;
}

const FFTAnalyzer: React.FC<FFTAnalyzerProps> = ({
  isRunning,
  channel1,
  channel2,
  channel3,
  channel4
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

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
      drawFFT();
    };

    const drawFFT = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = '#003300';
      ctx.lineWidth = 1;
      
      // Vertical lines (frequency)
      for (let x = 0; x <= canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      // Horizontal lines (magnitude)
      for (let y = 0; y <= canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw frequency spectrum for each active channel
      const channels = [
        { active: channel1, color: '#00ff00', channel: 1 },
        { active: channel2, color: '#ffff00', channel: 2 },
        { active: channel3, color: '#ff6600', channel: 3 },
        { active: channel4, color: '#00ffff', channel: 4 }
      ];

      channels.forEach(({ active, color, channel }) => {
        if (!active) return;

        const { magnitudes } = generateFFTData(channel);
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.shadowColor = color;
        ctx.shadowBlur = 4;
        
        ctx.beginPath();
        magnitudes.forEach((magnitude, index) => {
          const x = (index / magnitudes.length) * canvas.width;
          const y = canvas.height - (magnitude / 100) * canvas.height;
          
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // Labels
      ctx.fillStyle = '#00ff00';
      ctx.font = '10px monospace';
      ctx.fillText('0Hz', 5, canvas.height - 5);
      ctx.fillText('2.5kHz', canvas.width / 2 - 20, canvas.height - 5);
      ctx.fillText('5kHz', canvas.width - 30, canvas.height - 5);
      ctx.fillText('0dB', 5, 15);
      ctx.fillText('-40dB', 5, canvas.height / 2);
      ctx.fillText('-80dB', 5, canvas.height - 20);
    };

    const generateFFTData = (channel: number) => {
      const frequencies = [];
      const magnitudes = [];
      
      // Generate frequency spectrum data
      for (let i = 0; i < 100; i++) {
        const freq = i * 50; // 0-5kHz range
        frequencies.push(freq);
        
        let magnitude = 0;
        switch (channel) {
          case 1: // Battery - mostly DC with some low frequency ripple
            magnitude = freq < 100 ? 80 - freq * 0.5 : Math.random() * 10;
            break;
          case 2: // Alternator - strong harmonics at 120Hz, 240Hz, etc.
            if (freq === 120 || freq === 240 || freq === 360) {
              magnitude = 60 - Math.random() * 20;
            } else {
              magnitude = Math.random() * 15;
            }
            break;
          case 3: // Ignition - broad spectrum with peaks
            magnitude = Math.random() * 40 + Math.sin(freq * 0.01) * 20;
            break;
          case 4: // Sensors - specific frequency peaks
            magnitude = freq === 1000 ? 50 : Math.random() * 20;
            break;
          default:
            magnitude = 0;
        }
        
        magnitudes.push(Math.max(0, magnitude));
      }
      
      return { frequencies, magnitudes };
    };

    resizeCanvas();
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas.parentElement!);

    // Initial draw after a short delay to ensure canvas is ready
    const timer = setTimeout(() => {
      drawFFT();
    }, 100);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timer);
    };
  }, [channel1, channel2, channel3, channel4]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const generateFFTData = (channel: number) => {
      const frequencies = [];
      const magnitudes = [];
      
      // Generate frequency spectrum data
      for (let i = 0; i < 100; i++) {
        const freq = i * 50; // 0-5kHz range
        frequencies.push(freq);
        
        let magnitude = 0;
        switch (channel) {
          case 1: // Battery - mostly DC with some low frequency ripple
            magnitude = freq < 100 ? 80 - freq * 0.5 : Math.random() * 10;
            break;
          case 2: // Alternator - strong harmonics at 120Hz, 240Hz, etc.
            if (freq === 120 || freq === 240 || freq === 360) {
              magnitude = 60 - Math.random() * 20;
            } else {
              magnitude = Math.random() * 15;
            }
            break;
          case 3: // Ignition - broad spectrum with peaks
            magnitude = Math.random() * 40 + Math.sin(freq * 0.01) * 20;
            break;
          case 4: // Sensors - specific frequency peaks
            magnitude = freq === 1000 ? 50 : Math.random() * 20;
            break;
          default:
            magnitude = 0;
        }
        
        magnitudes.push(Math.max(0, magnitude));
      }
      
      return { frequencies, magnitudes };
    };

    const drawFFT = () => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = '#003300';
      ctx.lineWidth = 1;
      
      // Vertical lines (frequency)
      for (let x = 0; x <= canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      // Horizontal lines (magnitude)
      for (let y = 0; y <= canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw frequency spectrum for each active channel
      const channels = [
        { active: channel1, color: '#00ff00', channel: 1 },
        { active: channel2, color: '#ffff00', channel: 2 },
        { active: channel3, color: '#ff6600', channel: 3 },
        { active: channel4, color: '#00ffff', channel: 4 }
      ];

      channels.forEach(({ active, color, channel }) => {
        if (!active) return;

        const { magnitudes } = generateFFTData(channel);
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.shadowColor = color;
        ctx.shadowBlur = 4;
        
        ctx.beginPath();
        magnitudes.forEach((magnitude, index) => {
          const x = (index / magnitudes.length) * canvas.width;
          const y = canvas.height - (magnitude / 100) * canvas.height;
          
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // Labels
      ctx.fillStyle = '#00ff00';
      ctx.font = '10px monospace';
      ctx.fillText('0Hz', 5, canvas.height - 5);
      ctx.fillText('2.5kHz', canvas.width / 2 - 20, canvas.height - 5);
      ctx.fillText('5kHz', canvas.width - 30, canvas.height - 5);
      ctx.fillText('0dB', 5, 15);
      ctx.fillText('-40dB', 5, canvas.height / 2);
      ctx.fillText('-80dB', 5, canvas.height - 20);
    };

    const animate = () => {
      if (!isRunning) return;
      
      drawFFT();
      animationRef.current = requestAnimationFrame(animate);
    };

    if (isRunning) {
      animate();
    } else {
      drawFFT();
    }

    // Initial draw
    drawFFT();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, channel1, channel2, channel3, channel4]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 bg-black rounded overflow-hidden relative">
        <canvas
          ref={canvasRef}
          className="block bg-black w-full h-full rounded"
        />
      </div>
    </div>
  );
};

export default FFTAnalyzer;