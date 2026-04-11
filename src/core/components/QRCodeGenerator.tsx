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

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const qrSize = 300;
    const padding = 20;

    canvas.width = qrSize;
    canvas.height = qrSize + padding;

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const tempCanvas = document.createElement("canvas");

    QRCode.toCanvas(tempCanvas, value, {
      width: qrSize,
      margin: 2,
    })
      .then(() => {
        ctx.drawImage(tempCanvas, 0, padding);
        ctx.fillStyle = "#000";
        ctx.font = "12px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(value, canvas.width / 2, 20);
      })
      .catch((err: Error) => {
        console.error("QR generation failed:", err);
      });
  }, [value]);

  function handleDownload() {
    if (!canvasRef.current) return;

    const url = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = "qr-code.png";
    link.click();
  }

  // TODO: helper png generation, then share with email and whatsapp

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="bg-accent flex h-fit w-fit items-center justify-center rounded-lg p-4">
        <canvas ref={canvasRef} />
      </div>
      <Button onClick={handleDownload} size="sm" variant="outline">
        <Download />
        Descargar
      </Button>
    </div>
  );
}
