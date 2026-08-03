import { useEffect, useMemo, useCallback } from 'preact/hooks';
import { useSignal, useComputed } from '@preact/signals';
import { nanoid, classNames, sleep, sleepMs, Base64Utils, getBinaryCache, setBinaryCache } from '@blockcode/utils';
import { useAppContext, useProjectContext, setAlert, delAlert, setAppState, logger, translate } from '@blockcode/core';
import { ESPTool, MPYBoard } from '@blockcode/board';
import { ESP32Boards } from '../../lib/boards';
import { firmwares } from '../../../package.json';
import deviceFilters from './device-filters.yaml';

import { Text, MenuSection, MenuItem } from '@blockcode/core';
import styles from './device-menu.module.css';

const uploadingAlert = (progress, id) => {
  if (progress < 100) {
    setAlert('restoring', { id, progress });
  } else {
    setAlert('recovering', { id });
  }
};

const closeAlert = (id) => {
  delAlert(id);
  setAppState('deviceAlertId', null);
};

const errorAlert = (err) => {
  if (err.name === 'NotFoundError') return;
  if (err.name === 'NetworkError') {
    setAlert('connectionBusy', 2000);
  } else {
    setAlert('connectionError', 2000);
  }
};

// 下载固件
const getFirmware = async (downloadUrl) => {
  try {
    return await fetch(downloadUrl, {
      method: 'GET',
    });
  } catch (err) {
    await sleep(1);
    return getFirmware(downloadUrl);
  }
};

// 查询是否有缓存固件
const getFirmwareCache = async (firmwareName, downloadUrl, firmwareHash, firmwareVersion, readyForUpdate) => {
  if (readyForUpdate.value) return;

  const cacheName = `${firmwareName}Firmware`;

  const data = await getBinaryCache(cacheName);

  // 比对缓存固件版本
  if (data?.hash === firmwareHash && data?.binaryString) {
    readyForUpdate.value = true;
    delete getFirmwareCache.downloading;
    return;
  }

  // 缓存固件不存在或版本不匹配，下载固件
  // 防止重复下载
  if (getFirmwareCache.downloading) return;

  // 下载中
  getFirmwareCache.downloading = true;

  const res = await getFirmware(downloadUrl);
  const buffer = await res.arrayBuffer();

  delete getFirmwareCache.downloading;

  // 检查hash值
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  if (hash !== firmwareHash) {
    getFirmwareCache(firmwareName, downloadUrl, firmwareHash, firmwareVersion, readyForUpdate);
    return;
  }

  // 进行缓存
  await setBinaryCache(cacheName, {
    version: firmwareVersion,
    hash: firmwareHash,
    binaryString: Base64Utils.arrayBufferToBinaryString(buffer),
  });
  readyForUpdate.value = true;
};

const uploadData = async (esploader, needReset, data) => {
  const alertId = nanoid();
  setAlert('erasing', { id: alertId });
  setAppState('deviceAlertId', alertId);

  try {
    await ESPTool.writeFlash(esploader, data, true, (val) => uploadingAlert(val, alertId));
    setAlert(needReset ? 'restoreCompleted' : 'restoreCompletedNotReset', {
      id: alertId,
      onClose() {
        closeAlert(alertId);
      },
    });
  } catch (err) {
    errorAlert(err.name);
    closeAlert(alertId);
  }
  await ESPTool.disconnect(esploader);

  // logger.warn(translate('gui.logs.disconnected', 'Device disconnected'));
  // setAppState('device', null);
};

const uploadFirmware = async (device, needReset, firmwareName, address = 0) => {
  let esploader;
  try {
    if (device) {
      esploader = await ESPTool.reconnect(device, 460800);
    } else {
      esploader = await ESPTool.connect(deviceFilters, 460800);
    }
  } catch (err) {
    errorAlert(err.name);
  }
  if (!esploader) return;

  // 从缓存中升级到最新固件
  if (firmwareName) {
    const data = await getBinaryCache(`${firmwareName}Firmware`);
    if (data) {
      await uploadData(esploader, needReset, [
        {
          address,
          data: data.binaryString,
        },
      ]);
      return esploader;
    }
  }

  // 用户自选固件
  return new Promise((resolve) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.bin';
    fileInput.multiple = false;
    fileInput.click();
    fileInput.addEventListener('cancel', () => ESPTool.disconnect(esploader));
    fileInput.addEventListener('change', async (e) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(e.target.files[0]);
      reader.addEventListener('load', async (e) => {
        await uploadData(esploader, needReset, [
          {
            address,
            data: Base64Utils.arrayBufferToBinaryString(e.target.result),
          },
        ]);
        resolve(esploader);
      });
    });
  });
};

