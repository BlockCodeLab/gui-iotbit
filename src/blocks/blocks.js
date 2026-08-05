import getPinsBlocks from './pins';
import getDisplayBlocks from './display';
import getSoundBlocks from './sound';
import getEventsBlocks from './events';
import getControlBlocks from './control';
import getNetworkBlocks from './network';
import getSensingBlocks from './sensing';
import getOperatorsBlocks from './operators';
import getDataBlocks from './data';
import getMyBlocks from './procedures';
import getTextBlocks from './text';
import getSerialBlocks from './serial';

export { IotBitGenerator, IotBitEmulatorGenerator } from './generator';

export function buildBlocks() {
  const pinsBlocks = getPinsBlocks();
  const serialBlocks = getSerialBlocks();
  const displayBlocks = getDisplayBlocks();
  const soundBlocks = getSoundBlocks();
  const eventsBlocks = getEventsBlocks();
  const controlBlocks = getControlBlocks();
  const networkBlocks = getNetworkBlocks();
  const sensingBlocks = getSensingBlocks();
  const operatorsBlocks = getOperatorsBlocks();
  const textBlocks = getTextBlocks();
  const dataBlocks = getDataBlocks();
  const myBlocks = getMyBlocks();

  return [
    pinsBlocks,
    serialBlocks,
    displayBlocks,
    soundBlocks,
    eventsBlocks,
    controlBlocks,
    networkBlocks,
    sensingBlocks,
    operatorsBlocks,
    textBlocks,
    dataBlocks,
    myBlocks,
  ];
}
