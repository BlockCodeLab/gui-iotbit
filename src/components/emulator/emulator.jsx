import { useCallback, useEffect } from 'preact/hooks';
import { Konva } from '@blockcode/utils';
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

  const { file } = useProjectContext();

  // 运行模拟器
  useEffect(async () => {
    if (!runtime) return;

    // 重置和停止
    if (splashVisible.value === true || (appState.value?.running === false && runtime.running)) {
      runtime.stop();
      runtime.clearLeds();
      runtime.clearScreen();
      return;
    }

    // 启动
    if (appState.value?.running === true) {
      const code = `((/*${file.value.name}*/) => {\n${file.value.script}})();`;
      runtime.launch(`${code}\n\nruntime.start();`);
    }
  }, [runtime, appState.value?.running]);

  // 绑定模拟器运行时
  const handleRuntime = useCallback(
    async (stage) => {
      const runtime = new IotBitRuntime(stage);
      onRuntime?.(runtime);

      const res = {};

      // 创建硬件模拟
      res.iotbit = await runtime.loadImage(iotbitImage);
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
      res.display = await runtime.loadImage(displayImage);
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
      runtime.setScreen();

      // LED
      [-40, 0, 40].forEach((x, i) => {
        const led = new Konva.Rect({
          id: 'led-' + i,
          x: x - 4,
          y: 83,
          scaleY: runtime.stage.scaleY(),
          width: 8,
          height: 6,
          fill: 'white',
        });
        runtime.spritesLayer.add(led);
      });

      // 按钮
      res.button = await runtime.loadImage(buttonImage);
      ['a', 'b'].forEach((id, i) => {
        const button = new Konva.Image({
          id: 'button-' + id,
          name: id,
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

        // 按键触发
        button.on('pointerclick', ({ evt, target }) => {
          if (evt.shiftKey) {
            runtime.call('pressed:a+b');
          } else {
            runtime.call(`pressed:${target.name()}`);
          }
        });

        button.on('pointerdown', ({ evt, target }) => {
          if (evt.shiftKey) {
            runtime.setData(`button-a`, true);
            runtime.setData(`button-b`, true);
            runtime.setData(`button-ab`, true);
            runtime.querySelector('#button-a')?.setAttrs({
              image: res.buttonClick,
              width: res.buttonClick.width,
              height: res.buttonClick.height,
              offsetX: res.buttonClick.width / 2,
              offsetY: res.buttonClick.height / 2,
            });
            runtime.querySelector('#button-b')?.setAttrs({
              image: res.buttonClick,
              width: res.buttonClick.width,
              height: res.buttonClick.height,
              offsetX: res.buttonClick.width / 2,
              offsetY: res.buttonClick.height / 2,
            });
            return;
          }
          runtime.setData(target.id(), true);
          target.setAttrs({
            image: res.buttonClick,
            width: res.buttonClick.width,
            height: res.buttonClick.height,
            offsetX: res.buttonClick.width / 2,
            offsetY: res.buttonClick.height / 2,
          });
        });

        button.on('pointerup', () => {
          runtime.setData(`button-a`, false);
          runtime.setData(`button-b`, false);
          runtime.setData(`button-ab`, false);
          runtime.querySelector('#button-a')?.setAttrs({
            image: res.button,
            width: res.button.width,
            height: res.button.height,
            offsetX: res.button.width / 2,
            offsetY: res.button.height / 2,
          });
          runtime.querySelector('#button-b')?.setAttrs({
            image: res.button,
            width: res.button.width,
            height: res.button.height,
            offsetX: res.button.width / 2,
            offsetY: res.button.height / 2,
          });
        });
      });
      res.buttonClick = await runtime.loadImage(buttonClickImage);

      // 引脚
      res.pin = await runtime.loadImage(pinImage);
      res.pin0 = await runtime.loadImage(pin0Image);
      res.pinGND = await runtime.loadImage(pinGNDImage);
      ['0', '1', '2', '3v', 'gnd'].forEach((id, i) => {
        const resName = i > 0 && i < 4 ? 'pin' : `pin${id.toUpperCase()}`;
        const pin = new Konva.Image({
          id: 'touch_' + id,
          name: id,
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

        // 0, 1 可以触摸控制
        if (i < 2) {
          // 引脚触发
          let touched = false;
          pin.on('pointerdown', ({ target }) => {
            runtime.setData('P' + target.name(), 1023);
            runtime.setData(target.id(), 10);
            if (!touched) {
              touched = true;
              runtime.call(`touched:${target.id()}`);
            }
            target.setAttrs({
              image: res[`${resName}Click`],
              width: res[`${resName}Click`].width,
              height: res[`${resName}Click`].height,
              offsetX: res[`${resName}Click`].width / 2,
              offsetY: res[`${resName}Click`].height / 2,
            });
          });

          pin.on('pointerup', ({ target }) => {
            runtime.setData('P' + target.name(), 0);
            runtime.setData(target.id(), 700);
            touched = false;
            target.setAttrs({
              image: res[resName],
              width: res[resName].width,
              height: res[resName].height,
              offsetX: res[resName].width / 2,
              offsetY: res[resName].height / 2,
            });
          });
        }
      });
      res.pinClick = await runtime.loadImage(pinClickImage);
      res.pin0Click = await runtime.loadImage(pin0ClickImage);
      res.pinGNDClick = await runtime.loadImage(pinGNDClickImage);

      res.pinName = await runtime.loadImage(pinNameImage);
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
          listening: false,
        }),
      );

      return () => {
        onRuntime?.(null);
      };
    },
    [onRuntime],
  );

  return (
    <Emulator
      id="iotbit-emulator"
      zoom={appState.value?.stageSize === StageConfig.Small ? 1 : 1.3}
      width={StageConfig.Width}
      height={StageConfig.Height}
      onRuntime={handleRuntime}
    />
  );
}
