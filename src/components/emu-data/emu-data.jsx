import { useCallback } from 'preact/hooks';
import { useSignal, useSignalEffect } from '@preact/signals';
import { MathUtils } from '@blockcode/utils';
import { useAppContext, Text, Label, ToggleButtons, BufferedInput, Button } from '@blockcode/core';
import { DirectionPicker } from '../direction-picker/direction-picker';
import { SliderPicker } from '../slider-picker/slider-picker';
import { StageConfig } from '../emulator/emulator-config';
import { getBoardPins } from '../../blocks/pins';

import styles from './emu-data.module.css';
import num0icon from './icon-num0.svg';
import num1icon from './icon-num1.svg';

const boardPins = getBoardPins();

export function EmuData({ runtime }) {
  const { appState } = useAppContext();

  const brightness = useSignal(0);
  const loudness = useSignal(0);
  const temperature = useSignal(37);
  const heading = useSignal(0);
  const accelerometer = useSignal([0, 0, 1]);
  const gyroscope = useSignal([0, 0, 0]);
  const analogPins = useSignal(false);
  const touchPins = useSignal(false);
  const pins = useSignal({});

  useSignalEffect(() => {
    if (!runtime.value) return;
    if (!appState.value?.running) return;
    runtime.value.setData('brightness', brightness.value);
    runtime.value.setData('loudness', loudness.value);
    runtime.value.setData('temperature', temperature.value);
    runtime.value.setData('heading', heading.value);
    runtime.value.setData('accelerometer-x', accelerometer.value[0]);
    runtime.value.setData('accelerometer-y', accelerometer.value[1]);
    runtime.value.setData('accelerometer-z', accelerometer.value[2]);
    runtime.value.setData(
      'accelerometer-strength',
      Math.sqrt(accelerometer.value[0] ** 2 + accelerometer.value[1] ** 2 + accelerometer.value[2] ** 2),
    );
    runtime.value.setData('gyroscope-pitch', gyroscope.value[0]);
    runtime.value.setData('gyroscope-roll', gyroscope.value[1]);
    runtime.value.setData('gyroscope-yaw', gyroscope.value[2]);
    for (const [pin, value] of Object.entries(pins.value)) {
      runtime.value.setData(pin, value);
    }
  });

  const accelerometerLabel = (
    <div>
      <Label
        secondary
        text={
          <Text
            id="iotbit.emu.accelerometer"
            defaultMessage="Accelerometer"
          />
        }
      />
      <Label
        secondary
        text="X"
      >
        <SliderPicker
          min={-2000}
          max={2000}
          value={accelerometer.value[0]}
          onChange={useCallback(
            (val) =>
              (accelerometer.value = [
                MathUtils.clamp(Math.round(val), -2000, 2000),
                accelerometer.value[1],
                accelerometer.value[2],
              ]),
            [],
          )}
        >
          <BufferedInput
            small
            type="number"
            className={styles.marginRight}
            value={accelerometer.value[0]}
            onSubmit={useCallback(
              (val) =>
                (accelerometer.value = [
                  MathUtils.clamp(Math.round(val), -2000, 2000),
                  accelerometer.value[1],
                  accelerometer.value[2],
                ]),
              [],
            )}
          />
        </SliderPicker>
      </Label>
      <Label
        secondary
        text="Y"
      >
        <SliderPicker
          min={-2000}
          max={2000}
          value={accelerometer.value[1]}
          onChange={useCallback(
            (val) =>
              (accelerometer.value = [
                accelerometer.value[0],
                MathUtils.clamp(Math.round(val), -2000, 2000),
                accelerometer.value[2],
              ]),
            [],
          )}
        >
          <BufferedInput
            small
            type="number"
            className={styles.marginRight}
            value={accelerometer.value[1]}
            onSubmit={useCallback(
              (val) =>
                (accelerometer.value = [
                  accelerometer.value[0],
                  MathUtils.clamp(Math.round(val), -2000, 2000),
                  accelerometer.value[2],
                ]),
              [],
            )}
          />
        </SliderPicker>
      </Label>
      <Label
        secondary
        text="Z"
      >
        <SliderPicker
          min={-2000}
          max={2000}
          value={accelerometer.value[2]}
          onChange={useCallback(
            (val) =>
              (accelerometer.value = [
                accelerometer.value[0],
                accelerometer.value[1],
                MathUtils.clamp(Math.round(val), -2000, 2000),
              ]),
            [],
          )}
        >
          <BufferedInput
            small
            type="number"
            value={accelerometer.value[2]}
            onSubmit={useCallback(
              (val) =>
                (accelerometer.value = [
                  accelerometer.value[0],
                  accelerometer.value[1],
                  MathUtils.clamp(Math.round(val), -2000, 2000),
                ]),
              [],
            )}
          />
        </SliderPicker>
      </Label>
    </div>
  );

  const temperatureLabel = (
    <Label
      secondary
      text={
        <Text
          id="iotbit.emu.temperature"
          defaultMessage="Temperature"
        />
      }
    >
      <SliderPicker
        min={-10}
        max={60}
        value={temperature.value}
        onChange={(val) => (temperature.value = MathUtils.clamp(Math.round(val), -10, 60))}
      >
        <BufferedInput
          small
          type="number"
          value={temperature.value}
          onSubmit={useCallback((val) => (temperature.value = MathUtils.clamp(Math.round(val), -10, 60)), [])}
        />
      </SliderPicker>
    </Label>
  );

  return (
    <div className={styles.emuDataWrapper}>
      <div className={styles.row}>
        <Label
          secondary
          className={styles.marginRight}
          text={
            <Text
              id="iotbit.emu.brightness"
              defaultMessage="Brightness"
            />
          }
        >
          <SliderPicker
            max={1023}
            value={brightness.value}
            onChange={useCallback((val) => (brightness.value = MathUtils.clamp(Math.round(val), 0, 1023)), [])}
          >
            <BufferedInput
              small
              type="number"
              className={styles.marginRight}
              value={brightness.value}
              onSubmit={useCallback((val) => (brightness.value = MathUtils.clamp(Math.round(val), 0, 1023)), [])}
            />
          </SliderPicker>
        </Label>

        <Label
          secondary
          className={styles.marginRight}
          text={
            <Text
              id="iotbit.emu.loudness"
              defaultMessage="Loudness"
            />
          }
        >
          <SliderPicker
            max={1023}
            value={loudness.value}
            onChange={useCallback((val) => (loudness.value = MathUtils.clamp(Math.round(val), 0, 1023)), [])}
          >
            <BufferedInput
              small
              type="number"
              className={styles.marginRight}
              value={loudness.value}
              onSubmit={useCallback((val) => (loudness.value = MathUtils.clamp(Math.round(val), 0, 1023)), [])}
            />
          </SliderPicker>
        </Label>

        {appState.value?.stageSize === StageConfig.Large && temperatureLabel}
      </div>

      <div className={styles.row}>
        <Label
          secondary
          className={styles.marginRight}
          text={
            <Text
              id="iotbit.emu.compass"
              defaultMessage="Compass"
            />
          }
        >
          <DirectionPicker
            direction={heading.value}
            onChange={useCallback((val) => (heading.value = MathUtils.clamp(Math.round(val), 0, 360)), [])}
          >
            <BufferedInput
              small
              type="number"
              className={styles.marginRight}
              value={heading.value}
              onSubmit={useCallback((val) => (heading.value = MathUtils.clamp(Math.round(val), 0, 360)), [])}
            />
          </DirectionPicker>
        </Label>

        {appState.value?.stageSize === StageConfig.Large ? accelerometerLabel : temperatureLabel}
      </div>

      {appState.value?.stageSize !== StageConfig.Large && <div className={styles.row}>{accelerometerLabel}</div>}

      <div className={styles.row}>
        <div>
          <Label
            secondary
            text={
              <Text
                id="iotbit.emu.rotation"
                defaultMessage="Rotation"
              />
            }
          />
          <Label
            secondary
            text={
              <Text
                id="iotbit.emu.pitch"
                defaultMessage="Pitch"
              />
            }
          >
            <SliderPicker
              min={-90}
              max={90}
              value={gyroscope.value[0]}
              onChange={useCallback(
                (val) =>
                  (gyroscope.value = [
                    MathUtils.clamp(Math.round(val), -90, 90),
                    gyroscope.value[1],
                    gyroscope.value[2],
                  ]),
                [],
              )}
            >
              <BufferedInput
                small
                type="number"
                className={styles.marginRight}
                value={gyroscope.value[0]}
                onSubmit={useCallback(
                  (val) =>
                    (gyroscope.value = [
                      MathUtils.clamp(Math.round(val), -90, 90),
                      gyroscope.value[1],
                      gyroscope.value[2],
                    ]),
                  [],
                )}
              />
            </SliderPicker>
          </Label>

          <Label
            secondary
            text={
              <Text
                id="iotbit.emu.roll"
                defaultMessage="Roll"
              />
            }
          >
            <SliderPicker
              min={-180}
              max={180}
              value={gyroscope.value[1]}
              onChange={useCallback(
                (val) =>
                  (gyroscope.value = [
                    gyroscope.value[0],
                    MathUtils.clamp(Math.round(val), -180, 180),
                    gyroscope.value[2],
                  ]),
                [],
              )}
            >
              <BufferedInput
                small
                type="number"
                className={styles.marginRight}
                value={gyroscope.value[1]}
                onSubmit={useCallback(
                  (val) =>
                    (gyroscope.value = [
                      gyroscope.value[0],
                      MathUtils.clamp(Math.round(val), -180, 180),
                      gyroscope.value[2],
                    ]),
                  [],
                )}
              />
            </SliderPicker>
          </Label>

          <Label
            secondary
            text={
              <Text
                id="iotbit.emu.yaw"
                defaultMessage="Yaw"
              />
            }
          >
            <SliderPicker
              min={-180}
              max={180}
              value={gyroscope.value[2]}
              onChange={useCallback(
                (val) =>
                  (gyroscope.value = [
                    gyroscope.value[0],
                    gyroscope.value[1],
                    MathUtils.clamp(Math.round(val), -180, 180),
                  ]),
                [],
              )}
            >
              <BufferedInput
                small
                type="number"
                value={gyroscope.value[2]}
                onSubmit={useCallback(
                  (val) =>
                    (gyroscope.value = [
                      gyroscope.value[0],
                      gyroscope.value[1],
                      MathUtils.clamp(Math.round(val), -180, 180),
                    ]),
                  [],
                )}
              />
            </SliderPicker>
          </Label>
        </div>
      </div>

      <div className={appState.value?.stageSize === StageConfig.Large ? styles.rowPinsLarge : styles.rowPinsSmall}>
        <div className={styles.pinsType}>
          <div
            className={analogPins.value || touchPins.value ? styles.pinsTypeItem : styles.pinsTypeItemActive}
            onClick={useCallback(() => (analogPins.value = touchPins.value = false), [])}
          >
            <Text
              id="iotbit.emu.pins"
              defaultMessage="Pins"
            />
          </div>
          <div
            className={analogPins.value ? styles.pinsTypeItemActive : styles.pinsTypeItem}
            onClick={useCallback(() => ((analogPins.value = true), (touchPins.value = false)), [])}
          >
            <Text
              id="iotbit.emu.analogPins"
              defaultMessage="Analog Pins"
            />
          </div>
          <div
            className={touchPins.value ? styles.pinsTypeItemActive : styles.pinsTypeItem}
            onClick={useCallback(() => ((touchPins.value = true), (analogPins.value = false)), [])}
          >
            <Text
              id="iotbit.emu.touchPins"
              defaultMessage="Touch Pins"
            />
          </div>
          <div className={styles.pinsTypeBlank}></div>
        </div>

        <div className={styles.pinsWrapper}>
          <div className={styles.pins}>
            {touchPins.value
              ? boardPins.touch.map(([pinName, pin]) => (
                  <Button
                    onMouseUp={() => (pins.value = { ...pins.value, [pin]: 700 })}
                    onMouseDown={() => {
                      if (pins.value[pin] > 10) {
                        runtime.value.call(`touched:${pin}`);
                      }
                      pins.value = { ...pins.value, [pin]: 10 };
                    }}
                  >
                    {pinName}
                  </Button>
                ))
              : analogPins.value
                ? boardPins.adc.map(([pinName, pin], index) => (
                    <Label
                      secondary
                      text={pinName}
                    >
                      <SliderPicker
                        max={1023}
                        placement={index % 3 === 0 ? 'bottom-start' : index % 3 === 1 ? 'bottom' : 'bottom-end'}
                        value={pins.value[pin] ?? 0}
                        onChange={(val) =>
                          (pins.value = { ...pins.value, [pin]: MathUtils.clamp(Math.round(val), 0, 1023) })
                        }
                      >
                        <BufferedInput
                          small
                          type="number"
                          value={pins.value[pin] ?? 0}
                          onSubmit={(val) =>
                            (pins.value = { ...pins.value, [pin]: MathUtils.clamp(Math.round(val), 0, 1023) })
                          }
                        />
                      </SliderPicker>
                    </Label>
                  ))
                : boardPins.all.map(([pinName, pin]) => (
                    <Label
                      secondary
                      text={pinName}
                    >
                      <ToggleButtons
                        rounded
                        items={[
                          {
                            icon: num0icon,
                            title: (
                              <Text
                                id="esp32.blocks.digitalLow"
                                defaultMessage="low"
                              />
                            ),
                            value: false,
                          },
                          {
                            icon: num1icon,
                            title: (
                              <Text
                                id="esp32.blocks.digitalHigh"
                                defaultMessage="high"
                              />
                            ),
                            value: true,
                          },
                        ]}
                        value={pins.value[pin] > 459}
                        onChange={(val) => (pins.value = { ...pins.value, [pin]: val ? 1023 : 0 })}
                      />
                    </Label>
                  ))}
          </div>
        </div>
      </div>
    </div>
  );
}
