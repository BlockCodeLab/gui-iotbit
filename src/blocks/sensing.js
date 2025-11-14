import { themeColors, translate } from '@blockcode/core';
import { ScratchBlocks } from '@blockcode/blocks';

// 按键替换
ScratchBlocks.Blocks['#sensing_keyoptions'] = ScratchBlocks.Blocks['sensing_keyoptions'];

export default () => {
  ScratchBlocks.Blocks['sensing_keyoptions'] = {
    init() {
      this.jsonInit({
        message0: '%1',
        args0: [
          {
            type: 'field_dropdown',
            name: 'KEY_OPTION',
            options: [
              ['a', 'a'],
              ['b', 'b'],
              ['a+b', 'a+b'],
            ],
          },
        ],
        extensions: ['colours_sensing', 'output_string'],
      });
    },
  };

  return {
    id: 'sensing',
    name: '%{BKY_CATEGORY_SENSING}',
    themeColor: themeColors.blocks.sensing.primary,
    inputColor: themeColors.blocks.sensing.secondary,
    otherColor: themeColors.blocks.sensing.tertiary,
    blocks: [
      {
        // 按键按下
        id: 'keypressed',
        text: ScratchBlocks.Msg.SENSING_KEYPRESSED,
        output: 'boolean',
        inputs: {
          KEY_OPTION: {
            shadowType: 'sensing_keyoptions',
            defaultValue: 'a',
          },
        },
        emu(block) {
          const keyCode = this.valueToCode(block, 'KEY_OPTION', this.ORDER_NONE);
          this.renderLoopTrap();
          const code = '';
          return [code, this.ORDER_FUNCTION_CALL];
        },
        mpy(block) {
          const keyCode = this.valueToCode(block, 'KEY_OPTION', this.ORDER_NONE);
          const code = '';
          return [code, this.ORDER_FUNCTION_CALL];
        },
      },
      '---',
      {
        // 运行时长
        id: 'runtime',
        text: translate('iotbit.blocks.runtime', 'run time %1'),
        output: 'number',
        inputs: {
          UNIT: {
            menu: [
              [translate('iotbit.blocks.runtimeMilliseconds', 'milliseconds'), 'MS'],
              [translate('iotbit.blocks.runtimeSeconds', 'seconds'), 'SEC'],
            ],
          },
        },
        mpy(block) {
          const unit = block.getFieldValue('UNIT');
          const code = `(_times__${unit === 'SEC' ? '/1000' : ''})`;
          return [code, this.ORDER_ATOMIC];
        },
      },
    ],
  };
};
