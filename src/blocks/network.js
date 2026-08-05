import { translate, themeColors } from '@blockcode/core';

// espnow 发送辅助函数
const EspnowSend = `
async def espnow_asend(msg, mac="ff:ff:ff:ff:ff:ff"):
  mac_addr = mac
  if isinstance(mac, str):
    mac_addr = bytes.fromhex(mac.replace(" ", "").replace(":", "").replace(",", ""))
  msg_data = msg if isinstance(msg, bytes) else str(msg).encode()
  max_size = min(250, len(msg_data))
  msg_data = msg_data[:max_size]
  try:
    await espnow.asend(mac_addr, msg_data)
  except OSError as err:
    if len(err.args) > 1 and err.args[1] == "ESP_ERR_ESPNOW_NOT_FOUND":
      espnow.add_peer(mac_addr)
      await espnow.asend(mac_addr, msg_data)
`;

export default () => ({
  id: 'network',
  name: translate('esp32.blocks.network', 'Network'),
  themeColor: '#28A0DC',
  inputColor: '#42A8DB',
  otherColor: '#1386BF',
  order: 6,
  blocks: [
    {
      id: 'ifconfig',
      text: translate('esp32.blocks.networkCofing', 'local %1'),
      output: 'string',
      inputs: {
        TYPE: {
          menu: [
            [translate('esp32.blocks.networkCofingIp', 'ip'), 'IP'],
            [translate('esp32.blocks.networkCofingMac', 'mac address'), 'MAC'],
          ],
        },
      },
      mpy(block) {
        const type = block.getFieldValue('TYPE') || 'IP';
        this.definitions_['import_network'] = 'import network';
        this.definitions_['wlan'] = 'wlan = network.WLAN(); wlan.active(True)';
        let code = '';
        if (type === 'IP') {
          code = 'wlan.ifconfig()[0]';
        } else if (type === 'MAC') {
          code = '":".join(["%02x" % b for b in wlan.config("mac")])';
        }
        return [code, this.ORDER_FUNCTION_CALL];
      },
      emu(block) {
        const code = '127.0.0.1';
        return [code];
      },
    },
    {
      id: 'isconnected',
      text: translate('esp32.blocks.isWifiConnected', 'wifi is connected?'),
      output: 'boolean',
      mpy(block) {
        this.definitions_['import_network'] = 'import network';
        this.definitions_['wlan'] = 'wlan = network.WLAN(); wlan.active(True)';
        return ['wlan.isconnected()', this.ORDER_FUNCTION_CALL];
      },
      emu(block) {
        return [true];
      },
    },
    '---',
    {
      id: 'connectwifi',
      text: translate('esp32.blocks.connectWifi', 'connect wifi ssid: %1 password: %2'),
      inputs: {
        SSID: {
          type: 'string',
          defaultValue: 'iotbit',
        },
        PASSWORD: {
          type: 'string',
          defaultValue: '12345678',
        },
      },
      mpy(block) {
        this.definitions_['import_network'] = 'import network';
        this.definitions_['wlan'] = 'wlan = network.WLAN(); wlan.active(True)';

        let ssid = this.valueToCode(block, 'SSID', this.ORDER_NONE);
        let pass = this.valueToCode(block, 'PASSWORD', this.ORDER_NONE);
        ssid = isNaN(ssid) ? ssid : this.quote_(ssid);
        pass = isNaN(pass) ? pass : this.quote_(pass);

        let code = '';
        code += 'if wlan.isconnected():\n';
        code += '  wlan.disconnect() \n';
        code += '  await asyncio.sleep_ms(500)\n';
        code += `wlan.connect(${ssid}, ${pass})\n`;
        return code;
      },
    },
    {
      id: 'disconnect',
      text: translate('esp32.blocks.disconnectWifi', 'disconnect wifi'),
      mpy(block) {
        this.definitions_['import_network'] = 'import network';
        this.definitions_['wlan'] = 'wlan = network.WLAN(); wlan.active(True)';
        const code = 'wlan.disconnect()\n';
        return code;
      },
    },
    '---',
    {
      id: 'wifiscan',
      text: translate('esp32.blocks.wifiScan', 'start scan wifi'),
      mpy(block) {
        this.definitions_['import_threading'] = 'import _thread as threading';
        this.definitions_['import_network'] = 'import network';
        this.definitions_['wlan'] = 'wlan = network.WLAN(); wlan.active(True)';
        this.definitions_['wifi_list'] = 'wifi_list = []';
        let code = '';
        code += 'threading.start_new_thread(';
        code += 'lambda: wifi_list.extend(wlan.scan()), ())\n';
        return code;
      },
    },
    {
      id: 'wificounts',
      text: translate('esp32.blocks.wifiCounts', 'available wifi counts'),
      output: 'number',
      mpy(block) {
        this.definitions_['import_network'] = 'import network';
        this.definitions_['wlan'] = 'wlan = network.WLAN(); wlan.active(True)';
        this.definitions_['wifi_list'] = 'wifi_list = []';
        return ['len(wifi_list)', this.ORDER_FUNCTION_CALL];
      },
    },
    {
      id: 'wifiitem',
      text: translate('esp32.blocks.wifiItem', '%2 of item %1 of available wifi'),
      output: 'number',
      inputs: {
        INDEX: {
          type: 'integer',
          defaultValue: 1,
        },
        ITEM: {
          menu: [
            [translate('esp32.blocks.wifiItemSsid', 'ssid'), 'SSID'],
            [translate('esp32.blocks.wifiItemRssi', 'rssi'), 'RSSI'],
            [translate('esp32.blocks.wifiItemSecurity', 'security'), 'SECURITY'],
            [translate('esp32.blocks.wifiItemMac', 'mac address'), 'MAC'],
          ],
        },
      },
      mpy(block) {
        const index = this.getAdjusted(block, 'INDEX') || 0;
        const item = block.getFieldValue('ITEM') || 'SSID';
        this.definitions_['import_network'] = 'import network';
        this.definitions_['wlan'] = 'wlan = network.WLAN(); wlan.active(True)';
        this.definitions_['wifi_list'] = 'wifi_list = []';
        let code = `wifi_list[${index}]`;
        switch (item) {
          case 'MAC':
            code += '[1]';
            break;
          case 'RSSI':
            code += '[3]';
            break;
          case 'SECURITY':
            code += '[4]';
            break;
          default:
            code += '[0]';
            break;
        }
        return [code, this.ORDER_ATOMIC];
      },
    },
    '---',
    {
      id: 'startap',
      text: translate('esp32.blocks.startap', 'start ap ssid: %1'),
      inputs: {
        SSID: {
          type: 'string',
          defaultValue: 'esp-ap',
        },
      },
      mpy(block) {
        const ssid = this.valueToCode(block, 'SSID', this.ORDER_NONE);
        this.definitions_['import_network'] = 'import network';
        this.definitions_['ap'] = 'ap = network.WLAN(network.WLAN.IF_AP)';
        let code = '';
        code += `ap.config(ssid=${ssid})\n`;
        code += 'ap.active(True)\n';
        return code;
      },
    },
    {
      id: 'stopap',
      text: translate('esp32.blocks.stopap', 'stop ap'),
      mpy(block) {
        this.definitions_['import_network'] = 'import network';
        this.definitions_['ap'] = 'ap = network.WLAN(network.AP_IF)';
        return 'ap.active(False)\n';
      },
    },
    '---',
    {
      id: 'espnowsend',
      text: translate('esp32.blocks.espnowSend', 'send %1 to %2 via esp-now'),
      inputs: {
        MESSAGE: {
          type: 'string',
          defaultValue: 'hello',
        },
        MAC: {
          type: 'string',
          defaultValue: 'ff:ff:ff:ff:ff:ff',
        },
      },
      mpy(block) {
        const msg = this.valueToCode(block, 'MESSAGE', this.ORDER_NONE);
        const mac = this.valueToCode(block, 'MAC', this.ORDER_NONE);
        this.definitions_['import_network'] = 'import network';
        this.definitions_['import_aioespnow'] = 'from aioespnow import AIOESPNow';
        this.definitions_['wlan'] = 'wlan = network.WLAN(); wlan.active(True)';
        this.definitions_['espnow'] = 'espnow = AIOESPNow(); espnow.active(True)';
        this.definitions_['espnow_asend'] = EspnowSend;
        return `await espnow_asend(${msg}, ${mac})\n`;
      },
    },
    {
      id: 'espnowbroadcast',
      text: translate('esp32.blocks.espnowBroadcast', 'broadcast %1 via esp-now'),
      inputs: {
        MESSAGE: {
          type: 'string',
          defaultValue: 'hello',
        },
      },
      mpy(block) {
        const msg = this.valueToCode(block, 'MESSAGE', this.ORDER_NONE);
        this.definitions_['import_network'] = 'import network';
        this.definitions_['import_aioespnow'] = 'from aioespnow import AIOESPNow';
        this.definitions_['wlan'] = 'wlan = network.WLAN(); wlan.active(True)';
        this.definitions_['espnow'] = 'espnow = AIOESPNow(); espnow.active(True)';
        this.definitions_['espnow_asend'] = EspnowSend;
        return `await espnow_asend(${msg})\n`;
      },
    },
    // {
    //   id: 'espnowrecv',
    //   text: translate('esp32.blocks.espnowRecv', 'wait for esp-now incoming'),
    //   mpy(block) {
    //     this.definitions_['import_network'] = 'import network';
    //     this.definitions_['import_aioespnow'] = 'from aioespnow import AIOESPNow';
    //     this.definitions_['wlan'] = 'wlan = network.WLAN(); wlan.active(True)';
    //     this.definitions_['espnow'] = 'espnow = AIOESPNow(); espnow.active(True)';
    //     const code = `peer, msg = await espnow.arecv()\n`;
    //     return code;
    //   },
    // },
    {
      id: 'espnowmsg',
      text: translate('esp32.blocks.espnowMsg', '%1 of incoming'),
      output: 'string',
      inputs: {
        TYPE: {
          menu: [
            [translate('esp32.blocks.espnowMsgText', 'text'), 'TEXT'],
            [translate('esp32.blocks.espnowMsgBytes', 'bytes'), 'BYTES'],
            [translate('esp32.blocks.espnowMsgMac', 'mac address'), 'MAC'],
          ],
        },
      },
      mpy(block) {
        const type = block.getFieldValue('TYPE') || 'TEXT';
        this.definitions_['import_network'] = 'import network';
        this.definitions_['import_aioespnow'] = 'from aioespnow import AIOESPNow';
        this.definitions_['wlan'] = 'wlan = network.WLAN(); wlan.active(True)';
        this.definitions_['espnow'] = 'espnow = AIOESPNow(); espnow.active(True)';
        let code = 'msg';
        if (type === 'MAC') {
          code = 'peer.hex(":")';
        } else if (type === 'TEXT') {
          code = 'msg.decode()';
        }
        return [code, this.ORDER_FUNCTION_CALL];
      },
    },
    '---',
    {
      id: 'espnowwhen',
      text: translate('esp32.blocks.espnowWhen', 'when esp-now receive %1'),
      hat: true,
      inputs: {
        MESSAGE: {
          type: 'string',
          defaultValue: translate('esp32.blocks.espnowMsgText', 'message'),
        },
      },
      mpy(block) {
        const msg = this.valueToCode(block, 'MSG', this.ORDER_NONE);
        this.definitions_['import_network'] = 'import network';
        this.definitions_['import_aioespnow'] = 'from aioespnow import AIOESPNow';
        this.definitions_['wlan'] = 'wlan = network.WLAN(); wlan.active(True)';
        this.definitions_['espnow'] = 'espnow = AIOESPNow(); espnow.active(True)';

        const flagName = this.createName('event_flag');
        this.definitions_[flagName] = `${flagName} = asyncio.ThreadSafeFlag()`;
        if (!this.definitions_['espnow_received']) {
          let code = '';
          code += '@_tasks__.append\n';
          code += 'async def espnow_received():\n';
          code += '  async for peer, msg in espnow:\n';
          this.definitions_['espnow_received'] = code;
        }
        this.definitions_['espnow_received'] += `    if msg.decode() == ${msg}: ${flagName}.set()\n`;

        let branchCode = this.statementToCode(block) || this.PASS;
        let code = '';
        code += 'while True:\n';
        code += `  await ${flagName}.wait()\n`;
        code += branchCode;

        branchCode = this.prefixLines(code, this.INDENT);
        branchCode = this.addEventTrap(branchCode, 'espnow_received');
        code = '@_tasks__.append\n';
        code += branchCode;
        return code;
      },
    },
    {
      id: 'espnowrepeat',
      text: translate('esp32.blocks.espnowRepeat', 'repeat wait for esp-now incoming'),
      repeat: true,
      end: true,
      mpy(block) {
        this.definitions_['import_network'] = 'import network';
        this.definitions_['import_aioespnow'] = 'from aioespnow import AIOESPNow';
        this.definitions_['wlan'] = 'wlan = network.WLAN(); wlan.active(True)';
        this.definitions_['espnow'] = 'espnow = AIOESPNow(); espnow.active(True)';

        let branchCode = this.statementToCode(block, 'SUBSTACK') || this.PASS;
        branchCode = this.addLoopTrap(branchCode, block.id);
        let code = '';
        code += 'async for peer, msg in espnow:\n';
        code += branchCode;
        return code;
      },
    },
  ],
});
