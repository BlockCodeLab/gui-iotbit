export default () => ({
  id: 'procedures',
  skipXML: true,
  blocks: [
    {
      id: 'definition',
      mpy(block) {
        const myBlock = block.childBlocks_[0];
        const funcName = this.getDistinctName(myBlock.getProcCode());
        let branchCode = this.statementToCode(block) || this.PASS;

        // 参数格式：name
        const args = myBlock.childBlocks_.map((argBlock) => `${this.getVariableName(argBlock.getFieldValue('VALUE'))}`);

        // 定义函数
        let code = '';
        code += `async def ${funcName}(${args.join(', ')}):\n`;
        code += branchCode;
        this.definitions_[funcName] = code;
      },
    },
    {
      id: 'call',
      mpy(block) {
        const funcName = this.getDistinctName(block.getProcCode());
        const args = block.argumentIds_.map((arg) => this.valueToCode(block, arg, this.ORDER_NONE) || 'False');
        const code = `await ${funcName}(${args.join(', ')})`;

        if (block.return_) {
          return [code, this.ORDER_FUNCTION_CALL];
        }
        return code + '\n';
      },
    },
    {
      id: 'return',
      mpy(block) {
        const valueCode = this.valueToCode(block, 'VALUE', this.ORDER_NONE);
        const code = `return ${valueCode}\n`;
        return code;
      },
    },
  ],
});
