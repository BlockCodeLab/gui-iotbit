import { useCallback, useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { classNames } from '@blockcode/utils';
import { useAppContext, setAppState } from '@blockcode/core';
import { StageConfig } from '../emulator/emulator-config';

import { Stage } from '../stage/stage';
import styles from './sidedock.module.css';

export function Sidedock() {
  const { appState } = useAppContext();

  const runtime = useSignal(null);

  useEffect(() => {
    setAppState({
      stageSize: window.innerWidth < 1200 ? StageConfig.Small : StageConfig.Large,
    });
  }, []);

  return (
    <div className={styles.sidedockWrapper}>
      <Stage
        className={styles.stageWrapper}
        runtime={runtime.value}
        onRuntime={useCallback((val) => (runtime.value = val), [])}
      />

      <div
        className={classNames(styles.selectorWrapper, {
          [styles.small]: appState.value?.stageSize !== StageConfig.Large,
        })}
      ></div>
    </div>
  );
}
