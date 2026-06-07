import React, { useEffect, useRef, useState } from "react";

export default function SketchDrawer({ slug, isOpen, setIsOpen, hideButton }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = typeof isOpen === "boolean" ? isOpen : internalOpen;
  const setOpenState = (v) => {
    if (typeof setIsOpen === "function") setIsOpen(v);
    else setInternalOpen(v);
  };
  const [color, setColor] = useState("#222222");
  const [lineWidth, setLineWidth] = useState(3);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawing = useRef(false);

  const storageKey = `sketch:${slug || "global"}`;

  // Set up canvas with non-passive event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !open) return;
    
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctxRef.current = ctx;

    // load saved drawing
    const data = localStorage.getItem(storageKey);
    if (data) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = data;
    }

    // Add non-passive event listeners to prevent the error
    const handleTouchStart = (e) => {
      e.preventDefault();
      pointerDown(e);
    };
    
    const handleTouchMove = (e) => {
      e.preventDefault();
      pointerMove(e);
    };
    
    const handleTouchEnd = (e) => {
      e.preventDefault();
      pointerUp(e);
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [open, slug, color, lineWidth]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      // Save current drawing
      const oldCanvas = document.createElement('canvas');
      oldCanvas.width = canvas.width;
      oldCanvas.height = canvas.height;
      const oldCtx = oldCanvas.getContext('2d');
      oldCtx.drawImage(canvas, 0, 0);
      
      // Resize canvas
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      const ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctxRef.current = ctx;
      
      // Restore drawing
      ctx.drawImage(oldCanvas, 0, 0, rect.width, rect.height);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [color, lineWidth]);

  function pointerDown(e) {
    drawing.current = true;
    const ctx = ctxRef.current;
    if (!ctx) return;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    
    const { offsetX, offsetY } = getXY(e);
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    ctx.stroke();
  }

  function pointerMove(e) {
    if (!drawing.current) return;
    const ctx = ctxRef.current;
    if (!ctx) return;
    
    const { offsetX, offsetY } = getXY(e);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  }

  function pointerUp(e) {
    if (!drawing.current) return;
    drawing.current = false;
    save();
  }

  function getXY(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    
    // Handle both touch and mouse events
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    let offsetX = clientX - rect.left;
    let offsetY = clientY - rect.top;
    
    offsetX = Math.max(0, Math.min(offsetX, rect.width));
    offsetY = Math.max(0, Math.min(offsetY, rect.height));
    
    return { offsetX, offsetY };
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    localStorage.removeItem(storageKey);
  }

  function save() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const data = canvas.toDataURL();
    localStorage.setItem(storageKey, data);
  }

  return (
    <React.Fragment>
      {!hideButton && (
        <button
          className="fixed right-4 bottom-6 z-50 sketch-btn !p-3"
          aria-label="Open sketch drawer"
          onClick={() => setOpenState(true)}
        >
          ✎
        </button>
      )}

      {open && (
        <>
          {/* Backdrop - greyed out but doesn't block scroll */}
          <div 
            className="fixed inset-0 bg-black/70"
            style={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 50,
              pointerEvents: 'none'
            }}
            onClick={() => setOpenState(false)} 
          />
          
          {/* Modal Container */}
          <div 
            className="sketch-modal-container"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 51,
              overflowY: 'auto',
              padding: '1rem',
              pointerEvents: 'none'
            }}
          >
            {/* Modal Content */}
            <div 
              className="relative w-full max-w-3xl mx-auto bg-white sketch-card"
              style={{
                pointerEvents: 'auto',
                marginTop: '2rem',
                marginBottom: '2rem'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 flex items-center justify-between border-b-2 border-gray-200">
                <div className="flex items-center gap-3">
                  <strong style={{ fontFamily: "Patrick Hand, cursive" }}>Sketch</strong>
                  <span className="text-sm text-gray-500">Notes for this post</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="sketch-btn !p-2" onClick={() => { save(); setOpenState(false); }} aria-label="Save and close">Save</button>
                  <button className="sketch-btn !p-2" onClick={() => setOpenState(false)} aria-label="Close">Close</button>
                </div>
              </div>

              <div className="p-3">
                {/* Responsive color and width controls */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                  {/* Color buttons */}
                  <div className="flex items-center gap-2">
                    {["#222222", "#d63447", "#e6a23c", "#2b8a3e", "#2563eb"].map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`w-8 h-8 rounded-full border-2 ${color === c ? "ring-2 ring-offset-1" : ""}`}
                        style={{ background: c }}
                        aria-label={`Color ${c}`}
                      />
                    ))}
                  </div>

                  {/* Width slider - moves below on small screens */}
                  <div className="flex items-center gap-2 sm:ml-auto">
                    <label className="text-sm whitespace-nowrap">Width: {lineWidth}px</label>
                    <input 
                      type="range" 
                      min="1" 
                      max="12" 
                      value={lineWidth} 
                      onChange={(e) => setLineWidth(Number(e.target.value))}
                      className="flex-1 min-w-[120px]"
                      style={{ width: 'auto' }}
                    />
                  </div>
                </div>

                {/* Canvas area */}
                <div className="sketch-card p-2" style={{ marginBottom: '0.75rem' }}>
                  <canvas
                    ref={canvasRef}
                    onPointerDown={pointerDown}
                    onPointerMove={pointerMove}
                    onPointerUp={pointerUp}
                    style={{ 
                      width: "100%", 
                      height: "auto",
                      minHeight: "400px",
                      touchAction: "none", 
                      background: "white",
                      cursor: "crosshair",
                      display: "block"
                    }}
                  />
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <button className="sketch-btn" onClick={clear}>Clear</button>
                  <button
                    className="sketch-btn"
                    onClick={() => {
                      const canvas = canvasRef.current;
                      if (!canvas) return;
                      const link = document.createElement("a");
                      link.href = canvas.toDataURL();
                      link.download = `${slug || "sketch"}.png`;
                      link.click();
                    }}
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </React.Fragment>
  );
}