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

          return (
            <div key={idx} className={cn("flex items-center", idx < steps.length - 1 && "flex-1")}>
              <div className="flex-none">
                <Step isActive={isActive} index={idx} step={step} />
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
          Anterior
        </Button>
        <Button disabled={!canNext} onClick={handleNext} size="lg" type="button" variant="default">
          {currentStep === steps.length - 1 ? "Crear mi negocio" : "Siguiente"}
        </Button>
      </div>
    </div>
  );
}

function Step({ isActive, index, step }: { isActive: boolean; index: number; step: string }) {
  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-lg font-semibold",
          isActive ? "bg-primary text-background" : "bg-secondary text-foreground",
        )}
      >
        {index + 1}
      </div>
      <div>{step}</div>
    </div>
  );
}
