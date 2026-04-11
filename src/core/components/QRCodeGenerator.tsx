import { Download } from "lucide-react";

import { Button } from "@core/components/ui/button";

import QRCode from "qrcode";
import { useEffect, useRef } from "react";

interface IProps {
  value: string;
}

export function QRCodeGenerator({ value }: IProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    QRCode.toCanvas(canvasRef.current, value, {
      width: 200,
      margin: 2,
    }).catch((err: Error) => {
      console.error("QR generation failed:", err);
    });
  }, [value]);

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="bg-accent flex h-fit w-fit items-center justify-center rounded-lg p-4">
        <canvas ref={canvasRef} />
      </div>
      <Button size="sm" variant="outline">
        <Download />
        Descargar
      </Button>
    </div>
  );
}
