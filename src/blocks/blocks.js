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

export { IotBitGenerator } from './generator';

export function buildBlocks() {
  const pinsBlocks = getPinsBlocks();
  const displayBlocks = getDisplayBlocks();
  const soundBlocks = getSoundBlocks();
  const eventsBlocks = getEventsBlocks();
  const controlBlocks = getControlBlocks();
  const networkBlocks = getNetworkBlocks();
  const sensingBlocks = getSensingBlocks();
  const operatorsBlocks = getOperatorsBlocks();
  const dataBlocks = getDataBlocks();
  const myBlocks = getMyBlocks();

  return [
    pinsBlocks,
    displayBlocks,
    soundBlocks,
    eventsBlocks,
    controlBlocks,
    networkBlocks,
    sensingBlocks,
    operatorsBlocks,
    dataBlocks,
    myBlocks,
  ];
}
