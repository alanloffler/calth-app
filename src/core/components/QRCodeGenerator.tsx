import { Download, Share2 } from "lucide-react";

import { Button } from "@core/components/ui/button";
import { ShareModal } from "@business/components/ShareModal";

import QRCode from "qrcode";
import { useCallback, useEffect, useRef, useState } from "react";

interface IProps {
  value: string;
}

const QR_SIZE = 230;
const PADDING = 20;
const MARGIN = 2;

async function drawQRCode(canvas: HTMLCanvasElement, value: string, tempCanvas: HTMLCanvasElement): Promise<void> {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = QR_SIZE;
  canvas.height = QR_SIZE + PADDING;

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await QRCode.toCanvas(tempCanvas, value, {
    width: QR_SIZE,
    margin: MARGIN,
  });

  ctx.drawImage(tempCanvas, 0, PADDING);

  ctx.fillStyle = "#000";
  ctx.font = "12px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(value, canvas.width / 2, 16);
}

export function QRCodeGenerator({ value }: IProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!tempCanvasRef.current) {
      tempCanvasRef.current = document.createElement("canvas");
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const tempCanvas = tempCanvasRef.current;

    if (!canvas || !tempCanvas) return;

    drawQRCode(canvas, value, tempCanvas).catch((err: Error) => console.error("QR generation failed:", err));
  }, [value]);

  const handleDownload = useCallback(() => {
    if (!canvasRef.current) return;

    const business = new URL(value).hostname.split(".")[0];
    const url = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");

    link.href = url;
    link.download = business.length > 0 ? `qr-code-${business}.png` : "qr-code.png";
    link.click();
  }, [value]);

  const handleOpenShare = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const base64 = canvas.toDataURL("image/png");
    setQrBase64(base64);
    setOpen(true);
  }, []);

  return (
    <>
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="bg-accent flex h-fit w-fit items-center justify-center rounded-lg p-4">
          <canvas ref={canvasRef} />
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleDownload} size="sm" variant="outline">
            <Download />
            Descargar
          </Button>
          <Button onClick={handleOpenShare} size="sm" variant="outline">
            <Share2 />
            Compartir
          </Button>
        </div>
      </div>
      <ShareModal image={qrBase64} open={open} setOpen={setOpen} />
    </>
  );
}
