import { translate, themeColors } from '@blockcode/core';
import { ScratchBlocks } from '@blockcode/blocks';

export default () => ({
  id: 'control',
  name: '%{BKY_CATEGORY_CONTROL}',
  themeColor: themeColors.blocks.control.primary,
  inputColor: themeColors.blocks.control.secondary,
  otherColor: themeColors.blocks.control.tertiary,
  blocks: [
    {
      // 等待
      id: 'wait',
      text: translate('iotbit.blocks.wait', 'wait %1 milliseconds'),
      inputs: {
        MS: {
          type: 'integer',
          defaultValue: 1000,
        },
      },
      mpy(block) {
        const ms = this.valueToCode(block, 'MS', this.ORDER_NONE);
        const code = `await asyncio.sleep_ms(${ms})\n`;
        return code;
      },
    },
    {
      // 无限重复
      id: 'forever',
      text: ScratchBlocks.Msg.CONTROL_FOREVER,
      repeat: true,
      end: true,
    },
    '---',
    {
      // 重复次数
      id: 'repeat',
      text: ScratchBlocks.Msg.CONTROL_REPEAT,
      repeat: true,
      inputs: {
        TIMES: {
          type: 'integer',
          defaultValue: 10,
        },
      },
    },
    '---',
    {
      // 如果
      id: 'if',
      text: ScratchBlocks.Msg.CONTROL_IF,
      substack: true,
      inputs: {
        CONDITION: {
          type: 'boolean',
        },
      },
    },
    {
      // 否则，如果
      id: 'elseif',
      text: translate('iotbit.blocks.elseif', 'else if %1 then'),
      substack: true,
      inputs: {
        CONDITION: {
          type: 'boolean',
        },
      },
      mpy(block) {
        const condition = this.valueToCode(block, 'CONDITION', this.ORDER_NONE) || 'False';
        const branchCode = this.statementToCode(block, 'SUBSTACK') || this.PASS;

        // [TODO] 处理 elseif 前面没有 if 的错误情况
        let code = '';
        code += `elif ${condition}:\n`;
        code += branchCode;
        return code;
      },
    },
    {
      // 否则
      id: 'else',
      text: translate('iotbit.blocks.else', 'else'),
      substack: true,
      mpy(block) {
        const branchCode = this.statementToCode(block, 'SUBSTACK') || this.PASS;

        // [TODO] 处理 else 前面没有 if 的错误情况
        let code = '';
        code += `else:\n`;
        code += branchCode;
        return code;
      },
    },
    '---',
    {
      // 重复直到
      id: 'repeat_until',
      text: ScratchBlocks.Msg.CONTROL_REPEATUNTIL,
      repeat: true,
      inputs: {
        CONDITION: {
          type: 'boolean',
        },
      },
    },
    {
      // 当重复
      id: 'while',
      text: ScratchBlocks.Msg.CONTROL_WHILE,
      repeat: true,
      inputs: {
        CONDITION: {
          type: 'boolean',
        },
      },
    },
    {
      // continue
      id: 'continue',
      text: translate('iotbit.blocks.continue', 'continue'),
      end: true,
      mpy(block) {
        return 'continue\n';
      },
    },
    {
      // break
      id: 'break',
      text: translate('iotbit.blocks.break', 'break'),
      end: true,
      mpy(block) {
        return 'break\n';
      },
    },
  ],
});
