import { useCallback } from 'preact/hooks';
import { classNames } from '@blockcode/utils';
import { useAppContext, translate, setAppState } from '@blockcode/core';
import { StageConfig } from '../emulator/emulator-config';

import { ToggleButtons } from '@blockcode/core';
import styles from './toolbar.module.css';

import greenFlagIcon from './icons/icon-green-flag.svg';
import stopIcon from './icons/icon-stop-all.svg';
import smallStageIcon from './icons/icon-small-stage.svg';
import largeStageIcon from './icons/icon-large-stage.svg';

export function Toolbar() {
  const { appState, tabIndex } = useAppContext();

  const handlePlay = useCallback(() => {
    if (tabIndex.value !== 0) return;
    setAppState({ running: true });
  }, []);

  const handleStop = useCallback(() => {
    setAppState({ running: false });
  }, []);

  const handleChangeStageSize = useCallback((stageSize) => {
    setAppState({ stageSize });
  }, []);

  return (
    <div className={styles.toolbarWrapper}>
      <div className={styles.toolbarButtonsGroup}>
        <img
          className={classNames(styles.greenFlag, {
            [styles.actived]: appState.value?.running,
            [styles.disabled]: tabIndex.value !== 0,
          })}
          src={greenFlagIcon}
          title={translate('iotbit.emu.greenFlag', 'Go')}
          onClick={handlePlay}
        />
        <img
          className={classNames(styles.stop, {
            [styles.actived]: appState.value?.running,
          })}
          src={stopIcon}
          title={translate('iotbit.emu.stop', 'Stop')}
          onClick={handleStop}
        />
      </div>
      <div className={styles.toolbarButtonsGroup}>
        <ToggleButtons
          items={[
            {
              icon: smallStageIcon,
              title: translate('iotbit.emu.smallStage', 'Switch to small stage'),
              value: StageConfig.Small,
            },
            {
              icon: largeStageIcon,
              title: translate('iotbit.emu.largeStage', 'Switch to large stage'),
              value: StageConfig.Large,
            },
          ]}
          value={appState.value?.stageSize ?? StageConfig.Small}
          onChange={handleChangeStageSize}
        />
      </div>
    </div>
  );
}
