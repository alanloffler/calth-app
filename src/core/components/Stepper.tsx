import { ChevronLeft, ChevronRight, Store } from "lucide-react";

import { Button } from "@core/components/ui/button";

import { Children, cloneElement, useMemo, useState, type ReactElement, type ReactNode } from "react";

import { cn } from "@lib/utils";

interface IProps {
  children: ReactNode | ReactNode[];
  onFinish: () => void;
  steps: string[];
}

export function Stepper({ children, onFinish, steps }: IProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [canNext, setCanNext] = useState<boolean>(false);

  const memoChildren = useMemo(() => Children.toArray(children), [children]);

  const activeStepContent = useMemo(() => {
    const currentChild = memoChildren[currentStep] as ReactElement<{ setIsValid: (valid: boolean) => void }>;
    return cloneElement(currentChild, {
      setIsValid: (valid: boolean) => setCanNext(valid),
    });
  }, [memoChildren, currentStep]);

  const lastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (lastStep) {
      onFinish();
    } else if (canNext) {
      setCurrentStep((prev) => prev + 1);
      setCanNext(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setCanNext(true);
    }
  };

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex w-full items-center">
        {steps.map((step, idx) => {
          const isActive = idx <= currentStep;
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div key={idx} className={cn("flex items-center", idx < steps.length - 1 && "flex-1")}>
              <div className="flex-none">
                <Step isActive={isActive} isCurrent={isCurrent} index={idx} step={step} />
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={cn("mx-4 h-0.5 flex-1 transition-colors", isCompleted ? "bg-blue-500" : "bg-secondary")}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="py-10">{activeStepContent}</div>
      <div className="flex justify-end gap-5">
        <Button disabled={currentStep === 0} onClick={handlePrev} size="lg" type="button" variant="outline">
          <ChevronLeft className="h-5 w-5" />
          Anterior
        </Button>
        <Button disabled={!canNext} onClick={handleNext} size="lg" type="button" variant="default">
          {currentStep === steps.length - 1 ? (
            <>
              <Store className="h-5 w-5" />
              Crear mi negocio
            </>
          ) : (
            <>
              Siguiente
              <ChevronRight className="h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function Step({
  isActive,
  isCurrent,
  index,
  step,
}: {
  isActive: boolean;
  isCurrent: boolean;
  index: number;
  step: string;
}) {
  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full text-lg font-semibold",
          isActive ? "bg-primary/60 text-background" : "bg-secondary text-foreground",
          isCurrent ? "bg-primary text-background h-10 w-10" : "h-9 w-9",
        )}
      >
        {isCurrent && (
          <div
            className={cn(
              "border-background absolute top-1/2 left-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-2",
              isCurrent ? "bg-primary" : undefined,
            )}
          ></div>
        )}
        <span className="z-10">{index + 1}</span>
      </div>
      <div>{step}</div>
    </div>
  );
}
