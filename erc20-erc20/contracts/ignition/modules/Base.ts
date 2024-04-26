import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { base } from '../params';

export default buildModule('Base', m => {
    const otcMarket = m.contract('MyOtcMarket', [base.chain, base.owner, base.relayer]);

    const token = m.contract('MyToken', [base.owner]);

    return { otcMarket, token };
});
