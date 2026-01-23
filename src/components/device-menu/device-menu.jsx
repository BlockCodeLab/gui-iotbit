import { useCallback, useEffect } from 'preact/hooks';
import { useComputed } from '@preact/signals';
import { classNames, sleepMs, nanoid } from '@blockcode/utils';
import { useAppContext, useProjectContext, setAlert, setAppState, translate, logger } from '@blockcode/core';
import { MPYUtils } from '@blockcode/board';
import { downloadProgram } from '../../lib/download-program';
import deviceFilters from './device-filters.yaml';

import { Text, MenuSection, MenuItem } from '@blockcode/core';
import { FirmwareSection } from './firmware-section';
import styles from './device-menu.module.css';

const errorAlert = (err, id) => {
  if (err.name === 'NotFoundError') return;
  if (err.name === 'NetworkError') {
    setAlert('connectionBusy', { id }, 1000);
  } else {
    setAlert('connectionError', { id }, 1000);
  }
};

export function DeviceMenu({ itemClassName }) {
  const { appState } = useAppContext();

  const { file, assets } = useProjectContext();

  const device = useComputed(() => appState.value?.device);

  const deviceAlertId = useComputed(() => appState.value?.deviceAlertId);

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
    } catch (err) {
      errorAlert(err, deviceAlertId.value);
    }
  }, []);

  const handleDownload = useCallback(async () => {
    if (!device.value) return;
    if (deviceAlertId.value) return;

    const alertId = nanoid();
    setAppState('deviceAlertId', alertId);
    await downloadProgram(alertId, device.value, file.value, assets.value);

    setAppState('deviceAlertId', null);
  }, []);

  const handleDisconnect = useCallback(() => {
    if (deviceAlertId.value) return;
    device.value?.disconnect();
    logger.warn(translate('gui.logs.disconnected', 'Device disconnected'));
  }, []);

  const handleReset = useCallback(() => {
    if (deviceAlertId.value) return;
    device.value?.reset();
    setAlert('reseting', 1000);
  }, []);

  useEffect(() => {
    if (deviceAlertId.value && !device.value) {
      setAppState('deviceAlertId', null);
    }
  }, [device.value]);

  return (
    <>
      <MenuSection disabled={deviceAlertId.value || !device.value}>
        <MenuItem
          className={classNames(itemClassName, styles.blankCheckItem)}
          label={
            <Text
              id="gui.menubar.device.download"
              defaultMessage="Download program"
            />
          }
          onClick={handleDownload}
        />
      </MenuSection>

      <MenuSection disabled={deviceAlertId.value}>
        {device.value ? (
          <>
            <MenuItem
              className={classNames(itemClassName, styles.blankCheckItem)}
              label={
                <Text
                  id="gui.menubar.device.disconnect"
                  defaultMessage="Disconnect device"
                />
              }
              onClick={handleDisconnect}
            />
            <MenuItem
              className={classNames(itemClassName, styles.blankCheckItem)}
              label={
                <Text
                  id="gui.menubar.device.reset"
                  defaultMessage="Reset device"
                />
              }
              onClick={handleReset}
            />
          </>
        ) : (
          <>
            <MenuItem
              className={classNames(itemClassName, styles.blankCheckItem)}
              label={
                <Text
                  id="gui.menubar.device.connectUsb"
                  defaultMessage="Connect device with USB..."
                />
              }
              onClick={handleConnectUSB}
            />
            <MenuItem
              disabled
              className={classNames(itemClassName, styles.blankCheckItem)}
              label={
                <Text
                  id="gui.menubar.device.connectBle"
                  defaultMessage="Connect device with Bluetooth (BLE)..."
                />
              }
              onClick={handleConnectBLE}
            />
          </>
        )}
      </MenuSection>

      <FirmwareSection
        disabled={deviceAlertId.value}
        itemClassName={itemClassName}
      />
    </>
  );
}
