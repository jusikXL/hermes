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
          84532: '0x146eBBD4026726A4B80E21f259713944F3B7acF2',
          11155420: '0x716CBA8A62CBc0F4f5715986B6763b211722f4E1',
        },
        MyToken: {
          84532: '0x7B7789A97B6b931269d95426bb1e328E93F077a4',
          11155420: '0x8011c2967d2b253774eCaEe78B92642cF2e0aa1e',
        },
      },
    }),
  ],
});
