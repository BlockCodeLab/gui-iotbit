import { themeColors, translate } from '@blockcode/core';
import { ScratchBlocks } from '@blockcode/blocks';
import { getBoardPins } from './pins';

const pins = getBoardPins();

export default () => ({
  id: 'sensing',
  name: '%{BKY_CATEGORY_SENSING}',
  themeColor: themeColors.blocks.sensing.primary,
  inputColor: themeColors.blocks.sensing.secondary,
  otherColor: themeColors.blocks.sensing.tertiary,
  order: 7,
  blocks: [
    {
      // 按键按下
      id: 'keypressed',
      text: ScratchBlocks.Msg.SENSING_KEYPRESSED,
      output: 'boolean',
      inputs: {
        KEY_OPTION: {
          menu: [
            ['a', 'a'],
            ['b', 'b'],
            ['a+b', 'ab'],
          ],
        },
      },
      mpy(block) {
        const key = block.getFieldValue('KEY_OPTION');
        const code = `button_${key}.is_pressed()`;
        return [code, this.ORDER_FUNCTION_CALL];
      },
      emu(block) {
        const key = block.getFieldValue('KEY_OPTION');
        const code = `runtime.getData('button-${key}', false)`;
        return [code];
      },
    },
    '---',
    {
      id: 'magneticForce',
      text: translate('iotbit.blocks.magneticForce', 'magnetic force %1'),
      output: 'number',
      inputs: {
        MAGNETIC_OPTION: {
          menu: 'xyz',
        },
      },
      mpy(block) {
        const option = block.getFieldValue('MAGNETIC_OPTION');
        this.definitions_['compass_calibrate'] = 'if not compass.is_calibrated(): compass.calibrate(display)';
        const code = `compass.get_${option}()`;
        return [code, this.ORDER_FUNCTION_CALL];
      },
      emu(block) {
        const code = '0';
        return [code];
      },
    },
    {
      id: 'compassHeading',
      text: translate('iotbit.blocks.compassHeading', 'compass heading'),
      output: 'number',
      mpy(block) {
        this.definitions_['compass_calibrate'] = 'if not compass.is_calibrated(): compass.calibrate(display)';
        const code = 'compass.get_heading()';
        return [code, this.ORDER_FUNCTION_CALL];
      },
      emu(block) {
        const code = `runtime.getData('heading', 0)`;
        return [code];
      },
    },
    {
      id: 'calibrateCompass',
      text: translate('iotbit.blocks.calibrateCompass', 'calibrate compass'),
      mpy(block) {
        const code = 'compass.calibrate(display)\n';
        return code;
      },
    },
    '---',
    {
      id: 'acceleration',
      text: translate('iotbit.blocks.acceleration', 'acceleration %1'),
      output: 'number',
      inputs: {
        XYZ_OPTION: {
          menu: 'xyz',
        },
      },
      mpy(block) {
        const option = block.getFieldValue('XYZ_OPTION');
        const code = `accelerometer.get_${option}()`;
        return [code, this.ORDER_FUNCTION_CALL];
      },
      emu(block) {
        const option = block.getFieldValue('XYZ_OPTION');
        const code = `runtime.getData('accelerometer-${option}', 0)`;
        return [code];
      },
    },
    {
      id: 'accelerometerRange',
      text: translate('iotbit.blocks.accelerometerRange', 'set accelerometer range %1'),
      inputs: {
        RANGE_OPTION: {
          menu: [
            ['2g', '0'],
            ['4g', '1'],
            ['8g', '2'],
          ],
        },
      },
      mpy(block) {
        const option = block.getFieldValue('RANGE_OPTION');
        const code = `accelerometer.set_range(${option})\n`;
        return code;
      },
    },
    '---',
    // {
    //   id: 'gyroscope',
    //   text: translate('iotbit.blocks.gyroscope', 'gyroscope %1'),
    //   output: 'number',
    //   inputs: {
    //     XYZ_OPTION: {
    //       menu: 'xyz',
    //     },
    //   },
    //   mpy(block) {
    //     const option = block.getFieldValue('XYZ_OPTION');
    //     const code = `gyroscope.get_${option}()`;
    //     return [code, this.ORDER_FUNCTION_CALL];
    //   },
    // },
    {
      id: 'rotation',
      text: translate('iotbit.blocks.rotation', 'rotation %1'),
      output: 'number',
      inputs: {
        ROTATE_OPTION: {
          menu: [
            [translate('iotbit.blocks.rotationPitch', 'pitch'), 'pitch'],
            [translate('iotbit.blocks.rotationRoll', 'roll'), 'roll'],
            [translate('iotbit.blocks.rotationYaw', 'yaw'), 'yaw'],
          ],
        },
      },
      mpy(block) {
        const option = block.getFieldValue('ROTATE_OPTION');
        const code = `gyroscope.get_${option}()`;
        return [code, this.ORDER_FUNCTION_CALL];
      },
      emu(block) {
        const option = block.getFieldValue('ROTATE_OPTION');
        const code = `runtime.getData('gyroscope-${option}', 0)`;
        return [code];
      },
    },
    // {
    //   id: 'gesture',
    //   text: translate('iotbit.blocks.gesture', 'is %1 gesture'),
    //   output: 'boolean',
    //   inputs: {
    //     OPTION: {
    //       menu: [
    //         [translate('iotbit.blocks.gestureShake', 'shake'), 'shake'],
    //         [translate('iotbit.blocks.gestureLedsUp', 'leds up'), 'leds_up'],
    //         [translate('iotbit.blocks.gestureLedsDown', 'leds down'), 'leds_down'],
    //         [translate('iotbit.blocks.gestureScreenUp', 'screen up'), 'screen_up'],
    //         [translate('iotbit.blocks.gestureScreenDown', 'screen down'), 'screen_down'],
    //         [translate('iotbit.blocks.gestureTiltLeft', 'tilt left'), 'tilt_left'],
    //         [translate('iotbit.blocks.gestureTiltRight', 'tilt right'), 'tilt_right'],
    //         [translate('iotbit.blocks.gestureFreeFall', 'free fall'), 'free_fall'],
    //         [translate('iotbit.blocks.gesture3g', '3g'), '3g'],
    //         [translate('iotbit.blocks.gesture6g', '6g'), '6g'],
    //         [translate('iotbit.blocks.gesture8g', '8g'), '8g'],
    //       ],
    //     },
    //   },
    //   mpy(block) {},
    // },
    '---',
    {
      id: 'brightness',
      text: translate('iotbit.blocks.brightness', 'brightness'),
      output: 'number',
      mpy(block) {
        const code = 'light.get_brightness()';
        return [code, this.ORDER_FUNCTION_CALL];
      },
      emu(block) {
        const code = `runtime.getData('brightness', 0)`;
        return [code];
      },
    },
    {
      id: 'loudness',
      text: translate('iotbit.blocks.loudness', 'loudness'),
      output: 'number',
      mpy(block) {
        const code = 'microphone.get_loudness()';
        return [code, this.ORDER_FUNCTION_CALL];
      },
      emu(block) {
        const code = `runtime.getData('loudness', 0)`;
        return [code];
      },
    },
    {
      id: 'temperature',
      text: translate('esp32.blocks.temperature', 'temperature'),
      output: 'number',
      mpy(block) {
        // this.definitions_['import_esp32'] = 'import esp32';
        // const code = 'round((esp32.raw_temperature() - 32) * 5 / 9, 3)';
        const code = 'accelerometer.get_temperature()';
        return [code, this.ORDER_FUNCTION_CALL];
      },
      emu(block) {
        const code = `runtime.getData('temperature', 0)`;
        return [code];
      },
    },
    '---',
    {
      // 运行时长
      id: 'runtime',
      text: translate('esp32.blocks.runtime', 'run time %1'),
      output: 'number',
      inputs: {
        UNIT: {
          menu: [
            [translate('esp32.blocks.runtimeMilliseconds', 'milliseconds'), 'MS'],
            [translate('esp32.blocks.runtimeSeconds', 'seconds'), 'SEC'],
          ],
        },
      },
      mpy(block) {
        const unit = block.getFieldValue('UNIT');
        let code = 'time.ticks_diff(time.ticks_ms(), _times__)';
        if (unit === 'SEC') {
          code = `(${code} / 1000)`;
        }
        return [code, this.ORDER_ATOMIC];
      },
      emu(block) {
        const unit = block.getFieldValue('UNIT');
        let code = 'runtime.times';
        if (unit === 'SEC') {
          code = `(${code} / 1000)`;
        }
        return [code];
      },
    },
    '---',
    {
      //
      id: 'i2c',
      text: translate('esp32.blocks.i2cScan', 'I2C pins scl:%1 sda:%2 devices scan'),
      inputs: {
        SCL: {
          menu: pins.all,
          defaultValue: pins.i2c.scl,
        },
        SDA: {
          menu: pins.all,
          defaultValue: pins.i2c.sda,
        },
      },
      mpy(_, args, defs) {
        const chan = args.SCL === pins.i2c.scl && args.SDA === pins.i2c.sda ? pins.i2c.channel : 1;
        const i2c = `i2c${chan}_${args.SCL}_${args.SDA}`;
        defs['import_pin'] = 'from machine import Pin';
        defs['import_i2c'] = 'from machine import I2C';
        defs[i2c] = `${i2c} = I2C(${chan}, scl=Pin(${args.SCL}), sda=Pin(${args.SDA}))`;
        const code = `print(${i2c}.scan())\n`;
        return code;
      },
    },
  ],
  menus: {
    xyz: {
      items: [
        ['x', 'x'],
        ['y', 'y'],
        ['z', 'z'],
        [translate('iotbit.blocks.strength', 'strength'), 'strength'],
      ],
    },
  },
});
