import { translate, themeColors } from '@blockcode/core';
import { getBoardPins } from './pins';

export default (boardType, i) => {
  const pins = getBoardPins(boardType);

  return {
    id: 'serial',
    name: translate('esp32.blocks.serial', 'Serial'),
    themeColor: '#a37af5',
    inputColor: '#9167e3',
    otherColor: '#7d52d4',
    order: i,
    blocks: [
      {
        // 波特率
        id: 'baudrate',
        text: translate('esp32.blocks.serialBaudrate', 'set port %1 pins RX:%2 TX:%3 baudrate to %4'),
        inputs: {
          PORT: {
            menu: [
              ['#0', '0'],
              ['#1', '1'],
              ['#2', '2'],
            ],
            defaultValue: '1',
          },
          RX: {
            menu: pins.in,
          },
          TX: {
            menu: pins.out,
          },
          BAUDRATE: {
            menu: {
              items: ['115200', '57600', '38400', '19200', '9600', '4800'],
            },
          },
        },
        mpy(_, args, defs) {
          defs['import_pin'] = 'from machine import Pin';
          defs['import_uart'] = 'from machine import UART';
          const port = `uart${args.PORT}`;
          defs[port] = `${port} = UART(${args.PORT}, ${args.BAUDRATE}, rx=Pin(${args.RX}), tx=Pin(${args.TX}))`;
          return '';
        },
      },
      {
        // 打印
        id: 'send',
        text: translate('esp32.blocks.serialPrint', 'port %1 write %2 with %3'),
        inputs: {
          PORT: {
            menu: [
              ['#0', '0'],
              ['#1', '1'],
              ['#2', '2'],
            ],
            defaultValue: '1',
          },
          STRING: {
            type: 'string',
            defaultValue: 'hello',
          },
          MODE: {
            menu: [
              [translate('esp32.blocks.serialPrintWarp', 'warp'), 'WARP'],
              [translate('esp32.blocks.serialPrintNoWarp', 'no-warp'), 'NOWARP'],
              [translate('esp32.blocks.serialPrintHEX', 'hex'), 'HEX'],
            ],
          },
        },
        mpy(_, args, defs) {
          const port = `uart${args.PORT}`;
          if (!defs[port]) {
            defs['import_uart'] = 'from machine import UART';
            defs[port] = `${port} = UART(${args.PORT})`;
          }

          let code = '';
          code += `${port}.write(f'{${args.STRING}`;
          if (args.MODE === 'HEX') {
            code += `:#x`;
          }
          code += `}`;
          if (args.MODE === 'WARP') {
            code += `\\n`;
          }
          code += `')\n`;
          return code;
        },
      },
      '---',
      {
        // 接收到？
        id: 'available',
        text: translate('esp32.blocks.serialAvailable', 'port %1 available data?'),
        output: 'boolean',
        inputs: {
          PORT: {
            menu: [
              ['#0', '0'],
              ['#1', '1'],
              ['#2', '2'],
            ],
            defaultValue: '1',
          },
        },
        mpy(_, args, defs) {
          const port = `uart${args.PORT}`;
          if (!defs[port]) {
            defs['import_uart'] = 'from machine import UART';
            defs[port] = `${port} = UART(${args.PORT})`;
          }
          return [`${port}.any()`];
        },
      },
      {
        // 读取长度字节
        id: 'read_bytes',
        text: translate('esp32.blocks.serialReadBytes', 'port %1 read %2 characters'),
        output: true,
        inputs: {
          PORT: {
            menu: [
              ['#0', '0'],
              ['#1', '1'],
              ['#2', '2'],
            ],
            defaultValue: '1',
          },
          LEN: {
            type: 'integer',
            defaultValue: 2,
          },
        },
        mpy(_, args, defs) {
          const port = `uart${args.PORT}`;
          if (!defs[port]) {
            defs['import_uart'] = 'from machine import UART';
            defs[port] = `${port} = UART(${args.PORT})`;
          }
          return [`${port}.read(${args.LEN}).decode('utf-8')`];
        },
      },
      {
        // 读取文本直到
        id: 'read_string_line',
        text: translate('esp32.blocks.serialReadStringLine', 'port %1 read a line'),
        output: 'string',
        inputs: {
          PORT: {
            menu: [
              ['#0', '0'],
              ['#1', '1'],
              ['#2', '2'],
            ],
            defaultValue: '1',
          },
        },
        mpy(_, args, defs) {
          const port = `uart${args.PORT}`;
          if (!defs[port]) {
            defs['import_uart'] = 'from machine import UART';
            defs[port] = `${port} = UART(${args.PORT})`;
          }
          return [`${port}.readline().decode('utf-8')`];
        },
      },
      {
        // 读取文本
        id: 'read_string',
        text: translate('esp32.blocks.serialReadString', 'port %1 read all characters'),
        output: 'string',
        inputs: {
          PORT: {
            menu: [
              ['#0', '0'],
              ['#1', '1'],
              ['#2', '2'],
            ],
            defaultValue: '1',
          },
        },
        mpy(_, args, defs) {
          const port = `uart${args.PORT}`;
          if (!defs[port]) {
            defs['import_uart'] = 'from machine import UART';
            defs[port] = `${port} = UART(${args.PORT})`;
          }
          return [`${port}.read().decode('utf-8')`];
        },
      },
      '---',
      {
        id: 'print',
        text: translate('esp32.blocks.terminalPrint', 'print %1 with %2'),
        themeColor: themeColors.blocks.debug.primary,
        inputColor: themeColors.blocks.debug.secondary,
        otherColor: themeColors.blocks.debug.tertiary,
        inputs: {
          STRING: {
            type: 'string',
            defaultValue: 'hello',
          },
          MODE: {
            menu: [
              [translate('esp32.blocks.serialPrintWarp', 'warp'), 'WARP'],
              [translate('esp32.blocks.serialPrintNoWarp', 'no-warp'), 'NOWARP'],
              [translate('esp32.blocks.serialPrintHEX', 'hex'), 'HEX'],
            ],
          },
        },
        mpy(_, args) {
          let code = '';
          code += `print(f'{${args.STRING}`;
          if (args.MODE === 'HEX') {
            code += `:#x`;
          }
          code += `}'`;
          if (args.MODE === 'NOWARP') {
            code += `,end=''`;
          }
          code += ')\n';
          return code;
        },
      },
    ],
  };
};
