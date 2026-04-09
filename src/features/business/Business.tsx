import { BusinessCard } from "@business/components/BusinessCard";
import { Card } from "@components/ui/card";
import { ContactCard } from "@business/components/ContactCard";
import { PageHeader } from "@components/pages/PageHeader";
import { PatientsCard } from "@business/components/PatientsCard";

import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";

import type { IBusiness } from "@business/interfaces/business.interface";
import { BusinessService } from "@business/services/business.service";
import { cn } from "@core/lib/utils";
import { useAuthStore } from "@auth/stores/auth.store";
import { useSidebar } from "@components/ui/sidebar";
import { useTryCatch } from "@core/hooks/useTryCatch";

export default function Business() {
  const [business, setBusiness] = useState<IBusiness | undefined>(undefined);
  const { open: sidebarIsOpen } = useSidebar();
  const { tryCatch: tryCatchBusiness } = useTryCatch();
  const admin = useAuthStore.getState().admin;

  const fetchBusiness = useCallback(async () => {
    if (!admin) return;
    const [response, error] = await tryCatchBusiness(BusinessService.findOne(admin?.businessId));

    if (error) {
      toast.error(error.message);
      return;
    }

    if (response && response.statusCode === 200 && response.data) {
      setBusiness(response.data);
    }
  }, [tryCatchBusiness]);

  useEffect(() => {
    fetchBusiness();
  }, [fetchBusiness]);

  if (!business) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Tu negocio" subtitle="Toda la información de tu negocio" />
      <div className={cn("grid grid-cols-1 gap-8", sidebarIsOpen ? "md:grid-cols-1 lg:grid-cols-8" : "md:grid-cols-8")}>
        <BusinessCard
          className={cn("col-span-1", sidebarIsOpen ? "md:col-span-1 lg:col-span-4" : "md:col-span-4")}
          business={business}
        />
        <ContactCard
          className={cn("col-span-1", sidebarIsOpen ? "md:col-span-1 lg:col-span-4" : "md:col-span-4")}
          business={business}
        />
        <Card className={cn("col-span-1", sidebarIsOpen ? "md:col-span-1 lg:col-span-3" : "md:col-span-3")}>
          <span className="px-6">Card 3</span>
        </Card>
        {business.users?.length > 0 && (
          <PatientsCard
            className={cn("col-span-1", sidebarIsOpen ? "md:col-span-1 lg:col-span-5" : "md:col-span-5")}
            patients={business.users}
          />
        )}
      </div>
    </div>
  );
}
