import { useCallback } from 'preact/hooks';
import { useComputed } from '@preact/signals';
import { nanoid } from '@blockcode/utils';
import { useAppContext, useProjectContext, setAppState, Text } from '@blockcode/core';
import { downloadProgram } from '../../lib/download-program';

import downloadIcon from './icon-download.svg';

export function DownloadLabel({ className }) {
  const { appState } = useAppContext();

  const { file, assets } = useProjectContext();

  const device = useComputed(() => appState.value?.device);

  const deviceAlertId = useComputed(() => appState.value?.deviceAlertId);

  const handleDownload = useCallback(async () => {
    if (!device.value) return;
    if (deviceAlertId.value) return;

    const alertId = nanoid();
    setAppState('deviceAlertId', alertId);
    await downloadProgram(alertId, device.value, file.value, assets.value);

    setAppState('deviceAlertId', null);
  }, []);

  return (
    <label
      disabled={deviceAlertId.value || !device.value}
      className={className}
      onClick={handleDownload}
    >
      <img src={downloadIcon} />
      <span>
        <Text
          id="gui.menubar.device.download"
          defaultMessage="Download program"
        />
      </span>
    </label>
  );
}
