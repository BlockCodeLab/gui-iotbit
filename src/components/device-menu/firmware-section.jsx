import { useEffect, useCallback } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { nanoid, classNames, sleep, Base64Utils, getBinaryCache, setBinaryCache } from '@blockcode/utils';
import { setAlert, delAlert } from '@blockcode/core';
import { ESPTool } from '@blockcode/board';
import { firmware } from '../../../package.json';
import deviceFilters from './device-filters.yaml';

import { Text, MenuSection, MenuItem } from '@blockcode/core';
import styles from './device-menu.module.css';

let alertId = null;

const uploadingAlert = (progress) => {
  if (progress < 100) {
    setAlert('restoring', {
      id: alertId,
      progress,
    });
  } else {
    setAlert('recovering', { id: alertId });
  }
};

const closeAlert = () => {
  delAlert(alertId);
  alertId = null;
};

const errorAlert = (err) => {
  if (err === 'NotFoundError') return;
  setAlert('connectionError', 1000);
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
  alertId = nanoid();
  setAlert('erasing', { id: alertId });

  try {
    await ESPTool.writeFlash(esploader, data, true, (val) => uploadingAlert(val));
    setAlert('restoreCompleted', {
      id: alertId,
      onClose: closeAlert,
    });
  } catch (err) {
    errorAlert(err.name);
    closeAlert();
  }
  await ESPTool.disconnect(esploader);
};

const uploadFirmware = async (cacheName) => {
  if (alertId) return;

  let esploader;
  try {
    esploader = await ESPTool.connect(deviceFilters, 460800);
  } catch (err) {
    errorAlert(err.name);
  }
  if (!esploader) return;

  // 从缓存中升级到最新固件
  const data = await getBinaryCache(cacheName);
  if (data) {
    uploadData(esploader, [
      {
        data: data.binaryString,
        address: 0x1000,
      },
    ]);
  }
};

export function FirmwareSection({ disabled, itemClassName }) {
  const readyForUpdate = useSignal(false);

  const firmwareJson = useSignal(null);

  useEffect(() => (alertId = null), []);

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
        disabled={disabled || alertId || !readyForUpdate.value}
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
