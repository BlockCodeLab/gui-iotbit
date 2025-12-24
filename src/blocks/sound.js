import { translate, themeColors } from '@blockcode/core';

export default () => ({
  id: 'sound',
  name: '%{BKY_CATEGORY_SOUND}',
  themeColor: themeColors.blocks.sounds.primary,
  inputColor: themeColors.blocks.sounds.secondary,
  otherColor: themeColors.blocks.sounds.tertiary,
  order: 2,
  blocks: [
    {
      id: 'playnote',
      text: translate('iotbit.blocks.playNote', 'play note %1 for %2 beats'),
      inputs: {
        NOTE: {
          type: 'note',
          defaultValue: '60',
        },
        BEAT: {
          type: 'integer',
          defaultValue: '1',
        },
      },
      mpy(block) {
        const note = this.valueToCode(block, 'NOTE', this.ORDER_NONE);
        const beat = this.valueToCode(block, 'BEAT', this.ORDER_NONE);
        const code = `await audio.aplay(${note}":${beat}")\n`;
        return code;
      },
      emu(block) {
        const note = this.valueToCode(block, 'NOTE', this.ORDER_NONE);
        const beat = this.valueToCode(block, 'BEAT', this.ORDER_NONE);
        const code = `await runtime.tone.play(${note} + ":${beat}");\n`;
        return code;
      },
    },
    '---',
    {
      id: 'playmusicawait',
      text: translate('iotbit.blocks.playMusicDone', 'play sound %1 until done'),
      inputs: {
        MUSIC: {
          menu: 'MUSIC',
        },
      },
      mpy(block) {
        const music = block.getFieldValue('MUSIC');
        const code = `await audio.aplay(Music.${music})\n`;
        return code;
      },
      emu(block) {
        const music = block.getFieldValue('MUSIC');
        const code = `await runtime.tone.play(runtime.tone.Music.${music});\n`;
        return code;
      },
    },
    {
      id: 'playmusic',
      text: translate('iotbit.blocks.playMusic', 'start sound %1'),
      inputs: {
        MUSIC: {
          menu: 'MUSIC',
        },
      },
      mpy(block) {
        const music = block.getFieldValue('MUSIC');
        const code = `asyncio.create_task(audio.aplay(Music.${music}))\n`;
        return code;
      },
      emu(block) {
        const music = block.getFieldValue('MUSIC');
        const code = `runtime.tone.play(runtime.tone.Music.${music});\n`;
        return code;
      },
    },
    {
      id: 'stopmusic',
      text: translate('iotbit.blocks.stopMusic', 'stop music'),
      mpy(block) {
        return 'audio.stop()\n';
      },
      emu(block) {
        return 'runtime.tone.stop();\n';
      },
    },
  ],
  menus: {
    MUSIC: {
      type: 'string',
      defaultValue: 'DADADADUM',
      items: [
        [translate('iotbit.blocks.musicDadadadum', 'dadadadum'), 'DADADADUM'],
        [translate('iotbit.blocks.musicEntertainer', 'entertainer'), 'ENTERTAINER'],
        [translate('iotbit.blocks.musicPrelude', 'prelude'), 'PRELUDE'],
        [translate('iotbit.blocks.musicOde', 'ode'), 'ODE'],
        [translate('iotbit.blocks.musicNyan', 'nyan'), 'NYAN'],
        [translate('iotbit.blocks.musicRingtone', 'ringtone'), 'RINGTONE'],
        [translate('iotbit.blocks.musicFunk', 'funk'), 'FUNK'],
        [translate('iotbit.blocks.musicBlues', 'blues'), 'BLUES'],
        [translate('iotbit.blocks.musicBirthday', 'birthday'), 'BIRTHDAY'],
        [translate('iotbit.blocks.musicWedding', 'wedding'), 'WEDDING'],
        [translate('iotbit.blocks.musicFuneral', 'funeral'), 'FUNERAL'],
        [translate('iotbit.blocks.musicPunchline', 'punchline'), 'PUNCHLINE'],
        [translate('iotbit.blocks.musicPython', 'python'), 'PYTHON'],
        [translate('iotbit.blocks.musicBaddy', 'baddy'), 'BADDY'],
        [translate('iotbit.blocks.musicChase', 'chase'), 'CHASE'],
        [translate('iotbit.blocks.musicBaDing', 'ba ding'), 'BA_DING'],
        [translate('iotbit.blocks.musicWawawawaa', 'wawawawaa'), 'WAWAWAWAA'],
        [translate('iotbit.blocks.musicJumpUp', 'jump up'), 'JUMP_UP'],
        [translate('iotbit.blocks.musicJumpDown', 'jump down'), 'JUMP_DOWN'],
        [translate('iotbit.blocks.musicPowerUp', 'power up'), 'POWER_UP'],
        [translate('iotbit.blocks.musicPowerDown', 'power down'), 'POWER_DOWN'],
      ],
    },
  },
});
