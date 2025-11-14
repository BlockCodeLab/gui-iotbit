import { MathUtils, KonvaUtils } from '@blockcode/utils';
import { Keys } from '@blockcode/core';
import { Runtime } from '@blockcode/blocks';

export class IotBitRuntime extends Runtime {
  loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }
}
