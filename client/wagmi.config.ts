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
          84532: '0xB01B23527797AFB7dAafF62ada9ad7Fb75cF57f0',
          11155420: '0xbbf2c8801367AA474468AeF5d990d17B7735Af03',
        },
        MyToken: {
          84532: '0x7B7789A97B6b931269d95426bb1e328E93F077a4',
          11155420: '0x8011c2967d2b253774eCaEe78B92642cF2e0aa1e',
        },
      },
    }),
  ],
});
