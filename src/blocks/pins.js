import { translate, themeColors } from '@blockcode/core';

const PINS = [
  ['P0', 'P0'],
  ['P1', 'P1'],
  ['P2', 'P2'],
  ['P3', 'P3'],
  ['P4', 'P4'],
  ['P5', 'P5'],
  ['P6', 'P6'],
  ['P7', 'P7'],
  ['P8', 'P8'],
  ['P9', 'P9'],
  ['P10', 'P10'],
  ['P11', 'P11'],
  // ['P12', 'P12'],
  ['P13', 'P13'],
  ['P14', 'P14'],
  ['P15', 'P15'],
  ['P16', 'P16'],
  ['P19', 'P19'],
  ['P20', 'P20'],
  ['P23', 'P23'],
  ['P24', 'P24'],
  ['P25', 'P25'],
  ['P26', 'P26'],
  ['P27', 'P27'],
  ['P28', 'P28'],
];
const OUT_PINS = [
  ['P0', 'P0'],
  ['P1', 'P1'],
  // ['P2', 'P2'],
  // ['P3', 'P3'],
  // ['P4', 'P4'],
  ['P5', 'P5'],
  ['P6', 'P6'],
  ['P7', 'P7'],
  ['P8', 'P8'],
  ['P9', 'P9'],
  // ['P10', 'P10'],
  ['P11', 'P11'],
  // ['P12', 'P12'],
  ['P13', 'P13'],
  ['P14', 'P14'],
  ['P15', 'P15'],
  ['P16', 'P16'],
  ['P19', 'P19'],
  ['P20', 'P20'],
  ['P23', 'P23'],
  ['P24', 'P24'],
  ['P25', 'P25'],
  ['P26', 'P26'],
  ['P27', 'P27'],
  ['P28', 'P28'],
];
const ADC_PINS = [
  ['P0', 'P0'],
  ['P1', 'P1'],
  ['P2', 'P2'],
  ['P3', 'P3'],
  ['P4', 'P4'],
  ['P5', 'P5'],
  ['P8', 'P8'],
  ['P9', 'P9'],
  ['P10', 'P10'],
  ['P11', 'P11'],
  ['P23', 'P23'],
  ['P24', 'P24'],
  ['P25', 'P25'],
  ['P26', 'P26'],
  ['P27', 'P27'],
  ['P28', 'P28'],
];
const DAC_PINS = [
  ['P8', 'P8'],
  ['P9', 'P9'],
];
const I2C_CHANS = [{ SCL: 'P19', SDA: 'P20' }];

export const getBoardPins = () => ({
  all: PINS,
  in: PINS,
  out: OUT_PINS,
  adc: ADC_PINS,
  dac: DAC_PINS,
  pwm: OUT_PINS,
  i2c: I2C_CHANS,
});