export function FirmwareSection({ disabled, itemClassName }) {
  const { appState } = useAppContext();

  const { meta } = useProjectContext();

  const device = useComputed(() => appState.value?.device);

  const deviceName = useMemo(() => {
    if (meta.value.boardType === ESP32Boards.ESP32) {
      return translate('esp32.menubar.device.esp32', 'ESP32');
    }
    if (meta.value.boardType === ESP32Boards.ESP32S3) {
      return translate('esp32.menubar.device.esp32s3', 'ESP32-S3');
    }
    if (meta.value.boardType === ESP32Boards.ESP32C3) {
      return translate('esp32.menubar.device.esp32c3', 'ESP32-C3');
    }
  }, [meta.value.boardType]);

  const readyForUpdate = useSignal(false);

  const firmwareJson = useSignal(null);

  const firmwareName = useMemo(() => {
    if (meta.value.boardType === ESP32Boards.ESP32_IOT_BOARD) {
      firmwareJson.value = null;
      return 'iotboard';
    }
    if (meta.value.boardType === ESP32Boards.ESP32S3_CAM) {
      firmwareJson.value = null;
      return 'esp32s3cam';
    }
  }, [meta.value.boardType]);

  const firmwareLabel = useMemo(() => {
    if ([ESP32Boards.ESP32_IOT_BOARD, ESP32Boards.ESP32S3_CAM].includes(meta.value.boardType)) {
      return (
        <Text
          id="gui.menubar.device.firmwareVersion"
          defaultMessage="Restore v{version} firmware..."
          version={firmwareJson.value?.version}
        />
      );
    }
  }, [meta.value.boardType, firmwareJson.value?.version]);

  const connectDevice = useCallback(async (newDevice) => {
    if (newDevice === device.value) return;
    await device.value?.disconnect();
    await sleepMs(500);
    const handleConnect = () => connectDevice(newDevice);
    const handleDisconnect = (err) => {
      if (err) {
        errorAlert(err);
        logger.warn(translate('gui.logs.disconnected', 'Device disconnected') + ': ' + err.message);
      }
      setAppState('device', null);
      setAppState('deviceAlertId', null);
      newDevice.off('connect', handleConnect);
      newDevice.off('disconnect', handleDisconnect);
    };
    newDevice.on('connect', handleConnect);
    newDevice.on('disconnect', handleDisconnect);
    setAppState('device', newDevice);
  }, []);

  useEffect(async () => {
    if (!firmwareName || !firmwares[firmwareName]) return;
    readyForUpdate.value = false;
    const baseUrl = firmwares[firmwareName].download;
    if (!firmwareJson.value) {
      firmwareJson.value = await fetch(`${baseUrl}/version.json`).then((res) => res.json());
    }
    const downloadUrl = `${baseUrl}/${firmwareJson.value.download}`.replaceAll('{version}', firmwareJson.value.version);
    const firmwareHash = firmwareJson.value.hash;
    getFirmwareCache(firmwareName, downloadUrl, firmwareHash, firmwareJson.value.version, readyForUpdate);
  }, [firmwareName]);

  const handleUploadFirmware = useCallback(async () => {
    if (disabled || device.value?.type === 'ble') return;
    let address = 0;
    if ([ESP32Boards.ESP32, ESP32Boards.ESP32_IOT_BOARD].includes(meta.value.boardType)) {
      address = 0x1000;
    }
    const needReset = [ESP32Boards.ESP32, ESP32Boards.ESP32S3].includes(meta.value.boardType);
    const esploader = await uploadFirmware(device.value, needReset, firmwareName, address);

    if (needReset) return;

    let currentDevice = device.value;
    if (!currentDevice) {
      currentDevice = MPYBoard.fromPort(esploader.transport.device);
    }
    await currentDevice.connect({
      baudRate: 115200,
    });
    await connectDevice(currentDevice);
    setAppState('device', currentDevice);
    // reset
    await sleepMs(500);
    await device.value.setSignals({ dataTerminalReady: false, requestToSend: true });
    await sleepMs(100);
    await device.value.setSignals({ dataTerminalReady: true });
  }, [firmwareName]);

  return (
    <MenuSection>
      <MenuItem
        disabled={disabled || device.value?.type === 'ble' || (firmwareLabel && !readyForUpdate.value)}
        className={classNames(itemClassName, styles.blankCheckItem)}
        onClick={handleUploadFirmware}
      >
        {firmwareLabel ? (
          readyForUpdate.value ? (
            firmwareLabel
          ) : (
            <Text
              id="gui.menubar.device.caching"
              defaultMessage="Caching latest firmware..."
            />
          )
        ) : (
          <Text
            id="esp32.menubar.device.micropythonFirmware"
            defaultMessage="Restore {name} firmware..."
            name={deviceName}
          />
        )}
      </MenuItem>

      {[ESP32Boards.ESP32, ESP32Boards.ESP32S3].includes(meta.value.boardType) && (
        <MenuItem
          disabled={disabled || device.value?.type === 'ble'}
          className={classNames(itemClassName, styles.blankCheckItem)}
          onClick={useCallback(() => {
            if (meta.value.boardType === ESP32Boards.ESP32) {
              window.open('https://micropython.org/download/ESP32_GENERIC');
            } else if (meta.value.boardType === ESP32Boards.ESP32S3) {
              window.open('https://micropython.org/download/ESP32_GENERIC_S3');
            }
          }, [])}
        >
          <Text
            id="esp32.menubar.device.downloadMicropythonFirmware"
            defaultMessage="Download MicroPython firmware"
          />
        </MenuItem>
      )}
    </MenuSection>
  );
}
