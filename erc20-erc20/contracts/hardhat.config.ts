import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-foundry';
import { vars } from 'hardhat/config';

const PRIVATE_KEY = vars.get('PRIVATE_KEY');

const config: HardhatUserConfig = {
    solidity: {
        version: '0.8.24',
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    networks: {
        optimism_testnet: {
            url: 'https://sepolia.optimism.io',
            accounts: [PRIVATE_KEY],
            chainId: 11155420,
        },
        base_testnet: {
            url: 'https://base-sepolia-rpc.publicnode.com',
            accounts: [PRIVATE_KEY],
            chainId: 84532,
        },
    },
};

export default config;
