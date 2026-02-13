import { basename, extname } from 'node:path';
import { useCallback, useEffect } from 'preact/hooks';
import { useAppContext, useProjectContext, setMeta } from '@blockcode/core';
import { MicroPythonGenerator, BlocksEditor } from '@blockcode/blocks';
import { IotBitGenerator, IotBitEmulatorGenerator, buildBlocks } from '../../blocks/blocks';
import { getBoardPins } from '../../blocks/pins';
import { extensionTags } from './extension-tags';

// 过滤字符
const escape = (name) => name.replaceAll(/[^a-z0-9]/gi, '_').replace(/^_/, '');

const generator = new IotBitGenerator();
const emulator = new IotBitEmulatorGenerator();

const handleExtensionsFilter = () => [['device', '!scratch'], 'data'];

export function IotBitBlocksEditor() {
  const { splashVisible, tabIndex } = useAppContext();

  const { meta } = useProjectContext();

  useEffect(() => {
    if (!meta.value.boardPins) {
      setMeta('boardPins', getBoardPins());
    }
  }, [splashVisible.value]);

  const handleDefinitions = useCallback((name, define, resources, index) => {
    if (name === generator.name_) {
      // 保留原有的定义
      MicroPythonGenerator.prototype.onDefinitions.call(generator);

      // 导入使用的扩展
      for (const id in resources) {
        for (const extModule of resources[id]) {
          if (!extModule.common) {
            const libId = basename(extModule.name, extname(extModule.name));
            define(`import_${id}_${libId}`, `from ${escape(id)} import ${libId}`);
          }
        }
      }
      return;
    }

    if (name === emulator.name_) {
    }
  }, []);

  return (
    <BlocksEditor
      // enableCodePreview
      enableProcedureExecute
      enableProcedureReturns
      disableSensingBlocks
      disableGenerateCode={tabIndex.value !== 0}
      extensionTags={extensionTags}
      generator={generator}
      emulator={emulator}
      onBuildinExtensions={buildBlocks}
      onDefinitions={handleDefinitions}
      onExtensionsFilter={handleExtensionsFilter}
    />
  );
}
