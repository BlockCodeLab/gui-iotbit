import { themeColors, translate } from '@blockcode/core';
import { getBoardPins } from './pins';

export default (boardType, i) => {
  const pins = getBoardPins(boardType);

  return {
    id: 'sensing',
    name: '%{BKY_CATEGORY_SENSING}',
    themeColor: themeColors.blocks.sensing.primary,
    inputColor: themeColors.blocks.sensing.secondary,
    otherColor: themeColors.blocks.sensing.tertiary,
    order: i,
    blocks: [
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
        mpy(_, args) {
          let code = 'time.ticks_diff(time.ticks_ms(), _times__)';
          if (args.UNIT === 'SEC') {
            code = `(${code}/1000)`;
          }
          return [code];
        },
      },
      '---',
      {
        id: 'temperature',
        text: translate('esp32.blocks.temperature', 'temperature'),
        output: 'number',
        mpy(_, args, defs) {
          defs['import_esp32'] = 'import esp32';
          const code = '((esp32.raw_temperature()-32)*5/9)';
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
          },
          SDA: {
            menu: pins.all,
          },
        },
        mpy(_, args, defs) {
          const i2c = `i2c_${args.SCL}_${args.SDA}`;
          defs['import_pin'] = 'from machine import Pin';
          defs['import_i2c'] = 'from machine import I2C';
          defs[i2c] = `${i2c} = I2C(1, scl=Pin(${args.SCL}), sda=Pin(${args.SDA}))`;
          const code = `print(${i2c}.scan())\n`;
          return code;
        },
      },
    ],
  };
};
