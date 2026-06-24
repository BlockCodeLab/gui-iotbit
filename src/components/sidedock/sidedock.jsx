import { useCallback, useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { classNames } from '@blockcode/utils';
import { useAppContext, setAppState } from '@blockcode/core';
import { PanelBox } from '@blockcode/code';
import { StageConfig } from '../emulator/emulator-config';

import { Stage } from '../stage/stage';
import { EmuData } from '../emu-data/emu-data';
import styles from './sidedock.module.css';

export function Sidedock() {
  const { tabIndex, appState } = useAppContext();

  const runtime = useSignal(null);

  useEffect(() => {
    setAppState({
      stageSize: window.innerWidth < 1200 ? StageConfig.Small : StageConfig.Large,
    });
  }, []);

  return (
    <div
      id="emulator-sidedock"
      className={styles.sidedockWrapper}
    >
      <Stage
        className={styles.stageWrapper}
        runtime={runtime.value}
        onRuntime={useCallback((val) => (runtime.value = val), [])}
      />

      <div
        className={classNames(styles.dataWrapper, {
          [styles.small]: appState.value?.stageSize === StageConfig.Small,
        })}
      >
        <EmuData runtime={runtime} />
      </div>

      {appState.value?.panelBoxId && tabIndex.value !== 1 && (
        <div className={styles.panelBoxWrapper}>
          <PanelBox compactMode={appState.value?.stageSize === StageConfig.Small} />
        </div>
      )}
    </div>
  );
}
