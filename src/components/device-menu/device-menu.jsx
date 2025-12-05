import { useCallback } from 'preact/hooks';
import { nanoid, classNames } from '@blockcode/utils';
import { useAppContext, useProjectContext, setAlert, delAlert, setAppState } from '@blockcode/core';
import { MPYUtils } from '@blockcode/board';
import deviceFilters from './device-filters.yaml';

import { Spinner, Text, MenuSection, MenuItem } from '@blockcode/core';
import { FirmwareSection } from './firmware-section';
import styles from './device-menu.module.css';

let downloadAlertId = null;

const removeDownloading = () => {
  delAlert(downloadAlertId);
  downloadAlertId = null;
};

const downloadingAlert = (progress) => {
  if (!downloadAlertId) {
    downloadAlertId = nanoid();
  }
  if (progress < 100) {
    setAlert({
      id: downloadAlertId,
      icon: <Spinner level="success" />,
      message: (
        <Text
          id="gui.alert.downloadingProgress"
          defaultMessage="Downloading...{progress}%"
          progress={progress}
        />
      ),
    });
  } else {
    setAlert('downloadCompleted', { id: downloadAlertId });
    setTimeout(removeDownloading, 2000);
  }
};

const errorAlert = (err) => {
  if (err === 'NotFoundError') return;
  setAlert('connectionError', 1000);
};

const downloadProgram = async (device, mainFile, assetFiles) => {
  const projectFiles = [].concat(mainFile, assetFiles).map((file) => ({
    ...file,
    filename: file.id,
  }));

  downloadingAlert(0);

  try {
    // 开始下载
    await MPYUtils.write(device, projectFiles, downloadingAlert);
    device.reset();
    // await MPYUtils.disconnect(device);
  } catch (err) {
    errorAlert(err.name);
  }

  removeDownloading();
};

export function DeviceMenu({ itemClassName }) {
  const { appState } = useAppContext();
  const { meta, file, assets } = useProjectContext();

  const connectDevice = useCallback((device) => {
    device.on('disconnect', () => setAppState('currentDevice', null));
    MPYUtils.check(device).catch(() => {
      errorAlert();
      removeDownloading();
    });
    setAppState('currentDevice', device);
  });

  const handleConnectUSB = useCallback(async () => {
    if (downloadAlertId) return;
    try {
      const device = await MPYUtils.connect(deviceFilters, {
        baudRate: 115200,
      });
      connectDevice(device);
    } catch (err) {
      errorAlert(err.name);
    }
  }, []);

  const handleConnectBLE = useCallback(async () => {
    if (downloadAlertId) return;
    try {
      const device = await MPYUtils.connectBLE();
      connectDevice(device);
    } catch (err) {
      errorAlert(err.name);
    }
  }, []);

  const handleDownload = useCallback(async () => {
    if (downloadAlertId) return;
    if (!appState.value?.currentDevice) return;
    downloadProgram(appState.value.currentDevice, file.value, assets.value);
  }, []);

  const handleReset = useCallback(async () => {
    if (downloadAlertId) return;
    appState.value?.currentDevice?.reset();
    setAlert(
      {
        message: (
          <Text
            id="iotbit.menubar.device.resetDone"
            defaultMessage="Device reset successful"
          />
        ),
      },
      1000,
    );
  }, []);

  return (
    <>
      <MenuSection disabled={downloadAlertId || !appState.value?.currentDevice}>
        <MenuItem
          className={classNames(itemClassName, styles.blankCheckItem)}
          label={
            <Text
              id="iotbit.menubar.device.download"
              defaultMessage="Download program"
            />
          }
          onClick={handleDownload}
        />
        <MenuItem
          className={classNames(itemClassName, styles.blankCheckItem)}
          label={
            <Text
              id="iotbit.menubar.device.reset"
              defaultMessage="Reset device"
            />
          }
          onClick={handleReset}
        />
      </MenuSection>

      <MenuSection disabled={downloadAlertId}>
        <MenuItem
          className={classNames(itemClassName, styles.blankCheckItem)}
          label={
            <Text
              id="iotbit.menubar.device.connectUsb"
              defaultMessage="Connect device with USB"
            />
          }
          onClick={handleConnectUSB}
        />
        <MenuItem
          className={classNames(itemClassName, styles.blankCheckItem)}
          label={
            <Text
              id="iotbit.menubar.device.connectBle"
              defaultMessage="Connect device with Bluetooth (BLE)"
            />
          }
          onClick={handleConnectBLE}
        />
      </MenuSection>

      <FirmwareSection
        disabled={downloadAlertId}
        itemClassName={itemClassName}
      />
    </>
  );
}
