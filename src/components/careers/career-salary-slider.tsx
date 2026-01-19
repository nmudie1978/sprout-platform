"use client";

import { Slider } from "@/components/ui/slider";
import type { SalaryRange } from "@/lib/career-filters/types";
import { formatSalary } from "@/lib/career-filters/utils";

interface CareerSalarySliderProps {
  bounds: SalaryRange;
  value: SalaryRange | null;
  onChange: (range: SalaryRange | null) => void;
}

export function CareerSalarySlider({
  bounds,
  value,
  onChange,
}: CareerSalarySliderProps) {
  const currentMin = value?.min ?? bounds.min;
  const currentMax = value?.max ?? bounds.max;
  const isActive = value !== null;

  const handleChange = (values: number[]) => {
    const [min, max] = values;
    // Only set as active if range differs from bounds
    if (min === bounds.min && max === bounds.max) {
      onChange(null);
    } else {
      onChange({ min, max });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">Salary Range</span>
        {isActive && (
          <span className="text-[10px] text-primary font-medium">
            {formatSalary(currentMin)} - {formatSalary(currentMax)} kr/year
          </span>
        )}
      </div>

      <div className="px-1">
        <Slider
          value={[currentMin, currentMax]}
          min={bounds.min}
          max={bounds.max}
          step={25}
          onValueChange={handleChange}
          className="cursor-pointer"
        />
      </div>

      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{formatSalary(bounds.min)}</span>
        <span>{formatSalary(bounds.max)}</span>
      </div>
    </div>
  );
}
