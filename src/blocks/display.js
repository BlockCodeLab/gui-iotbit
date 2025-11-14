import { translate, themeColors } from '@blockcode/core';

export default () => ({
  id: 'display',
  name: translate('iotbit.blocks.display', 'Display'),
  themeColor: themeColors.blocks.looks.primary,
  inputColor: themeColors.blocks.looks.secondary,
  otherColor: themeColors.blocks.looks.tertiary,
  order: 1,
  blocks: [],
});
