import { translate, themeColors } from '@blockcode/core';

export default () => ({
  id: 'pin',
  name: translate('iotbit.blocks.pin', 'Pins'),
  themeColor: themeColors.blocks.motion.primary,
  inputColor: themeColors.blocks.motion.secondary,
  otherColor: themeColors.blocks.motion.tertiary,
  order: 0,
  blocks: [
    {
      // 设置模式
      id: 'setmode',
      text: translate('iotbit.blocks.setmode', 'set pin %1 mode to %2'),
      inputs: {
        PIN: {
          menu: 'PINS',
        },
        MODE: {
          menu: [
            [translate('iotbit.blocks.ouputMode', 'output'), 'OUTPUT'],
            [translate('iotbit.blocks.inputMode', 'input'), 'INPUT'],
            [translate('iotbit.blocks.inputPullUpMode', 'input pull-up'), 'INPUT_PULLUP'],
            [translate('iotbit.blocks.inputPullDownMode', 'input pull-down'), 'INPUT_PULLDOWN'],
          ],
        },
      },
      mpy(block) {
        const pin = block.getFieldValue('PIN') || 0;
        const pinName = `pin_${pin}`;
        const mode = block.getFieldValue('MODE') || 'OUTPUT';
        this.definitions_['import_pin'] = 'from machine import Pin';

        let code = '';
        if (mode === 'INPUT') {
          code = `${pinName} = Pin(${pin}, Pin.IN)`;
        } else if (mode === 'INPUT_PULLUP') {
          code = `${pinName} = Pin(${pin}, Pin.IN, Pin.PULL_UP)`;
        } else if (mode === 'INPUT_PULLDOWN') {
          code = `${pinName} = Pin(${pin}, Pin.IN, Pin.PULL_DOWN)`;
        } else {
          code = `${pinName} = Pin(${pin}, Pin.OUT)`;
        }
        this.definitions_[pinName] = code;

        return '';
      },
    },
    '---',
    {
      // 数字引脚设为
      id: 'setdigital',
      text: translate('iotbit.blocks.setdigital', 'set pin %1 to %2'),
      inputs: {
        PIN: {
          menu: 'OUT_PINS',
        },
        VALUE: {
          inputMode: true,
          type: 'integer',
          defaultValue: '1',
          menu: [
            [translate('iotbit.blocks.digitalHigh', 'high'), '1'],
            [translate('iotbit.blocks.digitalLow', 'low'), '0'],
          ],
        },
      },
      mpy(block) {
        const pin = block.getFieldValue('PIN') || 0;
        const pinName = `pin_${pin}`;
        const value = this.valueToCode(block, 'VALUE', this.ORDER_NONE);
        this.definitions_['import_pin'] = 'from machine import Pin';
        this.definitions_[pinName] = this.definitions_[pinName] ?? `${pinName} = Pin(${pin}, Pin.OUT)`;
        const code = `${pinName}.value(${value})\n`;
        return code;
      },
    },
    {
      // 模拟 引脚设为
      id: 'setDAC',
      text: translate('iotbit.blocks.setanalog', 'set pin %1 analog to %2'),
      inputs: {
        PIN: {
          menu: 'DAC_PINS',
        },
        VALUE: {
          shadow: 'slider255',
        },
      },
      mpy(block) {
        const pin = block.getFieldValue('PIN') || 0;
        const pinName = `pin_${pin}`;
        const value = this.valueToCode(block, 'VALUE', this.ORDER_NONE);
        this.definitions_['import_pin'] = 'from machine import Pin';
        this.definitions_['import_dac'] = 'from machine import DAC';
        this.definitions_[pinName] = `${pinName} = DAC(Pin(${pin}))`;
        const code = `${pinName}.write(${value})\n`;
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
    },
    {
      // 数字引脚是否为高电平？
      id: 'digital',
      text: translate('iotbit.blocks.isDigitalHigh', 'pin %1 is high?'),
      output: 'boolean',
      inputs: {
        PIN: {
          menu: 'PINS',
        },
      },
      mpy(block) {
        const pin = block.getFieldValue('PIN') || 0;
        const pinName = `pin_${pin}`;
        this.definitions_['import_pin'] = 'from machine import Pin';
        this.definitions_[pinName] = `${pinName} = Pin(${pin}, Pin.IN)`;
        return [`(${pinName}.value() == 1)`, this.ORDER_RELATIONAL];
      },
    },
    {
      // 模拟引脚值
      id: 'analog',
      text: translate('iotbit.blocks.analogValue', 'pin %1 analog value'),
      output: 'integer',
      inputs: {
        PIN: {
          menu: 'ADC_PINS',
        },
      },
      mpy(block) {
        const pin = block.getFieldValue('PIN') || 0;
        const pinName = `pin_${pin}`;
        this.definitions_['import_pin'] = 'from machine import Pin';
        this.definitions_['import_adc'] = 'from machine import ADC';
        this.definitions_[pinName] = `${pinName} = ADC(Pin(${pin}))`;
        this.definitions_[`${pinName}_atten`] = `${pinName}.atten(ADC.ATTN_11DB)`;
        this.definitions_[`${pinName}_width`] = `${pinName}.width(ADC.WIDTH_10BIT)`;
        return [`${pinName}.read()`, this.ORD_FUNCTION_CALL];
      },
    },
    '---',
    {
      // PWM 引脚频率设为
      id: 'setPWMFreq',
      text: translate('iotbit.blocks.setpwmfreq', 'set pin %1 pwm frequency to %2 Hz'),
      inputs: {
        PIN: {
          menu: 'OUT_PINS',
        },
        FREQ: {
          type: 'integer',
          defaultValue: '1000',
        },
      },
      mpy(block) {
        const pin = block.getFieldValue('PIN') || 0;
        const pinName = `pin_${pin}`;
        const freq = this.valueToCode(block, 'FREQ', this.ORDER_NONE);
        this.definitions_['import_pin'] = 'from machine import Pin';
        this.definitions_['import_pwm'] = 'from machine import PWM';
        this.definitions_[pinName] = `${pinName} = PWM(Pin(${pin}), freq=1000)`;
        const code = `${pinName}.freq(${freq})\n`;
        return code;
      },
    },
    {
      // PWM 引脚设为
      id: 'setPWM',
      text: translate('iotbit.blocks.setpwm', 'set pin %1 pwm to %2'),
      inputs: {
        PIN: {
          menu: 'OUT_PINS',
        },
        VALUE: {
          shadow: 'slider1023',
        },
      },
      mpy(block) {
        const pin = block.getFieldValue('PIN') || 0;
        const pinName = `pin_${pin}`;
        const value = this.valueToCode(block, 'VALUE', this.ORDER_NONE);
        this.definitions_['import_pin'] = 'from machine import Pin';
        this.definitions_['import_pwm'] = 'from machine import PWM';
        this.definitions_[pinName] = `${pinName} = PWM(Pin(${pin}), freq=1000)`;
        const code = `${pinName}.duty(${value})\n`;
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
      text: translate('iotbit.blocks.attachinterrupt', 'attach pin %1 interrupt to %2'),
      substack: true,
      inputs: {
        PIN: {
          menu: 'PINS',
        },
        INTERRUPT: {
          menu: [
            [translate('iotbit.blocks.interruptRising', 'rising'), 'RISING'],
            [translate('iotbit.blocks.interruptFalling', 'falling'), 'FALLING'],
            [translate('iotbit.blocks.interruptChange', 'change'), 'CHANGE'],
            [translate('iotbit.blocks.interruptHigh', 'high'), 'HIGH'],
            [translate('iotbit.blocks.interruptLow', 'low'), 'LOW'],
          ],
        },
      },
      mpy(block) {
        const pin = block.getFieldValue('PIN') || 0;
        const pinName = `pin_${pin}`;
        const flagName = `interrupt_${pin}_flag`;
        const interrupt = block.getFieldValue('INTERRUPT') || 'RISING';
        this.definitions_['import_pin'] = 'from machine import Pin';
        this.definitions_[pinName] = this.definitions_[pinName] ?? `${pinName} = Pin(${pin}, Pin.IN)`;
        this.definitions_[flagName] = `${flagName} = asyncio.ThreadSafeFlag()`;

        // 定义中断回调函数
        let branchCode = this.statementToCode(block, 'SUBSTACK') || this.PASS;
        let code = '';
        code += 'while True:\n';
        code += `${this.INDENT}await ${flagName}.wait()\n`;
        code += branchCode;

        branchCode = this.prefixLines(code, this.INDENT);
        branchCode = this.addEventTrap(branchCode, block.id);
        code = '@_tasks__.append\n';
        code += branchCode;
        this.definitions_[`interrupt_${pin}`] = code;

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
      text: translate('iotbit.blocks.detachinterrupt', 'detach pin %1 interrupt'),
      inputs: {
        PIN: {
          menu: 'PINS',
        },
      },
      mpy(block) {
        const pin = block.getFieldValue('PIN') || 0;
        return `pin_${pin}.irq(handler=None)\n`;
      },
    },
  ],
  menus: {
    PINS: {
      items: [
        ['P0', '33'],
        ['P1', '32'],
        ['P2', '35'],
        ['P3', '34'],
        ['P4', '39'],
        ['P5', '0'],
        ['P6', '16'],
        ['P7', '17'],
        ['P8', '26'],
        ['P9', '25'],
        ['P10', '36'],
        ['P11', '2'],
        // ['P12', ''],
        ['P13', '18'],
        ['P14', '19'],
        ['P15', '21'],
        ['P16', '5'],
        ['P19', '22'],
        ['P20', '23'],
        ['P23', '27'],
        ['P24', '14'],
        ['P25', '12'],
        ['P26', '13'],
        ['P27', '15'],
        ['P28', '4'],
      ],
    },
    OUT_PINS: {
      items: [
        ['P0', '33'],
        ['P1', '32'],
        // ['P2', '35'],
        // ['P3', '34'],
        // ['P4', '39'],
        ['P5', '0'],
        ['P6', '16'],
        ['P7', '17'],
        ['P8', '26'],
        ['P9', '25'],
        // ['P10', '36'],
        ['P11', '2'],
        // ['P12', ''],
        ['P13', '18'],
        ['P14', '19'],
        ['P15', '21'],
        ['P16', '5'],
        ['P19', '22'],
        ['P20', '23'],
        ['P23', '27'],
        ['P24', '14'],
        ['P25', '12'],
        ['P26', '13'],
        ['P27', '15'],
        ['P28', '4'],
      ],
    },
    ADC_PINS: {
      items: [
        ['P0', '33'],
        ['P1', '32'],
        ['P2', '35'],
        ['P3', '34'],
        ['P4', '39'],
        ['P5', '0'],
        ['P8', '26'],
        ['P9', '25'],
        ['P10', '36'],
        ['P11', '2'],
        ['P23', '27'],
        ['P24', '14'],
        ['P25', '12'],
        ['P26', '13'],
        ['P27', '15'],
        ['P28', '4'],
      ],
    },
    DAC_PINS: {
      items: [
        ['P8', '26'],
        ['P9', '25'],
      ],
    },
  },
});
