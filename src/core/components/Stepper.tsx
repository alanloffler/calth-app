import { ChevronLeft, ChevronRight, Store } from "lucide-react";

import { Button } from "@core/components/ui/button";

import { Children, cloneElement, useCallback, useMemo, useState, type ReactElement, type ReactNode } from "react";

import { cn } from "@lib/utils";

interface IProps {
  className?: string;
  children: ReactNode | ReactNode[];
  onFinish: () => void;
  steps: string[];
}

export function Stepper({ className, children, onFinish, steps }: IProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [canNext, setCanNext] = useState<boolean>(false);

  const memoChildren = useMemo(() => Children.toArray(children), [children]);

  const lastStep = currentStep === steps.length - 1;

  const handleStepComplete = useCallback(() => {
    if (lastStep) {
      onFinish();
    } else {
      setCurrentStep((prev) => prev + 1);
      setCanNext(false);
    }
  }, [lastStep, onFinish]);

  const allStepContent = useMemo(() => {
    return memoChildren.map((child, idx) => {
      const isActive = idx === currentStep;
      const element = child as ReactElement<{
        setIsValid: (valid: boolean) => void;
        formId: string;
        onStepComplete: () => void;
      }>;
      const cloned = isActive
        ? cloneElement(element, {
            setIsValid: (valid: boolean) => setCanNext(valid),
            formId: "stepper-step-form",
            onStepComplete: handleStepComplete,
          })
        : element;
      return (
        <div key={idx} className={isActive ? undefined : "hidden"}>
          {cloned}
        </div>
      );
    });
  }, [memoChildren, currentStep, handleStepComplete]);

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setCanNext(true);
    }
  };

  return (
    <div className={cn("flex w-full flex-col gap-5", className)}>
      <div className="flex w-full items-center">
        {steps.map((step, idx) => {
          const isActive = idx <= currentStep;
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div key={idx} className={cn("flex items-center", idx < steps.length - 1 && "flex-1")}>
              <div className="flex-none">
                <Step
                  isActive={isActive}
                  isCurrent={isCurrent}
                  index={idx}
                  step={step}
                  onClick={() => isCompleted && setCurrentStep(idx)}
                />
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
      <div className="block text-lg font-semibold md:hidden">{steps[currentStep]}</div>
      <div className="py-10">{allStepContent}</div>
      <div className="flex justify-end gap-5">
        <Button disabled={currentStep === 0} onClick={handlePrev} size="lg" type="button" variant="outline">
          <ChevronLeft className="h-5 w-5" />
          Anterior
        </Button>
        <Button disabled={!canNext} form="stepper-step-form" size="lg" type="submit" variant="default">
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
  onClick,
}: {
  isActive: boolean;
  isCurrent: boolean;
  index: number;
  step: string;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full text-lg font-semibold hover:cursor-pointer",
          isActive ? "bg-primary/60 text-background" : "bg-secondary text-foreground",
          isCurrent ? "bg-primary text-background h-10 w-10" : "h-9 w-9",
        )}
        onClick={onClick}
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
      <div className="hidden md:block">{step}</div>
    </div>
  );
}
