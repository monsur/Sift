import * as React from 'react';
import { cn } from '@lib/utils';
import { Textarea } from './textarea';

interface ScoreSliderProps {
  value: number;
  onChange: (value: number) => void;
  justification?: string;
  onJustificationChange?: (value: string) => void;
  className?: string;
}

const scoreGuide = [
  { score: '10', description: 'Exceptional: One of your best days' },
  { score: '8-9', description: 'Great: Felt good, things went well' },
  { score: '6-7', description: 'Good: Solid day, mostly positive' },
  { score: '5', description: 'Neutral: Neither good nor bad' },
  { score: '3-4', description: 'Challenging: Struggled but managed' },
  { score: '1-2', description: 'Very difficult: One of your harder days' },
];

function ScoreSlider({
  value,
  onChange,
  justification,
  onJustificationChange,
  className,
}: ScoreSliderProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <div className="flex justify-between mb-3 text-sm text-[var(--color-muted-foreground)]">
          <span>1 - Very difficult</span>
          <span>10 - Exceptional</span>
        </div>
        <div className="relative">
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[var(--color-primary)]"
            style={{
              background:
                'linear-gradient(to right, #f87171, #fbbf24, #4ade80)',
            }}
          />
        </div>
        <div className="text-center mt-4">
          <span className="text-5xl font-light text-[var(--color-primary)]">
            {value}
          </span>
        </div>
      </div>

      <div className="bg-[var(--color-muted)] p-5 rounded-md">
        <h4 className="text-sm font-medium mb-3">Score Guide</h4>
        {scoreGuide.map((item) => (
          <div
            key={item.score}
            className="flex justify-between py-1.5 text-sm text-[var(--color-muted-foreground)]"
          >
            <span className="font-medium text-[var(--color-primary)]">
              {item.score}
            </span>
            <span>{item.description}</span>
          </div>
        ))}
      </div>

      {onJustificationChange && (
        <div>
          <label className="block text-sm mb-2">
            Add a note about your score (optional)
          </label>
          <Textarea
            value={justification ?? ''}
            onChange={(e) => onJustificationChange(e.target.value)}
            placeholder="Why did you adjust the score, or any additional context..."
            className="min-h-[80px]"
          />
        </div>
      )}
    </div>
  );
}

export { ScoreSlider };
export type { ScoreSliderProps };
