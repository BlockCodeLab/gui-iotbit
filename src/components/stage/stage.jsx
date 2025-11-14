import { classNames } from '@blockcode/utils';
import { useAppContext } from '@blockcode/core';
import { StageConfig } from '../emulator/emulator-config';

import { IotBitEmulator } from '../emulator/emulator';
import { Toolbar } from './toolbar';
import styles from './stage.module.css';

export function Stage({ runtime, onRuntime }) {
  const { appState } = useAppContext();

  return (
    <div className={styles.stageWrapper}>
      <Toolbar />

      <div
        className={classNames(styles.stage, {
          [styles.smallStage]: appState.value?.stageSize !== StageConfig.Large,
        })}
      >
        <IotBitEmulator
          runtime={runtime}
          onRuntime={onRuntime}
        />
      </div>
    </div>
  );
}