export default () => {
  const boardPins = getBoardPins();
  return {
    id: 'pin',
    name: translate('esp32.blocks.pin', 'Pins'),
    themeColor: themeColors.blocks.motion.primary,
    inputColor: themeColors.blocks.motion.secondary,
    otherColor: themeColors.blocks.motion.tertiary,
    order: 0,
    blocks: [
      {
        // 设置模式
        id: 'setmode',
        text: translate('esp32.blocks.setmode', 'set pin %1 mode to %2'),
        inputs: {
          PIN: {
            menu: boardPins.all,
          },
          MODE: {
            menu: [
              [translate('esp32.blocks.ouputMode', 'output'), 'OUTPUT'],
              [translate('esp32.blocks.inputMode', 'input'), 'INPUT'],
              [translate('esp32.blocks.inputPullUpMode', 'input pull-up'), 'INPUT_PULLUP'],
              [translate('esp32.blocks.inputPullDownMode', 'input pull-down'), 'INPUT_PULLDOWN'],
            ],
          },
        },
        mpy(block) {
          const pinName = block.getFieldValue('PIN');
          const mode = block.getFieldValue('MODE') || 'OUTPUT';
          this.definitions_['import_pin'] = 'from machine import Pin';

          let code = '';
          if (mode === 'INPUT') {
            code = `${pinName}.init(Pin.IN)`;
          } else if (mode === 'INPUT_PULLUP') {
            code = `${pinName}.init(Pin.IN, Pin.PULL_UP)`;
          } else if (mode === 'INPUT_PULLDOWN') {
            code = `${pinName}.init(Pin.IN, Pin.PULL_DOWN)`;
          } else {
            code = `${pinName}.init(Pin.OUT)`;
          }
          this.definitions_[pinName] = code;

          return '';
        },
      },
      '---',
      {
        // 数字引脚设为
        id: 'setdigital',
        text: translate('esp32.blocks.setdigital', 'set pin %1 to %2'),
        inputs: {
          PIN: {
            menu: boardPins.out,
          },
          VALUE: {
            inputMode: true,
            type: 'integer',
            defaultValue: '1',
            menu: [
              [translate('esp32.blocks.digitalHigh', 'high'), '1'],
              [translate('esp32.blocks.digitalLow', 'low'), '0'],
            ],
          },
        },
        mpy(block) {
          const pinName = block.getFieldValue('PIN');
          const value = this.valueToCode(block, 'VALUE', this.ORDER_NONE);
          this.definitions_['import_pin'] = 'from machine import Pin';
          this.definitions_[pinName] = `${pinName}.init(Pin.OUT)`;
          const code = `${pinName}.value(${value})\n`;
          return code;
        },
      },
      {
        // 模拟引脚设为
        id: 'setDAC',
        text: translate('esp32.blocks.setanalog', 'set pin %1 analog to %2'),
        inputs: {
          PIN: {
            menu: boardPins.dac,
          },
          VALUE: {
            shadow: 'slider255',
          },
        },
        mpy(block) {
          const pinName = block.getFieldValue('PIN');
          const value = this.valueToCode(block, 'VALUE', this.ORDER_NONE);
          this.definitions_['import_dac'] = 'from machine import DAC';
          this.definitions_[`D${pinName}`] = `D${pinName} = DAC(${pinName})`;
          const code = `D${pinName}.write(${value})\n`;
          return code;
        },
      },
      {
        // 0-255 滑块
        id: 'slider255',
        shadow: true,
        output: 'integer',
        inputs: {
          VALUE: {
            type: 'slider',
            min: 0,
            max: 255,
            step: 1,
            defaultValue: 128,
          },
        },
        mpy(block) {
          const value = block.getFieldValue('VALUE') || 0;
          return [value, this.ORDER_ATOMIC];
        },
        emu(block) {
          const value = block.getFieldValue('VALUE') || 0;
          return [value, this.ORDER_ATOMIC];
        },
      },
      {
        // 数字引脚是否为高电平？
        id: 'digital',
        text: translate('esp32.blocks.isDigitalHigh', 'pin %1 is high?'),
        output: 'boolean',
        inputs: {
          PIN: {
            menu: boardPins.in,
          },
        },
        mpy(block) {
          const pinName = block.getFieldValue('PIN');
          this.definitions_['import_pin'] = 'from machine import Pin';
          this.definitions_[pinName] = `${pinName}.init(Pin.IN)`;
          const code = `(${pinName}.value() == 1)`;
          return [code, this.ORDER_RELATIONAL];
        },
        emu(block) {
          const pinName = block.getFieldValue('PIN');
          const code = `(runtime.getData("${pinName}", 0) > 459)`;
          return [code];
        },
      },
      {
        // 数字引脚是否为低电平？
        id: 'digitalLow',
        text: translate('esp32.blocks.isDigitalLow', 'pin %1 is low?'),
        output: 'boolean',
        inputs: {
          PIN: {
            menu: boardPins.all,
          },
        },
        mpy(block) {
          const pinName = block.getFieldValue('PIN');
          this.definitions_['import_pin'] = 'from machine import Pin';
          this.definitions_[pinName] = `${pinName}.init(Pin.IN)`;
          const code = `(${pinName}.value() == 0)`;
          return [code, this.ORDER_RELATIONAL];
        },
        emu(block) {
          const pinName = block.getFieldValue('PIN');
          const code = `(runtime.getData("${pinName}", 0) < 460)`;
          return [code];
        },
      },
      {
        // 模拟引脚值
        id: 'analog',
        text: translate('esp32.blocks.analogValue', 'pin %1 analog value'),
        output: 'integer',
        inputs: {
          PIN: {
            menu: boardPins.adc,
          },
        },
        mpy(block) {
          const pinName = block.getFieldValue('PIN');
          this.definitions_['import_adc'] = 'from machine import ADC';
          this.definitions_[`A${pinName}`] = `A${pinName} = ADC(${pinName})`;
          this.definitions_[`A${pinName}_atten`] = `A${pinName}.atten(ADC.ATTN_11DB)`;
          this.definitions_[`A${pinName}_width`] = `A${pinName}.width(ADC.WIDTH_10BIT)`;
          const code = `A${pinName}.read()`;
          return [code, this.ORDER_FUNCTION_CALL];
        },
        emu(block) {
          const pinName = block.getFieldValue('PIN');
          const code = `runtime.getData("${pinName}", 0)`;
          return [code];
        },
      },
      '---',
      {
        // PWM 引脚频率设为
        id: 'setPWMFreq',
        text: translate('esp32.blocks.setpwmfreq', 'set pin %1 pwm frequency to %2 Hz'),
        inputs: {
          PIN: {
            menu: boardPins.pwm,
          },
          FREQ: {
            type: 'integer',
            defaultValue: '1000',
          },
        },
        mpy(block) {
          const pinName = block.getFieldValue('PIN');
          const freq = this.valueToCode(block, 'FREQ', this.ORDER_NONE);
          this.definitions_['import_pwm'] = 'from machine import PWM';
          this.definitions_[`W${pinName}`] = `W${pinName} = PWM(${pinName}, freq=1000)`;
          const code = `W${pinName}.freq(${freq})\n`;
          return code;
        },
      },
      {
        // PWM 引脚设为
        id: 'setPWM',
        text: translate('esp32.blocks.setpwm', 'set pin %1 pwm to %2'),
        inputs: {
          PIN: {
            menu: boardPins.pwm,
          },
          VALUE: {
            shadow: 'slider1023',
          },
        },
        mpy(block) {
          const pinName = block.getFieldValue('PIN');
          const value = this.valueToCode(block, 'VALUE', this.ORDER_NONE);
          this.definitions_['import_pwm'] = 'from machine import PWM';
          this.definitions_[`W${pinName}`] = `W${pinName} = PWM(${pinName}, freq=1000)`;
          const code = `W${pinName}.duty(${value})\n`;
          return code;
        },
      },
      {
        // 0-1023 滑块
        id: 'slider1023',
        shadow: true,
        output: 'integer',
        inputs: {
          VALUE: {
            type: 'slider',
            min: 0,
            max: 1023,
            step: 1,
            defaultValue: 512,
          },
        },
        mpy(block) {
          const value = block.getFieldValue('VALUE') || 0;
          return [value, this.ORDER_ATOMIC];
        },
      },
      '---',
      {
        // 设置中断
        id: 'attachinterrupt',
        text: translate('esp32.blocks.attachinterrupt', 'attach pin %1 interrupt to %2'),
        substack: true,
        inputs: {
          PIN: {
            menu: boardPins.in,
          },
          INTERRUPT: {
            menu: [
              [translate('esp32.blocks.interruptRising', 'rising'), 'RISING'],
              [translate('esp32.blocks.interruptFalling', 'falling'), 'FALLING'],
              [translate('esp32.blocks.interruptChange', 'change'), 'CHANGE'],
              [translate('esp32.blocks.interruptHigh', 'high'), 'HIGH'],
              [translate('esp32.blocks.interruptLow', 'low'), 'LOW'],
            ],
          },
        },
        mpy(block) {
          const pinName = block.getFieldValue('PIN');
          const flagName = this.createName('event_flag');
          const interrupt = block.getFieldValue('INTERRUPT') || 'RISING';
          this.definitions_['import_pin'] = 'from machine import Pin';
          this.definitions_[pinName] = `${pinName}.init(Pin.IN)`;
          this.definitions_[flagName] = `${flagName} = asyncio.ThreadSafeFlag()`;

          // 定义中断回调函数
          let branchCode = this.statementToCode(block, 'SUBSTACK') || this.PASS;
          let code = '';
          code += 'while True:\n';
          code += `${this.INDENT}await ${flagName}.wait()\n`;
          code += branchCode;

          branchCode = this.prefixLines(code, this.INDENT);
          branchCode = this.addEventTrap(branchCode, 'pin_irq');
          code = '@_tasks__.append\n';
          code += branchCode;
          this.definitions_[`${flagName}_callback`] = code;

          const triggerMap = {
            RISING: 'Pin.IRQ_RISING',
            FALLING: 'Pin.IRQ_FALLING',
            CHANGE: 'Pin.IRQ_RISING | Pin.IRQ_FALLING',
            HIGH: 'Pin.IRQ_HIGH_LEVEL',
            LOW: 'Pin.IRQ_LOW_LEVEL',
          };
          const trigger = triggerMap[interrupt] || 'Pin.IRQ_RISING';
          return `${pinName}.irq(trigger=${trigger}, handler=lambda _: ${flagName}.set())\n`;
        },
      },
      {
        // 解除中断
        id: 'detachinterrupt',
        text: translate('esp32.blocks.detachinterrupt', 'detach pin %1 interrupt'),
        inputs: {
          PIN: {
            menu: boardPins.in,
          },
        },
        mpy(block) {
          const pinName = block.getFieldValue('PIN');
          return `${pinName}.irq(handler=None)\n`;
        },
      },
    ],
  };
};
