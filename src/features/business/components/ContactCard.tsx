import { Card, CardContent } from "@components/ui/card";
import { QRCodeGenerator } from "@components/QRCodeGenerator";

import type { IBusiness } from "@business/interfaces/business.interface";
import { formatPhone } from "@core/formatters/phone.formatter";

interface IProps {
  business: IBusiness;
  className?: string;
}

export function ContactCard({ business, className }: IProps) {
  return (
    <Card className={className}>
      <CardContent className="flex flex-1 flex-col gap-4">
        <h1 className="text-lg font-semibold">Contacto</h1>
        <div className="flex flex-col gap-4 xl:flex-row">
          <ul className="flex flex-1 flex-col gap-1">
            <li className="flex justify-start gap-3">
              <h3 className="font-medium">Email:</h3>
              <span>{business.email}</span>
            </li>
            <li className="flex justify-start gap-3">
              <h3 className="font-medium">Teléfono:</h3>
              <span>{formatPhone(business.phoneNumber)}</span>
            </li>
            {business.whatsAppNumber && (
              <li className="flex justify-start gap-3">
                <h3 className="font-medium">WhatsApp:</h3>
                <span>{formatPhone(business.whatsAppNumber)}</span>
              </li>
            )}
            {business.website && (
              <li className="flex justify-start gap-3">
                <h3 className="font-medium">Página web:</h3>
                <span>{business.website}</span>
              </li>
            )}
          </ul>
          <QRCodeGenerator value="https://centro.calth.app" />
        </div>
      </CardContent>
    </Card>
  );
}
