import { translate, themeColors } from '@blockcode/core';

export default () => ({
  id: 'display',
  name: translate('iotbit.blocks.display', 'Display'),
  themeColor: themeColors.blocks.looks.primary,
  inputColor: themeColors.blocks.looks.secondary,
  otherColor: themeColors.blocks.looks.tertiary,
  order: 2,
  blocks: [
    {
      id: 'setLeds',
      text: translate('iotbit.blocks.setLeds', 'set led %1 %2 brightness %3'),
      inputs: {
        POS: {
          type: 'positive_integer',
          defaultValue: 1,
          inputMode: true,
          menu: [1, 2, 3],
        },
        COLOR: {
          type: 'color',
        },
        BRIGHTNESS: {
          shadow: 'brightnessSlider',
          defaultValue: 10,
        },
      },
      mpy(block) {
        const pos = this.getAdjusted(block, 'POS');
        const color = this.valueToCode(block, 'COLOR', this.ORDER_NONE);
        const brightness = this.valueToCode(block, 'BRIGHTNESS', this.ORDER_NONE);

        let code = `pixels.set_led(${pos}, ${brightness}, ${color})\n`;

        const nextBlock = block.getNextBlock();
        if (nextBlock?.type.endsWith('_setLeds')) {
          return code;
        }

        code += 'pixels.write()\n';
        return code;
      },
      emu(block) {
        const pos = this.getAdjusted(block, 'POS');
        const color = this.valueToCode(block, 'COLOR', this.ORDER_NONE);
        const brightness = this.valueToCode(block, 'BRIGHTNESS', this.ORDER_NONE);
        const code = `runtime.setLed(${pos}, ${color}, ${brightness});\n`;
        return code;
      },
    },
    {
      id: 'brightnessSlider',
      shadow: true,
      output: 'number',
      inputs: {
        BRIGHTNESS: {
          type: 'slider',
          defaultValue: 0,
          min: 0,
          max: 10,
        },
      },
      mpy(block) {
        const code = block.getFieldValue('BRIGHTNESS') || 0;
        return [code, this.ORDER_NONE];
      },
      emu(block) {
        const code = block.getFieldValue('BRIGHTNESS') || 0;
        return [code, this.ORDER_NONE];
      },
    },
    {
      id: 'closeLeds',
      text: translate('iotbit.blocks.closeLeds', 'close leds'),
      mpy(block) {
        const code = 'pixels.clear()\n';
        return code;
      },
      emu(block) {
        const code = 'runtime.clearLeds();\n';
        return code;
      },
    },
    '---',
    {
      id: 'displayClear',
      text: translate('iotbit.blocks.displayClear', 'clear display'),
      mpy(block) {
        const code = 'display.clear()\n';
        return code;
      },
      emu(block) {
        const code = `runtime.clearScreen();\n`;
        return code;
      },
    },
    {
      id: 'updateDisplay',
      hidden: true, // （移除）
      text: (
        <Text
          id="iotbit.blocks.updateDisplay"
          defaultMessage="update display"
        />
      ),
      mpy(block) {
        const code = 'display.show()\n';
        return code;
      },
      emu(block) {
        const code = `runtime.updateScreen();\n`;
        return code;
      },
    },
    '---',
    {
      id: 'displayText',
      text: translate('iotbit.blocks.displayText', 'display text %1 at x:%2 y:%3'),
      inputs: {
        TEXT: {
          type: 'string',
          defaultValue: 'hello',
        },
        X: {
          type: 'integer',
          defaultValue: 0,
        },
        Y: {
          type: 'integer',
          defaultValue: 0,
        },
      },
      mpy(block) {
        const x = this.valueToCode(block, 'X', this.ORDER_NONE);
        const y = this.valueToCode(block, 'Y', this.ORDER_NONE);
        let text = this.valueToCode(block, 'TEXT', this.ORDER_NONE);

        if (!/^["']|["']$/.test(text)) text = `str(${text})`;
        const code = `display.write(${text}, ${x}, ${y})\n`;
        return code;
      },
      emu(block) {
        const text = this.valueToCode(block, 'TEXT', this.ORDER_NONE) || '""';
        const x = this.valueToCode(block, 'X', this.ORDER_NONE);
        const y = this.valueToCode(block, 'Y', this.ORDER_NONE);
        const code = `runtime.drawText(\`$\{${text}}\`, ${x}, ${y});\n`;
        return code;
      },
    },
    {
      id: 'displayTextLine',
      text: translate('iotbit.blocks.displayTextLine', 'display text %1 at line %2'),
      inputs: {
        TEXT: {
          type: 'string',
          defaultValue: 'hello world',
        },
        LINE: {
          menu: [1, 2, 3, 4, 5],
        },
      },
      mpy(block) {
        const line = parseInt(block.getFieldValue('LINE')) - 1;
        let text = this.valueToCode(block, 'TEXT', this.ORDER_NONE);

        if (!/^["']|["']$/.test(text)) text = `str(${text})`;
        const code = `display.write(${text}, 2, ${line * 13}, wrap=True)\n`;
        return code;
      },
      emu(block) {
        const text = this.valueToCode(block, 'TEXT', this.ORDER_NONE) || '""';
        const line = parseInt(block.getFieldValue('LINE')) - 1;
        const code = `runtime.drawTextLine(\`$\{${text}}\`, ${line});\n`;
        return code;
      },
    },
    '---',
    {
      id: 'displayPixel',
      text: translate('iotbit.blocks.displayPixel', 'pixel x:%1 y:%2'),
      inputs: {
        X: {
          type: 'integer',
          defaultValue: 10,
        },
        Y: {
          type: 'integer',
          defaultValue: 10,
        },
      },
      mpy(block) {
        const x = this.valueToCode(block, 'X', this.ORDER_NONE);
        const y = this.valueToCode(block, 'Y', this.ORDER_NONE);

        const code = `display.pixel(${x}, ${y}, 1)\n`;
        return code;
      },
      emu(block) {
        const x = this.valueToCode(block, 'X', this.ORDER_NONE);
        const y = this.valueToCode(block, 'Y', this.ORDER_NONE);
        const code = `runtime.drawPixel(${x}, ${y});\n`;
        return code;
      },
    },
    {
      id: 'displayLine',
      text: translate('iotbit.blocks.displayLine', 'line from x1:%1 y1:%2 to x2:%3 y2:%4'),
      inputs: {
        X1: {
          type: 'integer',
          defaultValue: 0,
        },
        Y1: {
          type: 'integer',
          defaultValue: 0,
        },
        X2: {
          type: 'integer',
          defaultValue: 20,
        },
        Y2: {
          type: 'integer',
          defaultValue: 20,
        },
      },
      mpy(block) {
        const x1 = this.valueToCode(block, 'X1', this.ORDER_NONE);
        const y1 = this.valueToCode(block, 'Y1', this.ORDER_NONE);
        const x2 = this.valueToCode(block, 'X2', this.ORDER_NONE);
        const y2 = this.valueToCode(block, 'Y2', this.ORDER_NONE);

        const code = `display.line(${x1}, ${y1}, ${x2}, ${y2})\n`;
        return code;
      },
      emu(block) {
        const x1 = this.valueToCode(block, 'X1', this.ORDER_NONE);
        const y1 = this.valueToCode(block, 'Y1', this.ORDER_NONE);
        const x2 = this.valueToCode(block, 'X2', this.ORDER_NONE);
        const y2 = this.valueToCode(block, 'Y2', this.ORDER_NONE);
        const code = `runtime.drawLine(${x1}, ${y1}, ${x2}, ${y2});\n`;
        return code;
      },
    },
    {
      id: 'displayEllipse',
      text: translate('iotbit.blocks.displayEllipse', 'ellipse with x-radius:%1 and y-radius:%2 at x:%3 y:%4'),
      inputs: {
        RX: {
          type: 'positive_integer',
          defaultValue: 20,
        },
        RY: {
          type: 'positive_integer',
          defaultValue: 10,
        },
        X: {
          type: 'integer',
          defaultValue: 0,
        },
        Y: {
          type: 'integer',
          defaultValue: 0,
        },
      },
      mpy(block) {
        const rx = this.valueToCode(block, 'RX', this.ORDER_NONE);
        const ry = this.valueToCode(block, 'RY', this.ORDER_NONE);
        const x = this.valueToCode(block, 'X', this.ORDER_NONE);
        const y = this.valueToCode(block, 'Y', this.ORDER_NONE);

        const code = `display.ellipse(${x}, ${y}, ${rx}, ${ry})\n`;
        return code;
      },
      emu(block) {
        const rx = this.valueToCode(block, 'RX', this.ORDER_NONE);
        const ry = this.valueToCode(block, 'RY', this.ORDER_NONE);
        const x = this.valueToCode(block, 'X', this.ORDER_NONE);
        const y = this.valueToCode(block, 'Y', this.ORDER_NONE);
        const code = `runtime.drawEllipse(${x}, ${y}, ${rx}, ${ry});\n`;
        return code;
      },
    },
    {
      id: 'displayRect',
      text: translate('iotbit.blocks.displayRect', 'rect with width:%1 height:%2 at x:%3 y:%4'),
      inputs: {
        WIDTH: {
          type: 'positive_integer',
          defaultValue: 20,
        },
        HEIGHT: {
          type: 'positive_integer',
          defaultValue: 10,
        },
        X: {
          type: 'integer',
          defaultValue: 0,
        },
        Y: {
          type: 'integer',
          defaultValue: 0,
        },
      },
      mpy(block) {
        const width = this.valueToCode(block, 'WIDTH', this.ORDER_NONE);
        const height = this.valueToCode(block, 'HEIGHT', this.ORDER_NONE);
        const x = this.valueToCode(block, 'X', this.ORDER_NONE);
        const y = this.valueToCode(block, 'Y', this.ORDER_NONE);

        const code = `display.rect(${x}, ${y}, ${width}, ${height})\n`;
        return code;
      },
      emu(block) {
        const width = this.valueToCode(block, 'WIDTH', this.ORDER_NONE);
        const height = this.valueToCode(block, 'HEIGHT', this.ORDER_NONE);
        const x = this.valueToCode(block, 'X', this.ORDER_NONE);
        const y = this.valueToCode(block, 'Y', this.ORDER_NONE);
        const code = `runtime.drawRect(${x}, ${y}, ${width}, ${height});\n`;
        return code;
      },
    },
    {
      id: 'displayFill',
      text: translate('iotbit.blocks.displayFill', 'fill with width:%1 height:%2 at x:%3 y:%4'),
      inputs: {
        WIDTH: {
          type: 'positive_integer',
          defaultValue: 20,
        },
        HEIGHT: {
          type: 'positive_integer',
          defaultValue: 10,
        },
        X: {
          type: 'integer',
          defaultValue: 0,
        },
        Y: {
          type: 'integer',
          defaultValue: 0,
        },
      },
      mpy(block) {
        const width = this.valueToCode(block, 'WIDTH', this.ORDER_NONE);
        const height = this.valueToCode(block, 'HEIGHT', this.ORDER_NONE);
        const x = this.valueToCode(block, 'X', this.ORDER_NONE);
        const y = this.valueToCode(block, 'Y', this.ORDER_NONE);

        const code = `display.fill_rect(${x}, ${y}, ${width}, ${height})\n`;
        return code;
      },
      emu(block) {
        const width = this.valueToCode(block, 'WIDTH', this.ORDER_NONE);
        const height = this.valueToCode(block, 'HEIGHT', this.ORDER_NONE);
        const x = this.valueToCode(block, 'X', this.ORDER_NONE);
        const y = this.valueToCode(block, 'Y', this.ORDER_NONE);
        const code = `runtime.fillRect(${x}, ${y}, ${width}, ${height});\n`;
        return code;
      },
    },
  ],
});
