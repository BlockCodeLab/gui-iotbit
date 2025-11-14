import { translate, themeColors } from '@blockcode/core';
import { ScratchBlocks } from '@blockcode/blocks';
export default () => ({
  id: 'operator',
  name: '%{BKY_CATEGORY_OPERATORS}',
  themeColor: themeColors.blocks.operators.primary,
  inputColor: themeColors.blocks.operators.secondary,
  otherColor: themeColors.blocks.operators.tertiary,
  blocks: [
    {
      // 运算
      id: 'calculate',
      text: '%1 %2 %3',
      output: 'number',
      inputs: {
        NUM1: {
          type: 'number',
          defaultValue: 0,
        },
        SYMBOL: {
          menu: [
            ['+', '+'],
            ['-', '-'],
            ['×', '*'],
            ['÷', '/'],
          ],
        },
        NUM2: {
          type: 'number',
          defaultValue: 0,
        },
      },
      mpy(block) {
        const num1 = this.valueToCode(block, 'NUM1', this.ORDER_NONE);
        const num2 = this.valueToCode(block, 'NUM2', this.ORDER_NONE);
        const symbol = block.getFieldValue('SYMBOL') || '+';

        const orders = {
          '+': this.ORDER_ADDITION,
          '-': this.ORDER_SUBTRACTION,
          '*': this.ORDER_MULTIPLICATION,
          '/': this.ORDER_DIVISION,
        };
        const code = `(${num1} ${symbol} ${num2})`;
        return [code, orders[symbol]];
      },
    },
    '---',
    {
      // 随机
      id: 'random',
      text: ScratchBlocks.Msg.OPERATORS_RANDOM,
      output: 'number',
      inputs: {
        FROM: {
          type: 'integer',
          defaultValue: 1,
        },
        TO: {
          type: 'integer',
          defaultValue: 10,
        },
      },
      mpy(block) {
        this.definitions_['import_random'] = 'import random';
        const from = this.valueToCode(block, 'FROM', this.ORDER_NONE);
        const to = this.valueToCode(block, 'TO', this.ORDER_NONE);
        const code = `random.randint(${from}, ${to})`;
        return [code, this.ORDER_FUNCTION_CALL];
      },
    },
    '---',
    {
      // 比较
      id: 'compare',
      text: '%1 %2 %3',
      output: 'boolean',
      inputs: {
        NUM1: {
          type: 'number',
          defaultValue: 0,
        },
        SYMBOL: {
          menu: [
            ['>', '>'],
            ['<', '<'],
            ['=', '=='],
            ['≥', '>='],
            ['≤', '<='],
            ['≠', '!='],
          ],
        },
        NUM2: {
          type: 'number',
          defaultValue: 0,
        },
      },
      mpy(block) {
        const num1 = this.valueToCode(block, 'NUM1', this.ORDER_NONE);
        const num2 = this.valueToCode(block, 'NUM2', this.ORDER_NONE);
        const symbol = block.getFieldValue('SYMBOL') || '>';

        const orders = {
          '>': this.ORDER_RELATIONAL,
          '<': this.ORDER_RELATIONAL,
          '==': this.ORDER_EQUALITY,
          '>=': this.ORDER_RELATIONAL,
          '<=': this.ORDER_RELATIONAL,
          '!=': this.ORDER_EQUALITY,
        };
        const code = `(${num1} ${symbol} ${num2})`;
        return [code, orders[symbol]];
      },
    },
    '---',
    {
      // 与
      id: 'and',
      text: ScratchBlocks.Msg.OPERATORS_AND,
      output: 'boolean',
      inputs: {
        OPERAND1: {
          type: 'boolean',
        },
        OPERAND2: {
          type: 'boolean',
        },
      },
      mpy(block) {
        const operand1 = this.valueToCode(block, 'OPERAND1', this.ORDER_NONE);
        const operand2 = this.valueToCode(block, 'OPERAND2', this.ORDER_NONE);
        const code = `(${operand1} and ${operand2})`;
        return [code, this.ORDER_LOGICAL_AND];
      },
    },
    {
      // 或
      id: 'or',
      text: ScratchBlocks.Msg.OPERATORS_OR,
      output: 'boolean',
      inputs: {
        OPERAND1: {
          type: 'boolean',
        },
        OPERAND2: {
          type: 'boolean',
        },
      },
      mpy(block) {
        const operand1 = this.valueToCode(block, 'OPERAND1', this.ORDER_NONE);
        const operand2 = this.valueToCode(block, 'OPERAND2', this.ORDER_NONE);
        const code = `(${operand1} or ${operand2})`;
        return [code, this.ORDER_LOGICAL_OR];
      },
    },
    {
      // 非
      id: 'not',
      text: ScratchBlocks.Msg.OPERATORS_NOT,
      output: 'boolean',
      inputs: {
        OPERAND: {
          type: 'boolean',
        },
      },
      mpy(block) {
        const operand = this.valueToCode(block, 'OPERAND', this.ORDER_NONE) || 'True';
        const code = `(not ${operand})`;
        return [code, this.ORDER_LOGICAL_NOT];
      },
    },
    '---',
    {
      // 位运算
      id: 'bitwise',
      text: '%1 %2 %3',
      output: 'number',
      inputs: {
        NUM1: {
          type: 'integer',
          defaultValue: 0,
        },
        SYMBOL: {
          menu: [
            ['&', '&'],
            ['|', '|'],
            ['^', '^'],
            ['<<', '<<'],
            ['>>', '>>'],
          ],
        },
        NUM2: {
          type: 'integer',
          defaultValue: 0,
        },
      },
      mpy(block) {
        const num1 = this.valueToCode(block, 'NUM1', this.ORDER_NONE);
        const num2 = this.valueToCode(block, 'NUM2', this.ORDER_NONE);
        const symbol = block.getFieldValue('SYMBOL') || '&';

        const orders = {
          '&': this.ORDER_BITWISE_AND,
          '|': this.ORDER_BITWISE_OR,
          '^': this.ORDER_BITWISE_XOR,
          '<<': this.ORDER_BITWISE_SHIFT,
          '>>': this.ORDER_BITWISE_SHIFT,
        };
        const code = `(${num1} ${symbol} ${num2})`;
        return [code, orders[symbol]];
      },
    },
    {
      // 位运算非
      id: 'bitwise_not',
      text: '~ %1',
      output: 'number',
      inputs: {
        NUM: {
          type: 'integer',
          defaultValue: 0,
        },
      },
      mpy(block) {
        const num = this.valueToCode(block, 'NUM', this.ORDER_NONE);
        const code = `(~${num})`;
        return [code, this.ORDER_BITWISE_NOT];
      },
    },
    '---',
    {
      // 最大值
      id: 'larger',
      text: translate('iotbit.blocks.operatorLarger', 'larger of %1 and %2'),
      output: 'number',
      inputs: {
        NUM1: {
          type: 'number',
          defaultValue: 0,
        },
        NUM2: {
          type: 'number',
          defaultValue: 0,
        },
      },
      mpy(block) {
        const num1 = this.valueToCode(block, 'NUM1', this.ORDER_NONE);
        const num2 = this.valueToCode(block, 'NUM2', this.ORDER_NONE);
        const code = `max(${num1}, ${num2})`;
        return [code, this.ORDER_FUNCTION_CALL];
      },
    },
    {
      // 最小值
      id: 'smaller',
      text: translate('iotbit.blocks.operatorSmaller', 'smaller of %1 and %2'),
      output: 'number',
      inputs: {
        NUM1: {
          type: 'number',
          defaultValue: 0,
        },
        NUM2: {
          type: 'number',
          defaultValue: 0,
        },
      },
      mpy(block) {
        const num1 = this.valueToCode(block, 'NUM1', this.ORDER_NONE);
        const num2 = this.valueToCode(block, 'NUM2', this.ORDER_NONE);
        const code = `min(${num1}, ${num2})`;
        return [code, this.ORDER_FUNCTION_CALL];
      },
    },
    {
      // 余数
      id: 'mod',
      text: ScratchBlocks.Msg.OPERATORS_MOD,
      output: 'number',
      inputs: {
        NUM1: {
          type: 'integer',
          defaultValue: 0,
        },
        NUM2: {
          type: 'integer',
          defaultValue: 0,
        },
      },
      mpy(block) {
        const num1 = this.valueToCode(block, 'NUM1', this.ORDER_NONE);
        const num2 = this.valueToCode(block, 'NUM2', this.ORDER_NONE);
        const code = `(${num1} % ${num2})`;
        return [code, this.ORDER_MODULUS];
      },
    },
    {
      // 四舍五入
      id: 'round',
      text: ScratchBlocks.Msg.OPERATORS_ROUND,
      output: 'number',
      inputs: {
        NUM: {
          type: 'number',
          defaultValue: 0,
        },
      },
      mpy(block) {
        this.definitions_['import_math'] = 'import math';
        const num = this.valueToCode(block, 'NUM', this.ORDER_NONE);
        const code = `round(${num})`;
        return [code, this.ORDER_FUNCTION_CALL];
      },
    },
    '---',
    {
      // 函数
      id: 'mathop',
      text: ScratchBlocks.Msg.MATHOP,
      output: 'number',
      inputs: {
        OPERATOR: {
          menu: [
            [ScratchBlocks.Msg.OPERATORS_MATHOP_ABS, 'math.fabs'],
            [ScratchBlocks.Msg.OPERATORS_MATHOP_FLOOR, 'math.floor'],
            [ScratchBlocks.Msg.OPERATORS_MATHOP_CEILING, 'math.ceil'],
            [ScratchBlocks.Msg.OPERATORS_MATHOP_SQRT, 'math.sqrt'],
            [ScratchBlocks.Msg.OPERATORS_MATHOP_SIN, 'math.sin'],
            [ScratchBlocks.Msg.OPERATORS_MATHOP_COS, 'math.cos'],
            [ScratchBlocks.Msg.OPERATORS_MATHOP_TAN, 'math.tan'],
            [ScratchBlocks.Msg.OPERATORS_MATHOP_ASIN, 'math.asin'],
            [ScratchBlocks.Msg.OPERATORS_MATHOP_ACOS, 'math.acos'],
            [ScratchBlocks.Msg.OPERATORS_MATHOP_ATAN, 'math.atan'],
            [ScratchBlocks.Msg.OPERATORS_MATHOP_LN, 'math.log'],
            [ScratchBlocks.Msg.OPERATORS_MATHOP_LOG, 'math.log10'],
            [ScratchBlocks.Msg.OPERATORS_MATHOP_EEXP, 'math.exp'],
            [ScratchBlocks.Msg.OPERATORS_MATHOP_10EXP, 'pow10'],
          ],
        },
        NUM: {
          type: 'integer',
          defaultValue: 0,
        },
      },
      mpy(block) {
        this.definitions_['import_math'] = 'import math';
        const operator = block.getFieldValue('OPERATOR') || 'abs';
        const num = this.valueToCode(block, 'NUM', this.ORDER_NONE);

        let code = '';
        if (operator === 'pow10') {
          code += `math.pow(10, ${num})`;
        } else {
          code += `${operator}(${num})`;
        }
        return [code, this.ORDER_FUNCTION_CALL];
      },
    },
    {
      // 约束
      id: 'constrain',
      text: translate('iotbit.blocks.dataConstrain', 'constrain %1 between %2 to %3'),
      output: 'number',
      inputs: {
        DATA: {
          type: 'integer',
          defaultValue: 0,
        },
        FROM: {
          type: 'integer',
          defaultValue: 0,
        },
        TO: {
          type: 'integer',
          defaultValue: 255,
        },
      },
      mpy(block) {
        const data = this.valueToCode(block, 'DATA', this.ORDER_NONE);
        const from = this.valueToCode(block, 'FROM', this.ORDER_NONE);
        const to = this.valueToCode(block, 'TO', this.ORDER_NONE);
        return [`min(max(${data}, ${from}), ${to})`, this.ORDER_FUNCTION_CALL];
      },
    },
    {
      // 映射
      id: 'map',
      text: translate('iotbit.blocks.dataMap', 'map %1 from %2 - %3 to %4 - %5'),
      output: 'number',
      inputs: {
        DATA: {
          type: 'integer',
          defaultValue: 0,
        },
        FROMLOW: {
          type: 'integer',
          defaultValue: 0,
        },
        FROMHIGH: {
          type: 'integer',
          defaultValue: 1023,
        },
        TOLOW: {
          type: 'integer',
          defaultValue: 0,
        },
        TOHIGHT: {
          type: 'integer',
          defaultValue: 255,
        },
      },
      mpy(block) {
        const data = this.valueToCode(block, 'DATA', this.ORDER_NONE);
        const fromlow = this.valueToCode(block, 'FROMLOW', this.ORDER_NONE);
        const fromhigh = this.valueToCode(block, 'FROMHIGH', this.ORDER_NONE);
        const tolow = this.valueToCode(block, 'TOLOW', this.ORDER_NONE);
        const tohigh = this.valueToCode(block, 'TOHIGHT', this.ORDER_NONE);
        const code = `(${data} - ${fromlow}) * (${tohigh} - ${tolow}) // (${fromhigh} - ${fromlow}) + ${tolow}`;
        return [code, this.ORDER_FUNCTION_CALL];
      },
    },
    '---',
    {
      // 长度
      id: 'sizeof',
      text: translate('iotbit.blocks.dataLengthOf', 'length of %1'),
      output: 'number',
      inputs: {
        DATA: {
          type: 'string',
          defaultValue: 'esp32',
        },
      },
      mpy(block) {
        const data = this.valueToCode(block, 'DATA', this.ORDER_NONE);
        return [`len(${data})`, this.ORDER_FUNCTION_CALL];
      },
    },
    '---',
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
        const code = `(${str1} + ${str2})`;
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
        const code = `${str}[${letterIndex}]`;
        return [code, this.ORDER_FUNCTION_CALL];
      },
    },

    {
      // 截取
      id: 'substring',
      text: translate('iotbit.blocks.textSubstring', 'substring of %1 from %2 to %3'),
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
        const code = `${str}[${from}:${to}]`;
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
        const code = `(${str2} in ${str1})`;
        return [code, this.ORDER_EQUALITY];
      },
    },
    {
      // 开始/结束于
      id: 'with',
      text: translate('iotbit.blocks.textWith', '%1 %2 with %3 ?'),
      output: 'boolean',
      inputs: {
        STRING1: {
          type: 'string',
          defaultValue: 'esp32',
        },
        WITH: {
          type: 'string',
          menu: [
            [translate('iotbit.blocks.textStartsWith', 'starts'), 'START'],
            [translate('iotbit.blocks.textEndsWith', 'ends'), 'END'],
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
        const code = `${str1}.${method}(${str2})`;
        return [code, this.ORDER_FUNCTION_CALL];
      },
    },
    {
      // 相同
      id: 'equals',
      text: translate('iotbit.blocks.textEquals', '%1 equals %2 (not case-sensitive)?'),
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
        const code = `${str1}.lower() == ${str2}.lower()`;
        return [code, this.ORDER_EQUALITY];
      },
    },
    '---',
    {
      // 转换大小写
      id: 'case',
      text: translate('iotbit.blocks.textCase', 'get %1 case of %2'),
      output: 'stirng',
      inputs: {
        WITH: {
          menu: [
            [translate('iotbit.blocks.textLowerCase', 'lower'), 'LOWER'],
            [translate('iotbit.blocks.textUpperCase', 'upper'), 'UPPER'],
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
        const code = `${str}.${method}()\n`;
        return [code, this.ORDER_FUNCTION_CALL];
      },
    },
    {
      // 清除空白
      id: 'trim',
      text: translate('iotbit.blocks.textTrim', 'remove %1 leading and trailing whitespace'),
      output: 'string',
      inputs: {
        STRING: {
          type: 'string',
          defaultValue: 'esp32',
        },
      },
      mpy(block) {
        const str = this.valueToCode(block, 'STRING', this.ORDER_NONE);
        const code = `${str}.strip()\n`;
        return [code, this.ORDER_FUNCTION_CALL];
      },
    },
    '---',
    {
      // 类型转换
      id: 'convert',
      text: translate('iotbit.blocks.dataConvert', 'convert %1 to %2'),
      output: true,
      inputs: {
        DATA: {
          type: 'string',
          defaultValue: '3.1415',
        },
        TYPE: {
          menu: [
            [translate('iotbit.blocks.dataConvert.int', 'int'), 'int'],
            [translate('iotbit.blocks.dataConvert.float', 'float'), 'float'],
            [translate('iotbit.blocks.dataConvert.string', 'str'), 'str'],
            [translate('iotbit.blocks.dataConvert.list', 'list'), 'list'],
          ],
        },
      },
      mpy(block) {
        const data = this.valueToCode(block, 'DATA', this.ORDER_NONE);
        const type = block.getFieldValue('TYPE') || 'int';
        return [`${type}(${data})`, this.ORDER_FUNCTION_CALL];
      },
    },
  ],
});
