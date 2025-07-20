import React, { useState, useEffect } from 'react';
import DraggableWindow from './DraggableWindow';
import { Save, Upload, Grid3X3, LayoutGrid } from 'lucide-react';

interface WindowConfig {
  id: string;
  title: string;
  component: React.ReactNode;
  defaultPosition: { x: number; y: number };
  defaultSize: { width: number; height: number };
  isVisible: boolean;
}

interface WindowManagerProps {
  windows: WindowConfig[];
  onWindowClose?: (windowId: string) => void;
  onWindowPositionChange?: (windowId: string, position: { x: number; y: number }) => void;
}

const WindowManager: React.FC<WindowManagerProps> = ({
  windows,
  onWindowClose,
  onWindowPositionChange
}) => {
  const [windowStates, setWindowStates] = useState<Record<string, { x: number; y: number; width: number; height: number }>>({});
  const [focusedWindow, setFocusedWindow] = useState<string | null>(null);

  // Calculate responsive window positions based on screen size
  const getResponsivePosition = (defaultPos: { x: number; y: number }, defaultSize: { width: number; height: number }) => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Scale positions and sizes based on screen size
    const scaleX = Math.min(screenWidth / 1200, 1);
    const scaleY = Math.min(screenHeight / 800, 1);
    const scale = Math.min(scaleX, scaleY);
    
    return {
      x: Math.max(10, Math.min(defaultPos.x * scale, screenWidth - defaultSize.width * scale - 20)),
      y: Math.max(80, Math.min(defaultPos.y * scale, screenHeight - defaultSize.height * scale - 100)),
      width: Math.min(defaultSize.width * scale, screenWidth - 40),
      height: Math.min(defaultSize.height * scale, screenHeight - 140)
    };
  };

  // Load all window positions on mount
  useEffect(() => {
    const savedStates = localStorage.getItem('window-manager-states');
    if (savedStates) {
      try {
        const parsed = JSON.parse(savedStates);
        setWindowStates(parsed);
      } catch (error) {
        console.warn('Failed to load saved window states:', error);
      }
    }
  }, []);

  // Save all window states when they change
  useEffect(() => {
    localStorage.setItem('window-manager-states', JSON.stringify(windowStates));
  }, [windowStates]);

  // Listen for grid arrangement event
  useEffect(() => {
    const handleGridEvent = () => {
      arrangeWindowsGrid();
    };

    window.addEventListener('arrange-grid', handleGridEvent);
    return () => {
      window.removeEventListener('arrange-grid', handleGridEvent);
    };
  }, []);

  const handlePositionChange = (windowId: string, position: { x: number; y: number }) => {
    setWindowStates(prev => ({
      ...prev,
      [windowId]: {
        ...prev[windowId],
        ...position
      }
    }));
    onWindowPositionChange?.(windowId, position);
  };

  const handleSizeChange = (windowId: string, size: { width: number; height: number }) => {
    setWindowStates(prev => ({
      ...prev,
      [windowId]: {
        ...prev[windowId],
        ...size
      }
    }));
  };

  const handleWindowFocus = (windowId: string) => {
    setFocusedWindow(windowId);
  };

  const saveAllPositions = () => {
    const timestamp = new Date().toISOString();
    const data = {
      timestamp,
      states: windowStates
    };
    localStorage.setItem(`window-layout-${timestamp}`, JSON.stringify(data));
    
    // Keep only the last 5 saved layouts
    const keys = Object.keys(localStorage).filter(key => key.startsWith('window-layout-'));
    if (keys.length > 5) {
      keys.sort().slice(0, -5).forEach(key => localStorage.removeItem(key));
    }
  };

  const loadAllPositions = () => {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('window-layout-'));
    if (keys.length > 0) {
      const latestKey = keys.sort().pop();
      if (latestKey) {
        const savedData = localStorage.getItem(latestKey);
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            setWindowStates(parsed.states);
          } catch (error) {
            console.warn('Failed to load saved layout:', error);
          }
        }
      }
    }
  };

  const resetAllPositions = () => {
    setWindowStates({});
    // Clear all saved positions and sizes
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('window-position-') || key.startsWith('window-size-') || key.startsWith('window-layout-') || key === 'window-manager-states') {
        localStorage.removeItem(key);
      }
    });
  };

  const arrangeWindowsGrid = () => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const padding = 20;
    const headerHeight = 80;
    const footerHeight = 40;
    
    // Calculate grid layout
    const visibleWindows = windows.filter(w => w.isVisible);
    const totalWindows = visibleWindows.length;
    
    // Determine optimal grid layout
    let cols = Math.ceil(Math.sqrt(totalWindows));
    let rows = Math.ceil(totalWindows / cols);
    
    // Adjust for better fit
    if (totalWindows === 6) {
      cols = 3;
      rows = 2;
    } else if (totalWindows === 4) {
      cols = 2;
      rows = 2;
    } else if (totalWindows === 3) {
      cols = 3;
      rows = 1;
    }
    
    const availableWidth = screenWidth - (padding * (cols + 1));
    const availableHeight = screenHeight - headerHeight - footerHeight - (padding * (rows + 1));
    
    const cellWidth = Math.max(250, availableWidth / cols);
    const cellHeight = Math.max(200, availableHeight / rows);
    
    const newStates: Record<string, { x: number; y: number; width: number; height: number }> = {};
    
    visibleWindows.forEach((window, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      newStates[window.id] = {
        x: padding + col * (cellWidth + padding),
        y: headerHeight + padding + row * (cellHeight + padding),
        width: cellWidth,
        height: cellHeight
      };
    });
    
    setWindowStates(newStates);
  };

  return (
    <>
      {/* Window Management Controls */}
      <div className="fixed bottom-2 right-2 z-[9999] flex gap-1">
        <button
          onClick={saveAllPositions}
          className="bg-blue-900 hover:bg-blue-800 border border-blue-600 text-blue-200 px-2 py-1 rounded text-xs font-mono flex items-center gap-1 transition-colors shadow-lg"
          title="Save Layout"
        >
          <Save size={10} />
          SAVE
        </button>
        
        <button
          onClick={loadAllPositions}
          className="bg-green-900 hover:bg-green-800 border border-green-600 text-green-200 px-2 py-1 rounded text-xs font-mono flex items-center gap-1 transition-colors shadow-lg"
          title="Load Layout"
        >
          <Upload size={10} />
          LOAD
        </button>
        
        <button
          onClick={resetAllPositions}
          className="bg-red-900 hover:bg-red-800 border border-red-600 text-red-200 px-2 py-1 rounded text-xs font-mono flex items-center gap-1 transition-colors shadow-lg"
          title="Reset Layout"
        >
          <Grid3X3 size={10} />
          RESET
        </button>
        
        <button
          onClick={arrangeWindowsGrid}
          className="bg-purple-900 hover:bg-purple-800 border border-purple-600 text-purple-200 px-2 py-1 rounded text-xs font-mono flex items-center gap-1 transition-colors shadow-lg"
          title="Arrange in Grid"
        >
          <LayoutGrid size={10} />
          GRID
        </button>
      </div>

      {/* Render Windows */}
      {windows.map(window => {
        if (!window.isVisible) return null;

        const savedState = windowStates[window.id];
        const responsivePos = getResponsivePosition(window.defaultPosition, window.defaultSize);
        
        // Ensure we have valid position and size values
        const position = savedState && !isNaN(savedState.x) && !isNaN(savedState.y) 
          ? { x: savedState.x, y: savedState.y } 
          : { x: responsivePos.x, y: responsivePos.y };
        
        const size = savedState && !isNaN(savedState.width) && !isNaN(savedState.height)
          ? { width: savedState.width, height: savedState.height }
          : responsivePos;

        return (
          <DraggableWindow
            key={window.id}
            id={window.id}
            title={window.title}
            defaultPosition={position}
            defaultSize={size}
            position={savedState && !isNaN(savedState.x) && !isNaN(savedState.y) ? position : undefined}
            size={savedState && !isNaN(savedState.width) && !isNaN(savedState.height) ? size : undefined}
            minWidth={Math.min(200, responsivePos.width)}
            minHeight={Math.min(150, responsivePos.height)}
            onClose={() => onWindowClose?.(window.id)}
            onPositionChange={(pos) => handlePositionChange(window.id, pos)}
            onSizeChange={(size) => handleSizeChange(window.id, size)}
            onFocus={() => handleWindowFocus(window.id)}
            className=""
            style={{
              zIndex: focusedWindow === window.id ? 1000 : 100
            }}
          >
            {window.component}
          </DraggableWindow>
        );
      })}
    </>
  );
};

export default WindowManager; 