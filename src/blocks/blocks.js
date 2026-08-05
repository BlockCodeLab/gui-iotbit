import getPinsBlocks from './pins';
import getCameraBlocks from './camera';
import getEventsBlocks from './events';
import getControlBlocks from './control';
import getNetworkBlocks from './network';
import getOperatorsBlocks from './operators';
import getDataBlocks from './data';
import getSensingBlocks from './sensing';
import getTextBlocks from './text';
import getSerialBlocks from './serial';

import { ESP32Boards } from '../lib/boards';
export { ESP32Generator } from './generator';

export function buildBlocks(boardType) {
  const isCamera = [ESP32Boards.ESP32S3_CAM, ESP32Boards.ATOMS3R_CAM].includes(boardType);

  const pinsBlocks = getPinsBlocks(boardType);
  const serialBlocks = getSerialBlocks(boardType, 1);
  const cameraBlocks = getCameraBlocks(boardType, 2);
  const eventsBlocks = getEventsBlocks(boardType, 2 + isCamera);
  const controlBlocks = getControlBlocks(3 + isCamera);
  const networkBlocks = getNetworkBlocks(4 + isCamera);
  const sensingBlocks = getSensingBlocks(boardType, 5 + isCamera);
  const operatorsBlocks = getOperatorsBlocks(6 + isCamera);
  const textBlocks = getTextBlocks(7 + isCamera);
  const dataBlocks = getDataBlocks(8 + isCamera);

  return [
    pinsBlocks,
    serialBlocks,
    isCamera && cameraBlocks,
    eventsBlocks,
    controlBlocks,
    networkBlocks,
    sensingBlocks,
    operatorsBlocks,
    textBlocks,
    dataBlocks,
  ].filter(Boolean);
}
