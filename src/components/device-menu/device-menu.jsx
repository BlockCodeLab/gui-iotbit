import { useCallback, useEffect } from 'preact/hooks';
import { useComputed } from '@preact/signals';
import { classNames, sleepMs, nanoid } from '@blockcode/utils';
import { useAppContext, useProjectContext, setAlert, delAlert, setAppState, translate, logger } from '@blockcode/core';
import { MPYUtils } from '@blockcode/board';
import { downloadProgram } from '../../lib/download-program';
import deviceFilters from './device-filters.yaml';

import { Text, MenuSection, MenuItem } from '@blockcode/core';
import { FirmwareSection } from './firmware-section';
import styles from './device-menu.module.css';

const errorAlert = (err, id) => {
  if (err.name === 'NotFoundError') {
    delAlert(id);
  } else if (err.name === 'NetworkError') {
    setAlert('connectionBusy', { id }, 2000);
  } else {
    setAlert('connectionError', { id }, 2000);
  }
  setAppState('deviceAlertId', null);
};

export function DeviceMenu({ itemClassName }) {
  const { appState } = useAppContext();

  const { file, assets } = useProjectContext();

  const device = useComputed(() => appState.value?.device);

  const lastBLEDevice = useComputed(() => appState.value?.lastBLEDevice);

  const deviceAlertId = useComputed(() => appState.value?.deviceAlertId);

  const connectDevice = useCallback(async (newDevice) => {
    if (newDevice === device.value && newDevice.type !== 'ble') return;
    if (newDevice.type !== 'ble') {
      await device.value?.disconnect();
      await sleepMs(500);
    }
    const handleConnect = () => connectDevice(newDevice);
    const handleDisconnect = (err) => {
      if (err) {
        errorAlert(err, deviceAlertId.value);
        logger.warn(translate('gui.logs.disconnected', 'Device disconnected') + ': ' + err.message);
        setAppState('lastBLEDevice', null);
      }
      setAppState({
        device: null,
        deviceAlertId: null,
      });
      newDevice.off('connect', handleConnect);
      newDevice.off('disconnect', handleDisconnect);
    };
    newDevice.on('connect', handleConnect);
    newDevice.on('disconnect', handleDisconnect);
    setAppState({
      device: newDevice,
      deviceAlertId: null,
    });
  }, []);

  const handleConnectUSB = useCallback(async () => {
    if (deviceAlertId.value) return;
    const alertId = setAlert('connecting');
    setAppState('deviceAlertId', alertId);
    try {
      const newDevice = await MPYUtils.connect(deviceFilters, {
        baudRate: 115200,
      });
      connectDevice(newDevice);
      setAlert('connected', { id: alertId }, 1000);
      logger.success(translate('gui.logs.connectedType', 'Device connected with {type}', { type: 'USB' }));
      setAppState('lastBLEDevice', null);
    } catch (err) {
      errorAlert(err, alertId);
    }
  }, []);

  const handleConnectBLE = useCallback(async () => {
    if (deviceAlertId.value) return;
    const alertId = setAlert('connecting');
    setAppState('deviceAlertId', alertId);
    try {
      const newDevice = await MPYUtils.connectBLE();
      connectDevice(newDevice);
      setAlert('connected', { id: alertId }, 1000);
      logger.success(translate('gui.logs.connectedType', 'Device connected with {type}', { type: 'BLE' }));
      setAppState('lastBLEDevice', null);
    } catch (err) {
      errorAlert(err, alertId);
    }
  }, []);

  const handleDownload = useCallback(async () => {
    if (!device.value) return;
    if (deviceAlertId.value) return;

    const alertId = nanoid();
    setAppState({
      deviceAlertId: alertId,
      lastBLEDevice: device.value.type === 'ble' ? device.value : null,
    });
    await downloadProgram(alertId, device.value, file.value, assets.value);

    setAppState('deviceAlertId', null);
  }, []);

  const handleDisconnect = useCallback(() => {
    if (deviceAlertId.value) return;
    device.value?.disconnect();
    setAppState('lastBLEDevice', null);
    logger.warn(translate('gui.logs.disconnected', 'Device disconnected'));
  }, []);

  const handleReset = useCallback(() => {
    if (!device.value) return;
    if (deviceAlertId.value) return;
    if (device.value.type === 'ble') {
      setAppState('lastBLEDevice', device.value);
    }
    device.value.reset();
    setAlert('reseting', 1000);
  }, []);

  useEffect(async () => {
    if (device.value) return;
    if (lastBLEDevice.value && lastBLEDevice.value.type === 'ble' && !lastBLEDevice.value.connected) {
      const alertId = setAlert('reconnecting');
      setAppState('deviceAlertId', alertId);
      try {
        await lastBLEDevice.value.connect();
        await connectDevice(lastBLEDevice.value);
        logger.success(translate('gui.logs.reconnected', 'Device reconnected'));
      } catch (err) {
        errorAlert(err, alertId);
      }
      delAlert(alertId);
    }
    if (deviceAlertId.value) {
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
