import { ArrowLeft } from "lucide-react";

import { Button } from "@components/ui/button";

import { useNavigate } from "react-router";

export function BackButton() {
  const navigate = useNavigate();

  return (
    <Button className="" onClick={() => navigate(-1)} variant="secondary">
      <ArrowLeft className="size-4" />
      Atrás
    </Button>
  );
}
