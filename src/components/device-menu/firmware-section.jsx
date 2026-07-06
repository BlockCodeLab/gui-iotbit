import { useEffect, useCallback } from 'preact/hooks';
import { useSignal, useComputed } from '@preact/signals';
import { nanoid, classNames, sleep, sleepMs, Base64Utils, getBinaryCache, setBinaryCache } from '@blockcode/utils';
import { useAppContext, setAlert, delAlert, setAppState, logger, translate } from '@blockcode/core';
import { ESPTool, MPYBoard } from '@blockcode/board';
import { firmware } from '../../../package.json';
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
    setAlert('connectionBusy', { id }, 2000);
  } else {
    setAlert('connectionError', { id }, 2000);
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
const getFirmwareCache = async (cacheName, downloadUrl, firmwareHash, firmwareVersion, readyForUpdate) => {
  if (readyForUpdate.value) return;

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
    getFirmwareCache(cacheName, downloadUrl, firmwareHash, firmwareVersion, readyForUpdate);
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

const uploadData = async (esploader, data) => {
  const alertId = nanoid();
  setAlert('erasing', { id: alertId });
  setAppState('deviceAlertId', alertId);

  try {
    await ESPTool.writeFlash(esploader, data, true, (val) => uploadingAlert(val, alertId));
    setAlert('restoreCompletedNotReset', {
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

export function FirmwareSection({ disabled, itemClassName }) {
  const { appState } = useAppContext();

  const device = useComputed(() => appState.value?.device);

  const readyForUpdate = useSignal(false);

  const firmwareJson = useSignal(null);

  const connectDevice = useCallback(async (newDevice) => {
    if (newDevice === device.value) return;
    await device.value?.disconnect();
    await sleepMs(500);
    const handleConnect = () => connectDevice(newDevice);
    const handleDisconnect = (err) => {
      if (err) {
        errorAlert(err, deviceAlertId.value);
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

  const uploadFirmware = useCallback(async (cacheName) => {
    let esploader;
    try {
      if (device.value) {
        esploader = await ESPTool.reconnect(device.value, 460800);
      } else {
        esploader = await ESPTool.connect(deviceFilters, 460800);
      }
    } catch (err) {
      errorAlert(err.name);
    }
    if (!esploader) return;

    // 从缓存中升级到最新固件
    const data = await getBinaryCache(cacheName);
    if (data) {
      await uploadData(esploader, [
        {
          data: data.binaryString,
          address: 0x1000,
        },
      ]);
    }

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
    await currentDevice.setSignals({ dataTerminalReady: false, requestToSend: true });
    await sleepMs(100);
    await currentDevice.setSignals({ dataTerminalReady: true });
  }, []);

  useEffect(async () => {
    readyForUpdate.value = false;
    const baseUrl = firmware.download;
    if (!firmwareJson.value) {
      firmwareJson.value = await fetch(`${baseUrl}/version.json`).then((res) => res.json());
    }
    const downloadUrl = `${baseUrl}/${firmwareJson.value.download}`.replaceAll('{version}', firmwareJson.value.version);
    const firmwareHash = firmwareJson.value.hash;
    getFirmwareCache('iotbitFirmware', downloadUrl, firmwareHash, firmwareJson.value.version, readyForUpdate);
  }, []);

  return (
    <MenuSection>
      <MenuItem
        disabled={disabled || device.value?.type === 'ble' || !readyForUpdate.value}
        className={classNames(itemClassName, styles.blankCheckItem)}
        onClick={useCallback(() => uploadFirmware('iotbitFirmware'), [])}
      >
        {readyForUpdate.value ? (
          <Text
            id="gui.menubar.device.firmwareVersion"
            defaultMessage="Restore v{version} firmware..."
            version={firmwareJson.value.version}
          />
        ) : (
          <Text
            id="gui.menubar.device.caching"
            defaultMessage="Caching latest firmware..."
          />
        )}
      </MenuItem>
    </MenuSection>
  );
}
