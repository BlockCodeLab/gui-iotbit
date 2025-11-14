import { translate, themeColors } from '@blockcode/core';

export default () => ({
  id: 'sound',
  name: '%{BKY_CATEGORY_SOUND}',
  themeColor: themeColors.blocks.sounds.primary,
  inputColor: themeColors.blocks.sounds.secondary,
  otherColor: themeColors.blocks.sounds.tertiary,
  order: 2,
  blocks: [
    // {
    //   id: 'playnote',
    //   text: translate('iotbit.blocks.playNote', 'play note %1 for %2 beats'),
    //   inputs: {
    //     NOTE: {
    //       type: 'note',
    //       defaultValue: '60',
    //     },
    //     BEAT: {
    //       type: 'integer',
    //       defaultValue: '1',
    //     },
    //   },
    //   mpy(block) {
    //     const note = this.valueToCode(block, 'NOTE', this.ORDER_NONE);
    //     const beat = this.valueToCode(block, 'BEAT', this.ORDER_NONE);
    //     const code = `_tone.play(${note}":${beat}")\n`;
    //     return code;
    //   },
    // },
    // {
    //   id: 'playmusic',
    //   text: translate('iotbit.blocks.playMusic', 'play %1'),
    //   inputs: {
    //     MUSIC: {
    //       menu: 'MUSIC',
    //     },
    //   },
    //   mpy(block) {
    //     const music = block.getFieldValue('MUSIC');
    //     const code = `await _tone.aplay(buzzer.${music.toUpperCase()})\n`;
    //     return code;
    //   },
    // },
    // {
    //   id: 'stopmusic',
    //   text: translate('iotbit.blocks.stopMusic', 'stop music'),
    //   mpy(block) {
    //     return '_tone.stop()\n';
    //   },
    // },
  ],
  menus: {
    MUSIC: {
      type: 'string',
      defaultValue: 'dadadadum',
      items: [
        [translate('iotbit.blocks.musicDadadadum', 'dadadadum'), 'dadadadum'],
        [translate('iotbit.blocks.musicEntertainer', 'entertainer'), 'entertainer'],
        [translate('iotbit.blocks.musicPrelude', 'prelude'), 'prelude'],
        [translate('iotbit.blocks.musicOde', 'ode'), 'ode'],
        [translate('iotbit.blocks.musicNyan', 'nyan'), 'nyan'],
        [translate('iotbit.blocks.musicRingtone', 'ringtone'), 'ringtone'],
        [translate('iotbit.blocks.musicFunk', 'funk'), 'funk'],
        [translate('iotbit.blocks.musicBlues', 'blues'), 'blues'],
        [translate('iotbit.blocks.musicBirthday', 'birthday'), 'birthday'],
        [translate('iotbit.blocks.musicWedding', 'wedding'), 'wedding'],
        [translate('iotbit.blocks.musicFuneral', 'funeral'), 'funeral'],
        [translate('iotbit.blocks.musicPunchline', 'punchline'), 'punchline'],
        [translate('iotbit.blocks.musicPython', 'python'), 'python'],
        [translate('iotbit.blocks.musicBaddy', 'baddy'), 'baddy'],
        [translate('iotbit.blocks.musicChase', 'chase'), 'chase'],
        [translate('iotbit.blocks.musicBaDing', 'ba ding'), 'ba ding'],
        [translate('iotbit.blocks.musicWawawawaa', 'wawawawaa'), 'wawawawaa'],
        [translate('iotbit.blocks.musicJumpUp', 'jump up'), 'jump up'],
        [translate('iotbit.blocks.musicJumpDown', 'jump down'), 'jump down'],
        [translate('iotbit.blocks.musicPowerUp', 'power up'), 'power up'],
        [translate('iotbit.blocks.musicPowerDown', 'power down'), 'power down'],
      ],
    },
  },
});
