import { http, createConfig } from 'wagmi';
import { baseSepolia, optimismSepolia } from 'wagmi/chains';

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}

export const config = createConfig({
  chains: [baseSepolia, optimismSepolia],
  transports: {
    [baseSepolia.id]: http(),
    [optimismSepolia.id]: http(),
  },
});
