import { useCallback } from 'preact/hooks';
import { Tooltip } from '@blockcode/core';
import styles from './direction-picker.module.css';

import dialIcon from './icons/icon-dial.svg';
import handleIcon from './icons/icon-handle.svg';

const RADIUS = 56;

const createGaugePath = (direction) => {
  const rad = (direction * Math.PI) / 180;
  const endX = RADIUS + RADIUS * Math.sin(rad);
  const endY = RADIUS - RADIUS * Math.cos(rad);
  const largeArc = direction > 180 ? 1 : 0;
  return `M ${RADIUS} 0 A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${endX} ${endY} L ${RADIUS} ${RADIUS} Z`;
};

export function DirectionPicker({ direction, children, onChange }) {
  const directionToMouse = useCallback((target, cx, cy) => {
    const bbox = target.parentElement.getBoundingClientRect();
    const dy = bbox.top + bbox.height / 2;
    const dx = bbox.left + bbox.width / 2;
    const angle = Math.atan2(cy - dy, cx - dx);
    const degrees = angle * (180 / Math.PI);
    return degrees + 90; // To correspond with scratch coordinate system
  }, []);

  const handleDirectionMouseDown = useCallback(
    (e) => {
      e.stopPropagation();
      const target = e.target;
      const mouseMove = (e) => {
        e.preventDefault();
        let newDirection = directionToMouse(target, e.clientX, e.clientY);
        newDirection = ((newDirection % 360) + 360) % 360;
        onChange(newDirection);
      };
      const mouseUp = () => {
        document.removeEventListener('pointermove', mouseMove);
        document.removeEventListener('pointerup', mouseUp);
      };
      document.addEventListener('pointermove', mouseMove);
      document.addEventListener('pointerup', mouseUp);
    },
    [onChange],
  );

  return (
    <Tooltip
      clickable
      placement="top"
      className={styles.pickerTooltip}
      content={
        <div className={styles.dialWrapper}>
          <img
            draggable={false}
            src={dialIcon}
          />
          <svg
            className={styles.dialGauge}
            width={RADIUS * 2}
            height={RADIUS * 2}
          >
            <path
              className={styles.dialGaugePath}
              d={createGaugePath(direction)}
            />
          </svg>
          <img
            draggable={false}
            className={styles.dialHandle}
            src={handleIcon}
            style={{
              top: `${RADIUS - RADIUS * Math.cos(direction * (Math.PI / 180))}px`,
              left: `${RADIUS + RADIUS * Math.sin(direction * (Math.PI / 180))}px`,
              transform: `rotate(${direction}deg)`,
            }}
            onPointerDown={handleDirectionMouseDown}
          />
        </div>
      }
    >
      {children}
    </Tooltip>
  );
}
