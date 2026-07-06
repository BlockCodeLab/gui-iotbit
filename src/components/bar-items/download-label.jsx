import { useCallback } from 'preact/hooks';
import { useComputed } from '@preact/signals';
import { nanoid, sleepMs, classNames } from '@blockcode/utils';
import {
  useAppContext,
  useProjectContext,
  setAppState,
  setAlert,
  translate,
  logger,
  Text,
  Dropdown,
} from '@blockcode/core';
import { MPYUtils } from '@blockcode/board';
import { ESP32Boards } from '../../lib/boards';
import { downloadProgram } from '../../lib/download-program';
import styles from './download-label.module.css';
import downloadIcon from './icon-download.svg';
import deviceFilters from '../device-menu/device-filters.yaml';

const errorAlert = (err, id) => {
  if (err.name === 'NotFoundError') return;
  if (err.name === 'NetworkError') {
    setAlert('connectionBusy', { id }, 2000);
  } else {
    setAlert('connectionError', { id }, 2000);
  }
};

export function DownloadLabel({ className, menuClassName, itemClassName }) {
  const { appState } = useAppContext();

  const { meta, file, assets } = useProjectContext();

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
    await sleepMs(500);
    handleDownload();
  }, []);

  const handleConnectUSB = useCallback(async () => {
    if (deviceAlertId.value) return;
    try {
      const newDevice = await MPYUtils.connect(deviceFilters, {
        baudRate: 115200,
      });
      connectDevice(newDevice);
      setAlert('connected', 1000);
      logger.success(translate('gui.logs.connectedType', 'Device connected with {type}', { type: 'USB' }));
    } catch (err) {
      errorAlert(err, deviceAlertId.value);
    }
  }, []);

  const handleConnectBLE = useCallback(async () => {
    if (deviceAlertId.value) return;
    try {
      const newDevice = await MPYUtils.connectBLE();
      connectDevice(newDevice);
      setAlert('connected', 1000);
      logger.success(translate('gui.logs.connectedType', 'Device connected with {type}', { type: 'BLE' }));
      return newDevice;
    } catch (err) {
      errorAlert(err, deviceAlertId.value);
    }
  }, []);

  return meta.value.boardType !== ESP32Boards.ESP32_IOT_BOARD || device.value ? (
    <label
      disabled={deviceAlertId.value}
      className={className}
      onClick={device.value ? handleDownload : handleConnectUSB}
    >
      <img src={downloadIcon} />
      <span>
        <Text
          id="gui.menubar.device.download"
          defaultMessage="Download program"
        />
      </span>
    </label>
  ) : (
    <Dropdown
      className={styles.dropdown}
      iconClassName={styles.dropdownIcon}
      menuClassName={classNames(menuClassName, styles.menu)}
      items={[
        {
          label: (
            <Text
              id="gui.menubar.device.connectUsb"
              defaultMessage="Connect device with USB..."
            />
          ),
          className: itemClassName,
          onClick: handleConnectUSB,
        },
        {
          label: (
            <Text
              id="gui.menubar.device.connectBle"
              defaultMessage="Connect device with Bluetooth (BLE)..."
            />
          ),
          className: itemClassName,
          onClick: handleConnectBLE,
        },
      ]}
    >
      <label
        disabled={deviceAlertId.value}
        className={className}
      >
        <img src={downloadIcon} />
        <span>
          <Text
            id="gui.menubar.device.download"
            defaultMessage="Download program"
          />
        </span>
      </label>
    </Dropdown>
  );
}
