import { setAlert, delAlert, translate, logger } from '@blockcode/core';
import { MPYUtils } from '@blockcode/board';

const downloadingAlert = (id, progress) => {
  if (progress < 100) {
    setAlert('downloading', { id, progress });
  } else {
    setAlert('downloadCompleted', { id });
    setTimeout(() => delAlert(id), 1000);
  }
};

export const downloadProgram = async (id, device, mainFile, assetFiles) => {
  downloadingAlert(id, 0);
  logger.log(translate('gui.logs.downloading', 'Downloading...'));

  const projectFiles = [].concat(mainFile, assetFiles).map((file) => ({
    ...file,
    filename: file.id,
  }));

  try {
    // 开始下载
    await MPYUtils.write(device, projectFiles, downloadingAlert.bind(null, id));
    logger.success(translate('gui.logs.downloaded', 'Download completed'));
    device.reset();
  } catch (err) {
    setAlert('downloadError', { id }, 1000);
    logger.error(translate('gui.logs.downloadError', 'Download failed') + ': ' + err.message);
  }
};
