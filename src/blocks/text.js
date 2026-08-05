import { translate, themeColors } from '@blockcode/core';
import { ScratchBlocks } from '@blockcode/blocks';

export default (i) => ({
  id: 'text',
  name: translate('esp32.blocks.text', 'Text'),
  themeColor: themeColors.blocks.text.primary,
  inputColor: themeColors.blocks.text.secondary,
  otherColor: themeColors.blocks.text.tertiary,
  order: i,
  blocks: [
    {
      // 连接
      id: 'join',
      text: ScratchBlocks.Msg.OPERATORS_JOIN,
      output: 'string',
      inputs: {
        STRING1: {
          type: 'string',
          defaultValue: 'hello',
        },
        STRING2: {
          type: 'string',
          defaultValue: 'esp32',
        },
      },
      mpy(block) {
        const str1 = this.valueToCode(block, 'STRING1', this.ORDER_NONE);
        const str2 = this.valueToCode(block, 'STRING2', this.ORDER_NONE);
        const code = `(str(${str1}) + str(${str2}))`;
        return [code, this.ORDER_ADDITION];
      },
    },
    {
      // 字符
      id: 'letter_of',
      text: ScratchBlocks.Msg.OPERATORS_LETTEROF,
      output: 'string',
      inputs: {
        LETTER: {
          type: 'integer',
          defaultValue: 1,
        },
        STRING: {
          type: 'string',
          defaultValue: 'esp32',
        },
      },
      mpy(block) {
        const letterIndex = this.getAdjusted(block, 'LETTER'); // 将位置值换成下标值
        const str = this.valueToCode(block, 'STRING', this.ORDER_NONE);
        const code = `str(${str})[${letterIndex}]`;
        return [code, this.ORDER_FUNCTION_CALL];
      },
    },
    {
      // 替换
      id: 'replace',
      text: translate('esp32.blocks.textReplace', 'replace %1 of %2 with %3'),
      output: 'string',
      inputs: {
        STRING1: {
          type: 'string',
          defaultValue: 'e',
        },
        STRING2: {
          type: 'string',
          defaultValue: 'esp32',
        },
        STRING3: {
          type: 'string',
          defaultValue: 'The E',
        },
      },
      mpy(block) {
        const str1 = this.valueToCode(block, 'STRING1', this.ORDER_NONE);
        const str2 = this.valueToCode(block, 'STRING2', this.ORDER_NONE);
        const str3 = this.valueToCode(block, 'STRING3', this.ORDER_NONE);
        const code = `str(${str2}).replace(str(${str1}), ${str3})\n`;
        return [code, this.ORDER_FUNCTION_CALL];
      },
    },
    {
      // 截取
      id: 'substring',
      text: translate('esp32.blocks.textSubstring', 'substring of %1 from %2 to %3'),
      output: 'string',
      inputs: {
        STRING: {
          type: 'string',
          defaultValue: 'esp32',
        },
        FROM: {
          type: 'integer',
          defaultValue: 5,
        },
        TO: {
          type: 'integer',
          defaultValue: 7,
        },
      },
      mpy(block) {
        const from = this.getAdjusted(block, 'FROM');
        const to = this.valueToCode(block, 'TO', this.ORDER_NONE);
        const str = this.valueToCode(block, 'STRING', this.ORDER_NONE);
        const code = `str(${str})[${from}:${to}]`;
        return [code, this.ORDER_FUNCTION_CALL];
      },
    },
    {
      // 查找
      id: 'find',
      text: translate('esp32.blocks.textFind', 'find %1 of %2 place'),
      output: 'string',
      inputs: {
        STRING1: {
          type: 'string',
          defaultValue: 'e',
        },
        STRING2: {
          type: 'string',
          defaultValue: 'esp32',
        },
      },
      mpy(block) {
        const str1 = this.valueToCode(block, 'STRING1', this.ORDER_NONE);
        const str2 = this.valueToCode(block, 'STRING2', this.ORDER_NONE);
        const code = `(str(${str2}).find(str(${str1})) + 1)\n`;
        return [code, this.ORDER_FUNCTION_CALL];
      },
    },
    '---',
    {
      // 包含
      id: 'contains',
      text: ScratchBlocks.Msg.OPERATORS_CONTAINS,
      output: 'boolean',
      inputs: {
        STRING1: {
          type: 'string',
          defaultValue: 'esp32',
        },
        STRING2: {
          type: 'string',
          defaultValue: 'e',
        },
      },
      mpy(block) {
        const str1 = this.valueToCode(block, 'STRING1', this.ORDER_NONE);
        const str2 = this.valueToCode(block, 'STRING2', this.ORDER_NONE);
        const code = `(str(${str2}) in str(${str1}))`;
        return [code, this.ORDER_EQUALITY];
      },
    },
    {
      // 开始/结束于
      id: 'with',
      text: translate('esp32.blocks.textWith', '%1 %2 with %3 ?'),
      output: 'boolean',
      inputs: {
        STRING1: {
          type: 'string',
          defaultValue: 'esp32',
        },
        WITH: {
          type: 'string',
          menu: [
            [translate('esp32.blocks.textStartsWith', 'starts'), 'START'],
            [translate('esp32.blocks.textEndsWith', 'ends'), 'END'],
          ],
        },
        STRING2: {
          type: 'string',
          defaultValue: 'a',
        },
      },
      mpy(block) {
        const str1 = this.valueToCode(block, 'STRING1', this.ORDER_NONE);
        const str2 = this.valueToCode(block, 'STRING2', this.ORDER_NONE);
        const with_ = block.getFieldValue('WITH') || 'START';
        const method = with_ === 'START' ? 'startswith' : 'endswith';
        const code = `str(${str1}).${method}(str(${str2}))`;
        return [code, this.ORDER_FUNCTION_CALL];
      },
    },
    {
      // 相同
      id: 'equals',
      text: translate('esp32.blocks.textEquals', '%1 equals %2 (not case-sensitive)?'),
      output: 'boolean',
      inputs: {
        STRING1: {
          type: 'string',
          defaultValue: 'esp32',
        },
        STRING2: {
          type: 'string',
          defaultValue: 'ESP32',
        },
      },
      mpy(block) {
        const str1 = this.valueToCode(block, 'STRING1', this.ORDER_NONE);
        const str2 = this.valueToCode(block, 'STRING2', this.ORDER_NONE);
        const code = `str(${str1}).lower() == str(${str2}).lower()`;
        return [code, this.ORDER_EQUALITY];
      },
    },
    '---',
    {
      // 转换大小写
      id: 'case',
      text: translate('esp32.blocks.textCase', 'get %1 case of %2'),
      output: 'stirng',
      inputs: {
        WITH: {
          menu: [
            [translate('esp32.blocks.textLowerCase', 'lower'), 'LOWER'],
            [translate('esp32.blocks.textUpperCase', 'upper'), 'UPPER'],
          ],
        },
        STRING: {
          type: 'string',
          defaultValue: 'ESP32',
        },
      },
      mpy(block) {
        const with_ = block.getFieldValue('WITH') || 'LOWER';
        const str = this.valueToCode(block, 'STRING', this.ORDER_NONE);
        const method = with_ === 'LOWER' ? 'lower' : 'upper';
        const code = `str(${str}).${method}()\n`;
        return [code, this.ORDER_FUNCTION_CALL];
      },
    },
    {
      // 清除空白
      id: 'trim',
      text: translate('esp32.blocks.textTrim', 'remove %1 leading and trailing whitespace'),
      output: 'string',
      inputs: {
        STRING: {
          type: 'string',
          defaultValue: 'esp32',
        },
      },
      mpy(block) {
        const str = this.valueToCode(block, 'STRING', this.ORDER_NONE);
        const code = `str(${str}).strip()\n`;
        return [code, this.ORDER_FUNCTION_CALL];
      },
    },
  ],
});
