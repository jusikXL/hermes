import { defineConfig } from '@wagmi/cli';
import { foundry } from '@wagmi/cli/plugins';

export default defineConfig({
  out: 'src/config/contracts.ts',
  contracts: [],
  plugins: [
    foundry({
      project: '../contracts',
      include: ['OtcMarket.json', 'MyToken.json'],
      deployments: {
        OtcMarket: {
          84532: '0x3Dd30df1B28b1fA68e3BCdC1DbF6DD38ec16f01C',
          11155420: '0x63d88ff1D22Ce35238DA2842FCeA6B2409D87f6B',
        },
        MyToken: {
          84532: '0xFA261f2b4C4b97cd78CeAFD6d68b39C9095E8aE8',
          11155420: '0x43378Ec7c37C2150446C79E7B098F04a076fcC3D',
        },
      },
    }),
  ],
});
