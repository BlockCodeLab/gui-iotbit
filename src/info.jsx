import { addLocalesMessages, Text } from '@blockcode/core';
import { version } from '../package.json';
import featureImage from './feature.svg';

export default {
  version,
  preview: true,
  sortIndex: 104,
  image: featureImage,
  name: (
    <Text
      id="iotbit.name"
      defaultMessage="iot:bit"
    />
  ),
  description: (
    <Text
      id="iotbit.description"
      defaultMessage="A board for mastering IoT."
    />
  ),
  collaborator: (
    <Text
      id="iotbit.collaborator"
      defaultMessage="Emakefun"
    />
  ),
  blocksRequired: true,
  micropythonRequired: true,
};

addLocalesMessages({
  en: {
    'iotbit.name': 'iot:bit',
    'iotbit.description': 'A board for mastering IoT.',
    'iotbit.collaborator': 'Emakefun',
  },
  'zh-Hans': {
    'iotbit.name': '物联板 iot:bit',
    'iotbit.description': '兼容掌控板的物联网开发板。',
    'iotbit.collaborator': '易创空间',
  },
  'zh-Hant': {
    'iotbit.name': 'iot:bit',
    'iotbit.description': '玩轉物聯網的小開發板。',
    'iotbit.collaborator': 'Emakefun',
  },
});
