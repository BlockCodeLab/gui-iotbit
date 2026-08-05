import { translate, themeColors } from '@blockcode/core';
import { ScratchBlocks } from '@blockcode/blocks';
import { getBoardPins } from './pins';
import deviceIcon from '../components/device-menu/icon-device.svg';

const timerIds = ['1', '2', '3', '4'];

const boardPins = getBoardPins();

export default () => ({
  id: 'event',
  name: '%{BKY_CATEGORY_EVENTS}',
  themeColor: themeColors.blocks.events.primary,
  inputColor: themeColors.blocks.events.secondary,
  otherColor: themeColors.blocks.events.tertiary,
  order: 4,
  blocks: [
    {
      // 开始
      id: 'whenstart',
      text: translate('iotbit.blocks.whenstart', 'when %1 start'),
      inputs: {
        DEVICE: {
          type: 'image',
          src: deviceIcon,
        },
      },
      hat: true,
      mpy(block) {
        let branchCode = this.statementToCode(block) || this.PASS;
        branchCode = this.addEventTrap(branchCode, 'start');
        let code = '';
        code += '@_tasks__.append\n';
        code += branchCode;
        code += '  await asyncio.sleep_ms(50)\n'; // 避免程序启动到结束耗时未达自动刷屏单帧间隔，导致屏幕未更新显示内容
        return code;
      },
      emu(block) {
        let branchCode = this.statementToCode(block);
        branchCode = this.addEventTrap(branchCode, block.id);
        branchCode = branchCode.replace('(done) => {\n', '(done) => {\n');
        const code = `runtime.when('start', ${branchCode});\n`;
        return code;
      },
    },
    '---',
    {
      // 按键按下
      id: 'whenkeypressed',
      text: ScratchBlocks.Msg.EVENT_WHENKEYPRESSED,
      hat: true,
      inputs: {
        KEY_OPTION: {
          type: 'string',
          defaultValue: 'a',
          menu: [
            ['A', 'a'],
            ['B', 'b'],
            ['A+B', 'ab'],
          ],
        },
      },
      mpy(block) {
        const key = block.getFieldValue('KEY_OPTION');
        const flagName = this.createName('event_flag');
        this.definitions_[flagName] = `${flagName} = asyncio.ThreadSafeFlag()`;

        let branchCode = this.statementToCode(block) || this.PASS;
        let code = '';
        code += 'while True:\n';
        code += `  await ${flagName}.wait()\n`;
        code += branchCode;

        branchCode = this.prefixLines(code, this.INDENT);
        branchCode = this.addEventTrap(branchCode, 'button_pressed');
        code = '@_tasks__.append\n';
        code += branchCode;
        code += `button_${key}.on_pressed(lambda _: ${flagName}.set())\n`;
        return code;
      },
      emu(block) {
        const key = block.getFieldValue('KEY_OPTION');
        let branchCode = this.statementToCode(block);
        branchCode = this.addEventTrap(branchCode, block.id);
        const code = `runtime.when('pressed:${key}', ${branchCode});\n`;
        return code;
      },
    },
    {
      // 引脚被触摸
      id: 'whenpintouched',
      text: translate('iotbit.blocks.pinTouched', 'when %1 touched below threshold %2'),
      hat: true,
      inputs: {
        PIN_OPTION: {
          type: 'string',
          defaultValue: 'touch_0',
          menu: boardPins.touch,
        },
        THRESHOLD: {
          type: 'positive_integer',
          defaultValue: 100,
        },
      },
      mpy(block) {
        const pin = block.getFieldValue('PIN_OPTION');
        const threshold = this.valueToCode(block, 'THRESHOLD', this.ORDER_NONE);

        let branchCode = this.statementToCode(block) || this.PASS;
        let code = '';
        code += `touched = False\n`;
        code += `while True:\n`;
        code += `  if touched or ${pin}.read() > ${threshold}:\n`;
        code += `    touched = ${pin}.read() <= ${threshold}\n`;
        code += `    await asyncio.sleep_ms(10)\n`;
        code += `    continue\n`;
        code += `  touched = True\n`;
        code += branchCode;

        branchCode = this.prefixLines(code, this.INDENT);
        branchCode = this.addEventTrap(branchCode, 'pin_touched');
        code = '@_tasks__.append\n';
        code += branchCode;
        return code;
      },
      emu(block) {
        const pin = block.getFieldValue('PIN_OPTION');
        let branchCode = this.statementToCode(block);
        branchCode = this.addEventTrap(branchCode, block.id);
        const code = `runtime.when('touched:${pin}', ${branchCode});\n`;
        return code;
      },
    },
    '---',
    {
      // 设置定时器
      id: 'timerset',
      text: translate('esp32.blocks.timerset', 'trigger timer #%1 per %2 milliseconds'),
      substack: true,
      inputs: {
        ID: {
          menu: timerIds,
        },
        PERIOD: {
          type: 'integer',
          defaultValue: 500,
        },
      },
      mpy(block) {
        const period = this.valueToCode(block, 'PERIOD', this.ORDER_NONE) || 500;
        let id = parseInt(block.getFieldValue('ID') || '1', 10) - 1;
        if (id < 0) {
          id = 0;
        }
        const timerName = `timer_${id}`;
        const flagName = this.createName('event_flag');
        this.definitions_['import_timer'] = 'from machine import Timer';
        this.definitions_[timerName] = `${timerName} = Timer(${id})`;
        this.definitions_[flagName] = `${flagName} = asyncio.ThreadSafeFlag()`;

        // 定义定时器回调函数
        let branchCode = this.statementToCode(block, 'SUBSTACK') || this.PASS;
        let code = '';
        code += 'while True:\n';
        code += `${this.INDENT}await ${flagName}.wait()\n`;
        code += branchCode;

        branchCode = this.prefixLines(code, this.INDENT);
        branchCode = this.addEventTrap(branchCode, 'timer');
        code = '@_tasks__.append\n';
        code += branchCode;
        this.definitions_[`${flagName}_callback`] = code;

        return `${timerName}.init(mode=Timer.PERIODIC, period=${period}, callback=lambda _: ${flagName}.set())\n`;
      },
      emu(block) {
        const period = this.valueToCode(block, 'PERIOD', this.ORDER_NONE) || 500;
        let id = parseInt(block.getFieldValue('ID') || '1', 10) - 1;
        if (id < 0) {
          id = 0;
        }
        const timerName = `timer_${id}`;
        this.definitions_[timerName] = `let ${timerName};`;
        const branchCode = this.statementToCode(block, 'SUBSTACK');

        let code = '';
        code += `${timerName} = setInterval(() => {\n${branchCode}}, ${period});\n`;
        return code;
      },
    },
    {
      // 关闭定时器
      id: 'timeroff',
      text: translate('esp32.blocks.timeroff', 'stop timer # %1'),
      inputs: {
        ID: {
          menu: timerIds,
        },
      },
      mpy(block) {
        let id = parseInt(block.getFieldValue('ID') || '1', 10) - 1;
        if (id < 0) {
          id = 0;
        }
        const code = `timer_${id}.deinit()\n`;
        return code;
      },
      emu(block) {
        let id = parseInt(block.getFieldValue('ID') || '1', 10) - 1;
        if (id < 0) {
          id = 0;
        }
        const code = `clearInterval(timer_${id});\n`;
        return code;
      },
    },
  ],
});
