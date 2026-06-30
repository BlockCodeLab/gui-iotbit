import { useCallback } from 'preact/hooks';
import { classNames } from '@blockcode/utils';
import { Tooltip } from '@blockcode/core';
import styles from './slider-picker.module.css';

export function SliderPicker({ min, max, step, value, children, placement, onChange }) {
  const handleChange = useCallback((e) => {
    onChange?.(e.target.value);
  }, []);

  return (
    <Tooltip
      clickable
      placement={placement ?? 'bottom'}
      className={styles.pickerTooltip}
      content={
        <div className="scratchSliderDiv">
          <input
            type="range"
            className={classNames('scratchFieldSlider', styles.slider)}
            min={min ?? 0}
            max={max ?? 100}
            step={step ?? 1}
            value={value ?? min ?? 0}
            onInput={handleChange}
          />
        </div>
      }
    >
      {children}
    </Tooltip>
  );
}
