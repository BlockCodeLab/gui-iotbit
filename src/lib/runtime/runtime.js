import { Konva } from '@blockcode/utils';
import { Runtime } from '@blockcode/blocks';

const screenFont = 'Verdana';
const screenWidth = 128;
const screenHeight = 64;

const getScreenX = (x) => x - 64;
const getScreenY = (y) => 64 - y;

export class IotBitRuntime extends Runtime {
  _offlineScreen = [];

  get times() {
    return this._times ? Date.now() - this._times : 0;
  }

  loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  setScreen() {
    this.paintLayer.clip({
      x: getScreenX(-1),
      y: getScreenY(screenHeight + 1),
      width: screenWidth + 2,
      height: screenHeight + 2,
    });
  }

  clearScreen() {
    this.paintLayer.destroyChildren();
  }

  updateScreen() {
    this.paintLayer.add(...this._offlineScreen);
    this._offlineScreen.length = 0;
  }

  setLed(index, color, brightness) {
    const led = this.spritesLayer.findOne('#led-' + index);
    if (led) {
      led.fill(color);
      if (brightness === 0) led.opacity(0.1);
      else led.opacity((brightness / 10) * 0.7 + 0.3);
    }
  }

  clearLeds() {
    for (let i = 0; i < 3; i++) {
      this.setLed(i, 'white', 10);
    }
  }

  drawText(text, x, y) {
    this._offlineScreen.push(
      new Konva.Text({
        text,
        x: getScreenX(x),
        y: getScreenY(y),
        scaleY: this.stage.scaleY(),
        fontFamily: screenFont,
        fontSize: 12,
        fill: 'white',
      }),
    );
  }

  drawTextLine(text, line) {
    this._offlineScreen.push(
      new Konva.Text({
        text,
        x: getScreenX(2),
        y: getScreenY(line * 13),
        width: screenWidth - 2,
        scaleY: this.stage.scaleY(),
        fontFamily: screenFont,
        fontSize: 12,
        fill: 'white',
      }),
    );
  }

  drawPixel(x, y) {
    this.drawLine(x, y, x, y + 1);
  }

  drawLine(x1, y1, x2, y2) {
    this._offlineScreen.push(
      new Konva.Line({
        points: [getScreenX(x1), getScreenY(y1), getScreenX(x2), getScreenY(y2)],
        stroke: 'white',
        strokeWidth: 1,
      }),
    );
  }

  drawEllipse(x, y, radiusX, radiusY) {
    this._offlineScreen.push(
      new Konva.Ellipse({
        radiusX,
        radiusY,
        x: getScreenX(x),
        y: getScreenY(y),
        scaleY: this.stage.scaleY(),
        stroke: 'white',
        strokeWidth: 1,
      }),
    );
  }

  drawRect(x, y, width, height) {
    this._offlineScreen.push(
      new Konva.Rect({
        width,
        height,
        x: getScreenX(x),
        y: getScreenY(y),
        scaleY: this.stage.scaleY(),
        stroke: 'white',
        strokeWidth: 1,
      }),
    );
  }

  fillRect(x, y, width, height) {
    this._offlineScreen.push(
      new Konva.Rect({
        width,
        height,
        x: getScreenX(x),
        y: getScreenY(y),
        scaleY: this.stage.scaleY(),
        fill: 'white',
      }),
    );
  }
}
