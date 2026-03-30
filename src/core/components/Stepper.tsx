import { Button } from "@core/components/ui/button";

import { Children, useMemo, useState, type ReactNode } from "react";

import { cn } from "@lib/utils";

interface IProps {
  children: ReactNode | ReactNode[];
  steps: string[];
}
export function Stepper({ children, steps }: IProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const memoChildren = useMemo(() => Children.toArray(children), [children]);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
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
      <div>{memoChildren[currentStep]}</div>
      <div className="flex justify-end gap-5">
        <Button onClick={handlePrev} size="lg" variant="outline">
          Anterior
        </Button>
        <Button onClick={handleNext} size="lg">
          Siguiente
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
