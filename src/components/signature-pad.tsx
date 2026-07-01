"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";

export interface SignaturePadHandle {
  toBlob: () => Promise<Blob | null>;
  clear: () => void;
  isEmpty: () => boolean;
}

// Real touch/pointer signature capture on a <canvas>. Exposes toBlob (PNG),
// clear, and isEmpty via ref — no typed/cursive placeholder.
export const SignaturePad = forwardRef<
  SignaturePadHandle,
  { label: string; clearLabel: string }
>(function SignaturePad({ label, clearLabel }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  function ctx() {
    return canvasRef.current?.getContext("2d") ?? null;
  }

  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * c.width) / rect.width,
      y: ((e.clientY - rect.top) * c.height) / rect.height,
    };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault();
    const g = ctx();
    if (!g) return;
    drawing.current = true;
    g.lineWidth = 2.2;
    g.lineCap = "round";
    g.lineJoin = "round";
    g.strokeStyle = "#29251d";
    const { x, y } = point(e);
    g.beginPath();
    g.moveTo(x, y);
    canvasRef.current?.setPointerCapture(e.pointerId);
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    e.preventDefault();
    const g = ctx();
    if (!g) return;
    const { x, y } = point(e);
    g.lineTo(x, y);
    g.stroke();
    if (!hasDrawn) setHasDrawn(true);
  }

  function end() {
    drawing.current = false;
  }

  function clear() {
    const c = canvasRef.current;
    if (!c) return;
    c.getContext("2d")?.clearRect(0, 0, c.width, c.height);
    setHasDrawn(false);
  }

  useImperativeHandle(ref, () => ({
    toBlob: () =>
      new Promise((resolve) => {
        const c = canvasRef.current;
        if (!c) return resolve(null);
        c.toBlob((b) => resolve(b), "image/png");
      }),
    clear,
    isEmpty: () => !hasDrawn,
  }));

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-body">{label}</span>
        <button
          type="button"
          onClick={clear}
          className="text-xs text-olive hover:underline"
        >
          {clearLabel}
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={220}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        onPointerCancel={end}
        className="w-full touch-none rounded-input border border-hairline bg-card"
        style={{ aspectRatio: "600 / 220" }}
      />
    </div>
  );
});
