import React, { useEffect, useRef } from 'react';

const RadialPulseLoader = ({ 
  size = 120, 
  color = '#000000',
  text = 'Loading...',
  showText = true 
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Set canvas size with device pixel ratio for sharper rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    
    // Scale context for retina displays
    ctx.scale(dpr, dpr);
    
    const centerX = size / 2;
    const centerY = size / 2;
    
    // Pre-calculate ray angles
    const numRays = 7; // Balanced number of rays
    const angles = Array.from({ length: numRays }, (_, i) => (i / numRays) * Math.PI * 2);
    
    const animate = () => {
      ctx.clearRect(0, 0, size, size);
      
      timeRef.current += 0.08; // Balanced speed - not too fast, not too slow
      
      for (let i = 0; i < numRays; i++) {
        const angle = angles[i];
        // Smooth pulse calculation
        const pulse = Math.sin(timeRef.current + i * 0.7) * (size * 0.18) + (size * 0.28);
        
        const x = centerX + Math.cos(angle) * pulse;
        const y = centerY + Math.sin(angle) * pulse;
        
        // Draw ray
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        
        const opacity = 0.4 + Math.sin(timeRef.current + i * 0.7) * 0.3;
        ctx.strokeStyle = `rgba(0, 0, 0, ${opacity})`;
        ctx.lineWidth = 2.2;
        ctx.stroke();
        
        // Draw endpoint
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();
      }
      
      // Draw center dot with subtle glow
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4.5, 0, Math.PI * 2);
      
      // Simple gradient for center
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 8);
      gradient.addColorStop(0, '#000000');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
      ctx.fillStyle = gradient;
      ctx.fill();
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [size]);

  return (
    <div className="radial-pulse-loader">
      <canvas ref={canvasRef}></canvas>
      {showText && <div className="loader-text">{text}</div>}
    </div>
  );
};

export default RadialPulseLoader;