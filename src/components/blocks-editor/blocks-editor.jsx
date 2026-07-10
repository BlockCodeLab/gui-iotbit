import { basename, extname } from 'node:path';
import { useRef, useCallback, useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { classNames } from '@blockcode/utils';
import { useAppContext, useProjectContext, setMeta, Button, Text } from '@blockcode/core';
import { MicroPythonGenerator, BlocksEditor } from '@blockcode/blocks';
import { IotBitGenerator, IotBitEmulatorGenerator, buildBlocks } from '../../blocks/blocks';
import { getBoardPins } from '../../blocks/pins';
import { extensionTags } from './extension-tags';
import styles from './blocks-editor.module.css';

import previewCodeIcon from './icon-code.svg';
import emulatorIcon from './icon-device.svg';

// 过滤字符
const escape = (name) => name.replaceAll(/[^a-z0-9]/gi, '_').replace(/^_/, '');

const generator = new IotBitGenerator();
const emulator = new IotBitEmulatorGenerator();

const handleExtensionsFilter = () => [['device', '!scratch'], 'data'];

export function IotBitBlocksEditor() {
  const editorRef = useRef(null);

  const previewCode = useSignal(false);

  const { splashVisible, tabIndex, appState } = useAppContext();

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
          if (extModule.header) {
            const libId = basename(extModule.name, extname(extModule.name));
            if (extModule.common) {
              define(`import_${libId}`, `import ${libId}`);
            } else {
              define(`import_${id}_${libId}`, `from ${escape(id)} import ${libId}`);
            }
          }
        }
      }
      return;
    }

    if (name === emulator.name_) {
    }
  }, []);

  const handleCodePreviewChange = useCallback(({ visible }) => {
    previewCode.value = visible;
    if (visible) {
      document.getElementById('emulator-sidedock').parentElement.style.display = 'none';
    } else {
      document.getElementById('emulator-sidedock').parentElement.style.display = 'block';
    }
  }, []);

  return (
    <>
      <BlocksEditor
        enableCodePreview
        enableProcedureExecute
        enableProcedureReturns
        disableSensingBlocks
        editorRef={editorRef}
        defaultCodePreviewVisible={false}
        disableGenerateCode={tabIndex.value !== 0}
        extensionTags={extensionTags}
        generator={generator}
        emulator={emulator}
        onBuildinExtensions={buildBlocks}
        onDefinitions={handleDefinitions}
        onExtensionsFilter={handleExtensionsFilter}
        onCodePreviewChange={handleCodePreviewChange}
      />
      <div
        className={classNames(styles.emulatorButton, {
          [styles.previewCodeButton]: !previewCode.value,
          [styles[appState.value?.stageSize]]: !previewCode.value,
        })}
      >
        <Button onClick={editorRef.current?.toggleCodePreview}>
          {previewCode.value ? (
            <>
              <img
                className={styles.icon}
                src={emulatorIcon}
              />
              <Text
                id="iotbit.emu.enable"
                defaultMessage="Enable Emulator"
              />
            </>
          ) : (
            <>
              <img
                className={styles.icon}
                src={previewCodeIcon}
              />
              <Text
                id="iotbit.emu.previewCode"
                defaultMessage="Preview Code"
              />
            </>
          )}
        </Button>
      </div>
    </>
  );
}
