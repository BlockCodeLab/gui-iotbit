import { basename, extname } from 'node:path';
import { useCallback } from 'preact/hooks';
import { useAppContext, useProjectContext } from '@blockcode/core';
import { MicroPythonGenerator, BlocksEditor } from '@blockcode/blocks';
import { IotBitGenerator, buildBlocks } from '../../blocks/blocks';
import { extensionTags } from './extension-tags';

// 过滤字符
const escape = (name) => name.replaceAll(/[^a-z0-9]/gi, '_').replace(/^_/, '');

const generator = new IotBitGenerator();

const handleExtensionsFilter = () => [['device', '!scratch'], 'data'];

export function IotBitBlocksEditor() {
  const { tabIndex } = useAppContext();

  const { meta } = useProjectContext();

  const handleDefinitions = useCallback((name, define, resources, index) => {
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
  }, []);

  return (
    <BlocksEditor
      // enableCodePreview
      enableProcedureReturns
      disableSensingBlocks
      disableGenerateCode={tabIndex.value !== 0}
      extensionTags={extensionTags}
      generator={generator}
      onBuildinExtensions={buildBlocks}
      onDefinitions={handleDefinitions}
      onExtensionsFilter={handleExtensionsFilter}
    />
  );
}
