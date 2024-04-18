import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { optimism } from '../params';

export default buildModule('Optimism', m => {
    const otcMarket = m.contract('MyOtcMarket', [optimism.chain, optimism.owner, optimism.relayer]);

    const token = m.contract('MyToken', [optimism.owner]);

    return { otcMarket, token };
});
