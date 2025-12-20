import { translate, themeColors } from '@blockcode/core';

export default () => ({
  id: 'terminal',
  name: translate('iotbit.blocks.terminal', 'Terminal'),
  themeColor: themeColors.blocks.debug.primary,
  inputColor: themeColors.blocks.debug.secondary,
  otherColor: themeColors.blocks.debug.tertiary,
  order: 9,
  blocks: [
    {
      id: 'print',
      text: translate('iotbit.blocks.terminalPrint', 'print %1'),
      inputs: {
        STRING: {
          type: 'string',
          defaultValue: 'hello',
        },
      },
      mpy(block) {
        const str = this.valueToCode(block, 'STRING', this.ORDER_NONE);
        const code = `print(str(${str}))\n`;
        return code;
      },
    },
  ],
});
