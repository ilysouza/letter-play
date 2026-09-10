import React, { useState, useRef, useEffect } from "react";
import { Student } from "@/types";
import { ArrowLeft, Eraser, Trash2, Download } from "lucide-react";

interface Props {
  student: Student;
  onBack: () => void;
}

const COLORS = [
  { name: "Vermelho", hex: "#EF4444" },
  { name: "Laranja", hex: "#F97316" },
  { name: "Amarelo", hex: "#FBBF24" },
  { name: "Verde", hex: "#10B981" },
  { name: "Teal", hex: "#14B8A6" },
  { name: "Azul", hex: "#3B82F6" },
  { name: "Roxo", hex: "#8B5CF6" },
  { name: "Rosa", hex: "#EC4899" },
  { name: "Preto", hex: "#1F2937" },
  { name: "Branco", hex: "#FFFFFF" },
];

const SIZES = [
  { label: "P", size: 5 },
  { label: "M", size: 12 },
  { label: "G", size: 24 },
  { label: "GG", size: 44 },
];

export default function DrawingGame({ student, onBack }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedColor, setSelectedColor] = useState("#EF4444");
  const [selectedSize, setSelectedSize] = useState(12);
  const [isEraser, setIsEraser] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  // Inicialização do Canvas em resolução nativa 1200x900
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.setPointerCapture(e.pointerId);
    setIsDrawing(true);

    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = isEraser ? "#FFFFFF" : selectedColor;
    ctx.lineWidth = selectedSize;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `meu-desenho-letterplay-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-4">
      {/* Topo personalizado para o desenho */}
      <div className="flex items-center justify-between bg-white/95 backdrop-blur-md px-5 py-3.5 rounded-lg shadow-sm border-2 border-slate-100 mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-amber-100 text-slate-800 rounded-lg font-bold text-sm transition-all active:scale-95 border border-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-2xl">🎨</span>
          <h1 className="font-['Fredoka'] text-xl sm:text-2xl font-bold text-slate-900">
            Desenho Livre
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs sm:text-sm font-bold border border-rose-200 active:scale-95 transition-all"
            title="Limpar tela"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Limpar</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs sm:text-sm font-bold shadow-sm active:scale-95 transition-all"
            title="Baixar desenho"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Salvar</span>
          </button>
        </div>
      </div>

      <div className="bg-white/95 rounded-lg p-4 sm:p-6 border border-slate-200 shadow-sm">
        {/* Barra de Ferramentas: Cores e Pincéis */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
          {/* Cores */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {COLORS.map((c) => {
              const isSelected = !isEraser && selectedColor === c.hex;
              return (
                <button
                  key={c.name}
                  onClick={() => {
                    setSelectedColor(c.hex);
                    setIsEraser(false);
                  }}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full transition-all border-2 active:scale-90 ${
                    isSelected ? "ring-4 ring-amber-400 scale-110 border-white shadow-sm" : "border-gray-200"
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            {/* Borracha */}
            <button
              onClick={() => setIsEraser(!isEraser)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 font-bold text-xs sm:text-sm transition-all ${
                isEraser
                  ? "bg-amber-400 border-amber-500 text-amber-950 scale-105 shadow-sm"
                  : "bg-white border-slate-200 text-gray-700 hover:bg-slate-50"
              }`}
            >
              <Eraser className="w-4 h-4" />
              <span>Borracha</span>
            </button>

            {/* Tamanhos de Pincel */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
              {SIZES.map((s) => {
                const isSelected = selectedSize === s.size;
                return (
                  <button
                    key={s.label}
                    onClick={() => setSelectedSize(s.size)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-['Fredoka'] font-bold text-xs flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-teal-500 text-white shadow-xs"
                        : "text-slate-800 hover:bg-amber-100"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Área do Canvas com resolução interna 1200x900 */}
        <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border-2 border-slate-200 shadow-inner bg-white">
          <canvas
            ref={canvasRef}
            width={1200}
            height={900}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className={`w-full h-full block ${isEraser ? "cursor-cell" : "cursor-crosshair"}`}
            style={{ touchAction: "none" }}
          />
        </div>
      </div>
    </div>
  );
}
