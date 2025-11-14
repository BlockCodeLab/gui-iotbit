import { useCallback, useEffect } from 'preact/hooks';
import { MathUtils, KonvaUtils } from '@blockcode/utils';
import { useAppContext, useProjectContext } from '@blockcode/core';
import { Emulator } from '@blockcode/blocks';
import { IotBitRuntime } from '../../lib/runtime/runtime';
import { StageConfig } from './emulator-config';

import iotbitImage from './images/iotbit.svg';
import displayImage from './images/display.svg';
import buttonImage from './images/button.svg';
import buttonClickImage from './images/button-click.svg';
import pinImage from './images/pin.svg';
import pinClickImage from './images/pin-click.svg';
import pin0Image from './images/pin-0.svg';
import pin0ClickImage from './images/pin-0-click.svg';
import pinGNDImage from './images/pin-gnd.svg';
import pinGNDClickImage from './images/pin-gnd-click.svg';
import pinNameImage from './images/pin-name.svg';

export function IotBitEmulator({ runtime, onRuntime }) {
  const { splashVisible, appState } = useAppContext();

  const { meta, file, modified } = useProjectContext();

  // 运行模拟器
  useEffect(async () => {
    if (!runtime) return;

    // 启动
    if (appState.value?.running === true) {
      const code = `((/*${file.value.name}*/) => {\n${file.value.script}})();`;
      runtime.launch(`${code}\n\nruntime.start();`);
    }

    // 停止
    if (appState.value?.running === false) {
      if (runtime.running) {
        runtime.stop();
      }
    }
  }, [appState.value?.running]);

  // 模拟器编辑模式下更新
  useEffect(async () => {
    if (!runtime) return;

    if (splashVisible.value === true) {
      runtime.stop();
      runtime.backdropLayer.destroyChildren();
      runtime.paintLayer.destroyChildren();
      runtime.spritesLayer.destroyChildren();
      runtime.boardLayer.destroyChildren();
      return;
    }

    if (appState.value?.running) return;
  }, [runtime, splashVisible.value, modified.value, meta.value]);

  // 模拟器运行时不可编辑
  useEffect(() => {
    if (!runtime) return;
    runtime.stage.listening(!appState.value?.running);
  }, [runtime, appState.value?.running]);

  // 绑定模拟器运行时
  const handleRuntime = useCallback(
    async (stage) => {
      const runtime = new IotBitRuntime(stage);
      // runtime.handleKeyDown = runtime.handleKeyDown.bind(runtime);
      // runtime.handleKeyUp = runtime.handleKeyUp.bind(runtime);
      // document.addEventListener('keydown', runtime.handleKeyDown);
      // document.addEventListener('keyup', runtime.handleKeyUp);
      onRuntime(runtime);

      const res = {
        iotbit: await runtime.loadImage(iotbitImage),
        display: await runtime.loadImage(displayImage),
        button: await runtime.loadImage(buttonImage),
        buttonClick: await runtime.loadImage(buttonClickImage),
        pin: await runtime.loadImage(pinImage),
        pinClick: await runtime.loadImage(pinClickImage),
        pin0: await runtime.loadImage(pin0Image),
        pin0Click: await runtime.loadImage(pin0ClickImage),
        pinGND: await runtime.loadImage(pinGNDImage),
        pinGNDClick: await runtime.loadImage(pinGNDClickImage),
        pinName: await runtime.loadImage(pinNameImage),
      };

      // 创建硬件模拟
      runtime.backdropLayer.add(
        new Konva.Image({
          id: 'iotbit',
          x: 0,
          y: 0,
          scaleY: runtime.stage.scaleY(),
          image: res.iotbit,
          width: res.iotbit.width,
          height: res.iotbit.height,
          offsetX: res.iotbit.width / 2,
          offsetY: res.iotbit.height / 2,
        }),
      );

      // 屏幕（遮罩）
      runtime.boardLayer.add(
        new Konva.Image({
          id: 'display',
          x: 0,
          y: 20,
          scaleY: runtime.stage.scaleY(),
          image: res.display,
          width: res.display.width,
          height: res.display.height,
          offsetX: res.display.width / 2,
          offsetY: res.display.height / 2,
        }),
      );

      // 按钮
      ['a', 'b'].forEach((id, i) => {
        const button = new Konva.Image({
          id: 'button-' + id,
          x: -105 + i * 210,
          y: 7,
          scaleY: runtime.stage.scaleY(),
          image: res.button,
          width: res.button.width,
          height: res.button.height,
          offsetX: res.button.width / 2,
          offsetY: res.button.height / 2,
        });
        runtime.spritesLayer.add(button);

        button.on('pointerdown', () =>
          button.setAttrs({
            image: res.buttonClick,
            width: res.buttonClick.width,
            height: res.buttonClick.height,
            offsetX: res.buttonClick.width / 2,
            offsetY: res.buttonClick.height / 2,
          }),
        );

        button.on('pointerup', () =>
          button.setAttrs({
            image: res.button,
            width: res.button.width,
            height: res.button.height,
            offsetX: res.button.width / 2,
            offsetY: res.button.height / 2,
          }),
        );
      });

      // 引脚
      ['0', '1', '2', '3v', 'gnd'].forEach((id, i) => {
        const resName = i > 0 && i < 4 ? 'pin' : `pin${id.toUpperCase()}`;
        const pin = new Konva.Image({
          id: 'pin-' + id,
          x: -123 + i * 61.5 + (i === 0 ? 6 : i === 4 ? -7 : i === 3 ? 0.2 : 0),
          y: -88,
          scaleY: runtime.stage.scaleY(),
          image: res[resName],
          width: res[resName].width,
          height: res[resName].height,
          offsetX: res[resName].width / 2,
          offsetY: res[resName].height / 2,
        });
        runtime.spritesLayer.add(pin);

        // 0, 1, 2 可以控制
        if (i < 3) {
          pin.on('pointerdown', () =>
            pin.setAttrs({
              image: res[`${resName}Click`],
              width: res[`${resName}Click`].width,
              height: res[`${resName}Click`].height,
              offsetX: res[`${resName}Click`].width / 2,
              offsetY: res[`${resName}Click`].height / 2,
            }),
          );

          pin.on('pointerup', () =>
            pin.setAttrs({
              image: res[resName],
              width: res[resName].width,
              height: res[resName].height,
              offsetX: res[resName].width / 2,
              offsetY: res[resName].height / 2,
            }),
          );
        }
      });

      runtime.boardLayer.add(
        new Konva.Image({
          id: 'pin-name',
          x: 4,
          y: -95,
          scaleY: runtime.stage.scaleY(),
          image: res.pinName,
          width: res.pinName.width,
          height: res.pinName.height,
          offsetX: res.pinName.width / 2,
          offsetY: res.pinName.height / 2,
        }),
      );

      return () => {
        // document.removeEventListener('keydown', runtime.handleKeyDown);
        // document.removeEventListener('keyup', runtime.handleKeyUp);
        onRuntime(null);
      };
    },
    [onRuntime],
  );

  return (
    <Emulator
      id="iotbit-emulator"
      zoom={appState.value?.stageSize !== StageConfig.Large ? 0.8 : 1}
      width={StageConfig.Width}
      height={StageConfig.Height}
      onRuntime={handleRuntime}
    />
  );
}
