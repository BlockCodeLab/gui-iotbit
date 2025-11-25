export default () => ({
  id: 'data',
  skipXML: true,
  blocks: [
    {
      // 获取变量
      id: 'variable',
      mpy(block) {
        const varName = this.getVariableName(block.getFieldValue('VARIABLE'));
        return [varName, this.ORDER_ATOMIC];
      },
    },
    {
      // 设置变量
      id: 'setvariableto',
      mpy(block) {
        const varName = this.getVariableName(block.getFieldValue('VARIABLE'));
        const varValue = this.valueToCode(block, 'VALUE', this.ORDER_NONE);
        const code = `${varName} = ${varValue}\n`;
        return code;
      },
    },
    {
      // 改变变量
      id: 'changevariableby',
      mpy(block) {
        const varName = this.getVariableName(block.getFieldValue('VARIABLE'));
        const varValue = this.valueToCode(block, 'VALUE', this.ORDER_NONE);
        return `${varName} += ${varValue}\n`;
      },
    },
    {
      // 获取列表
      id: 'listcontents',
      mpy(block) {
        const listName = this.getVariableName(block.getFieldValue('LIST')) + '_ls';
        return [listName, this.ORDER_ATOMIC];
      },
    },
    {
      // 加入列表
      id: 'addtolist',
      mpy(block) {
        const listName = this.getVariableName(block.getFieldValue('LIST')) + '_ls';
        const value = this.valueToCode(block, 'ITEM', this.ORDER_NONE);
        const code = `${listName}.append(${value})\n`;
        return code;
      },
    },
    {
      // 删除项目
      id: 'deleteoflist',
      mpy(block) {
        const listName = this.getVariableName(block.getFieldValue('LIST')) + '_ls';
        const index = this.getAdjusted(block, 'INDEX');
        const code = `${listName}.pop(${index})\n`;
        return code;
      },
    },
    {
      // 删除全部项目
      id: 'deletealloflist',
      mpy(block) {
        const listName = this.getVariableName(block.getFieldValue('LIST')) + '_ls';
        const code = `${listName} = []\n`;
        return code;
      },
    },
    {
      // 插入项目
      id: 'insertatlist',
      mpy(block) {
        const listName = this.getVariableName(block.getFieldValue('LIST')) + '_ls';
        const index = this.getAdjusted(block, 'INDEX');
        const value = this.valueToCode(block, 'ITEM', this.ORDER_NONE);
        const code = `${listName}.insert(${index}, ${value})\n`;
        return code;
      },
    },
    {
      // 替换
      id: 'replaceitemoflist',
      mpy(block) {
        const listName = this.getVariableName(block.getFieldValue('LIST')) + '_ls';
        const value = this.valueToCode(block, 'ITEM', this.ORDER_NONE);
        const index = this.getAdjusted(block, 'INDEX');
        const code = `${listName}[${index}] = ${value}\n`;
        return code;
      },
    },
    {
      // 获取数组项
      id: 'itemoflist',
      mpy(block) {
        const listName = this.getVariableName(block.getFieldValue('LIST')) + '_ls';
        const index = this.getAdjusted(block, 'INDEX');
        const code = `${listName}[${index}]`;
        return [code, this.ORDER_MEMBER];
      },
    },
    {
      // 查找项目
      id: 'itemnumoflist',
      mpy(block) {
        const listName = this.getVariableName(block.getFieldValue('LIST')) + '_ls';
        const value = this.valueToCode(block, 'ITEM', this.ORDER_NONE);
        const code = `${listName}.index(${value})`;
        return [code, this.ORDER_FUNCTION_CALL];
      },
    },
    {
      // 列表长度
      id: 'lengthoflist',
      mpy(block) {
        const listName = this.getVariableName(block.getFieldValue('LIST')) + '_ls';
        const code = `len(${listName})`;
        return [code, this.ORDER_FUNCTION_CALL];
      },
    },
    {
      // 是否有
      id: 'listcontainsitem',
      mpy(block) {
        const listName = this.getVariableName(block.getFieldValue('LIST')) + '_ls';
        const value = this.valueToCode(block, 'ITEM', this.ORDER_NONE);
        const code = `(${listName}.count(${value}) > 0)`;
        return [code, this.ORDER_FUNCTION_CALL];
      },
    },
  ],
});
