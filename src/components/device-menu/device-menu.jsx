import { useCallback } from 'preact/hooks';
import { nanoid, classNames } from '@blockcode/utils';
import { useProjectContext, setAlert, delAlert } from '@blockcode/core';
import { MPYUtils } from '@blockcode/board';
import { sleepMs } from '@blockcode/utils';
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
  const checker = MPYUtils.check(device).catch(() => {
    errorAlert();
    removeDownloading();
  });

  const projectFiles = [].concat(mainFile, assetFiles).map((file) => ({
    ...file,
    filename: file.id,
  }));

  downloadingAlert(0);

  try {
    // 开始下载
    await MPYUtils.write(device, projectFiles, downloadingAlert);
    //device.hardReset();
    device.exitRawRepl();
    await sleepMs(1000);
    device.reset();
    await sleepMs(1000);
  } catch (err) {
    console.log(err);
    errorAlert(err);
    removeDownloading();
  } finally {
    device.disconnect();
  }

  checker.cancel();
};

export function DeviceMenu({ itemClassName }) {
  const { meta, file, assets } = useProjectContext();

  const handleDownload = useCallback(async () => {
    if (downloadAlertId) return;
    let currentDevice;
    try {
      currentDevice = await MPYUtils.connect(deviceFilters, {
        baudRate: 115200,
      });
    } catch (err) {
      console.log(err);
      errorAlert(err.name);
    }
    if (!currentDevice) return;
    downloadProgram(currentDevice, file.value, assets.value);
  }, []);

  const handleDownloadBLE = useCallback(async () => {
    if (downloadAlertId) return;
    let currentDevice;
    try {
      currentDevice = await MPYUtils.connectBLE();
    } catch (err) {
      console.log(err);
      errorAlert(err.name);
    }
    if (!currentDevice) return;
    downloadProgram(currentDevice, file.value, assets.value);
  }, []);

  return (
    <>
      <MenuSection>
        <MenuItem
          disabled={true || downloadAlertId}
          className={classNames(itemClassName, styles.blankCheckItem)}
          label={
            <Text
              id="iotbit.menubar.device.downloadBle"
              defaultMessage="Download program via Bluetooth (BLE)"
            />
          }
          onClick={handleDownloadBLE}
        />
        <MenuItem
          disabled={downloadAlertId}
          className={classNames(itemClassName, styles.blankCheckItem)}
          label={
            <Text
              id="iotbit.menubar.device.download"
              defaultMessage="Download program via Serial Port"
            />
          }
          onClick={handleDownload}
        />
      </MenuSection>

      <FirmwareSection itemClassName={itemClassName} />
    </>
  );
}
