import React, { useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { X, Move, Maximize2 } from 'lucide-react';

interface WindowPosition {
  x: number;
  y: number;
}

interface WindowSize {
  width: number;
  height: number;
}

interface DraggableWindowProps {
  id: string;
  title: string;
  children: ReactNode;
  defaultPosition?: WindowPosition;
  defaultSize?: WindowSize;
  position?: WindowPosition;
  size?: WindowSize;
  minWidth?: number;
  minHeight?: number;
  onClose?: () => void;
  onPositionChange?: (position: WindowPosition) => void;
  onSizeChange?: (size: WindowSize) => void;
  onFocus?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const DraggableWindow: React.FC<DraggableWindowProps> = ({
  id,
  title,
  children,
  defaultPosition = { x: 50, y: 50 },
  defaultSize = { width: 300, height: 200 },
  position: externalPosition,
  size: externalSize,
  minWidth = 200,
  minHeight = 150,
  onClose,
  onPositionChange,
  onSizeChange,
  onFocus,
  className = '',
  style = {}
}) => {
  const [position, setPosition] = useState<WindowPosition>(() => {
    const pos = externalPosition || defaultPosition;
    return {
      x: isNaN(pos.x) ? defaultPosition.x : pos.x,
      y: isNaN(pos.y) ? defaultPosition.y : pos.y
    };
  });
  const [size, setSize] = useState<WindowSize>(() => {
    const sz = externalSize || defaultSize;
    return {
      width: isNaN(sz.width) ? defaultSize.width : sz.width,
      height: isNaN(sz.height) ? defaultSize.height : sz.height
    };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  // Update position/size when external props change
  useEffect(() => {
    if (externalPosition && !isNaN(externalPosition.x) && !isNaN(externalPosition.y)) {
      setPosition(externalPosition);
    }
  }, [externalPosition]);

  useEffect(() => {
    if (externalSize && !isNaN(externalSize.width) && !isNaN(externalSize.height)) {
      setSize(externalSize);
    }
  }, [externalSize]);

  // Load saved position and size on mount
  useEffect(() => {
    const savedPosition = localStorage.getItem(`window-position-${id}`);
    const savedSize = localStorage.getItem(`window-size-${id}`);
    
    if (savedPosition && !externalPosition) {
      try {
        const parsed = JSON.parse(savedPosition);
        setPosition(parsed);
      } catch (error) {
        console.warn('Failed to load saved window position:', error);
      }
    }
    
    if (savedSize && !externalSize) {
      try {
        const parsed = JSON.parse(savedSize);
        setSize(parsed);
      } catch (error) {
        console.warn('Failed to load saved window size:', error);
      }
    }
  }, [id, externalPosition, externalSize]);

  // Save position and size to localStorage when they change
  useEffect(() => {
    localStorage.setItem(`window-position-${id}`, JSON.stringify(position));
  }, [position, id]);

  useEffect(() => {
    localStorage.setItem(`window-size-${id}`, JSON.stringify(size));
  }, [size, id]);

  const handleMouseDown = (e: React.MouseEvent) => {
    onFocus?.();
    
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.window-header')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Keep window within viewport bounds
      const maxX = window.innerWidth - size.width;
      const maxY = window.innerHeight - size.height;
      
      const clampedX = Math.max(0, Math.min(newX, maxX));
      const clampedY = Math.max(0, Math.min(newY, maxY));
      
      // Ensure we don't set NaN values
      if (!isNaN(clampedX) && !isNaN(clampedY)) {
        setPosition({ x: clampedX, y: clampedY });
      }
    } else if (isResizing) {
      const newWidth = Math.max(minWidth, e.clientX - resizeStart.x);
      const newHeight = Math.max(minHeight, e.clientY - resizeStart.y);
      
      // Keep window within viewport bounds
      const maxWidth = window.innerWidth - position.x;
      const maxHeight = window.innerHeight - position.y;
      
      const clampedWidth = Math.min(newWidth, maxWidth);
      const clampedHeight = Math.min(newHeight, maxHeight);
      
      // Ensure we don't set NaN values
      if (!isNaN(clampedWidth) && !isNaN(clampedHeight)) {
        setSize({ width: clampedWidth, height: clampedHeight });
      }
    }
  }, [isDragging, isResizing, dragStart, resizeStart, position, size, minWidth, minHeight]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onPositionChange?.(position);
    }
    if (isResizing) {
      setIsResizing(false);
      onSizeChange?.(size);
    }
  }, [isDragging, isResizing, position, size, onPositionChange, onSizeChange]);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mouseleave', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('mouseleave', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({ x: e.clientX - size.width, y: e.clientY - size.height });
  };

  const handleResizeToContent = () => {
    const contentElement = windowRef.current?.querySelector('.window-content') as HTMLElement;
    if (contentElement) {
      // Create a temporary container to measure content
      const tempContainer = document.createElement('div');
      tempContainer.style.cssText = `
        position: absolute;
        top: -9999px;
        left: -9999px;
        width: auto;
        height: auto;
        overflow: visible;
        visibility: hidden;
        padding: 8px;
      `;
      
      // Clone the content without size constraints
      const contentClone = contentElement.cloneNode(true) as HTMLElement;
      contentClone.style.cssText = `
        width: auto;
        height: auto;
        overflow: visible;
        position: static;
      `;
      
      // Add to DOM and measure
      tempContainer.appendChild(contentClone);
      document.body.appendChild(tempContainer);
      
      // Force layout calculation
      void tempContainer.offsetHeight;
      
      // Get the natural content size
      const contentRect = contentClone.getBoundingClientRect();
      
      // Clean up
      document.body.removeChild(tempContainer);
      
      // Calculate window size
      const headerHeight = 40;
      const borderWidth = 2;
      const padding = 8;
      
      const newWidth = Math.max(minWidth, contentRect.width + (borderWidth * 2) + (padding * 2));
      const newHeight = Math.max(minHeight, contentRect.height + headerHeight + (borderWidth * 2) + (padding * 2));
      
      // Keep within viewport bounds
      const maxWidth = window.innerWidth - position.x;
      const maxHeight = window.innerHeight - position.y;
      
      const clampedWidth = Math.min(newWidth, maxWidth);
      const clampedHeight = Math.min(newHeight, maxHeight);
      
      setSize({ width: clampedWidth, height: clampedHeight });
      onSizeChange?.({ width: clampedWidth, height: clampedHeight });
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClose) {
      onClose();
    }
  };

  return (
    <div
      ref={windowRef}
      className={`fixed bg-gray-800 border border-gray-600 rounded-lg shadow-2xl backdrop-blur-sm transition-all duration-200 ease-in-out ${className}`}
      style={{
        left: isNaN(position.x) ? 0 : position.x,
        top: isNaN(position.y) ? 0 : position.y,
        width: isNaN(size.width) ? 300 : size.width,
        height: isNaN(size.height) ? 200 : size.height,
        zIndex: isDragging || isResizing ? 1000 : 100,
        ...style
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Window Header */}
      <div className="window-header bg-gradient-to-r from-gray-700 to-gray-600 border-b border-gray-500 rounded-t-lg px-3 py-2 flex items-center justify-between cursor-move select-none">
        <div className="flex items-center gap-2">
          <Move size={12} className="text-gray-300" />
          <span className="text-amber-300 text-xs font-mono font-bold">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleResizeToContent}
            className="text-gray-400 hover:text-blue-400 transition-colors p-1 rounded hover:bg-gray-600"
            title="Resize to Content"
          >
            <Maximize2 size={12} />
          </button>
          {onClose && (
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-red-400 transition-colors p-1 rounded hover:bg-gray-600"
              title="Close Window"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Window Content */}
      <div className="h-full overflow-hidden flex flex-col">
        <div className={`window-content flex-1 overflow-auto ${title.toLowerCase().includes('oscilloscope') || title.toLowerCase().includes('fft') ? 'p-2 pb-4' : 'p-2'}`}>
          {children}
        </div>
      </div>

      {/* Resize Handle */}
      <div
        className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize flex items-end justify-end"
        onMouseDown={handleResizeStart}
      >
        <div className="w-0 h-0 border-l-6 border-l-transparent border-t-6 border-t-gray-500" />
      </div>
    </div>
  );
};

export default DraggableWindow; 