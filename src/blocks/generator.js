import { MicroPythonGenerator, EmulatorGenerator } from '@blockcode/blocks';

const GENERATOR_COMMENT = '# Generate by BlockCode\n';

export class IotBitGenerator extends MicroPythonGenerator {
  finish(code) {
    return GENERATOR_COMMENT + 'from iotbit import *\n' + super.finish(code);
  }
}

export class IotBitEmulatorGenerator extends EmulatorGenerator {}
