'use client';

import { CardStackIcon, CardStackPlusIcon } from '@radix-ui/react-icons';
import { writeContract } from '@wagmi/core';
import { getChainId } from '@wagmi/core';
import { useState } from 'react';
import { toast } from 'sonner';
import { parseEther } from 'viem';
import { useAccount, usePublicClient } from 'wagmi';
import { Button } from '@/components/ui/button';
import { myTokenAbi, myTokenAddress } from '@/config/contracts';
import { config } from '@/config/wagmi';
import { useMounted } from '@/hooks/use-mounted';

export default function Mint() {
  const isMounted = useMounted();
  const [isPending, setIsPending] = useState(false);
  const { isConnected, address } = useAccount();
  const client = usePublicClient();

  async function mint() {
    setIsPending(true);

    const mintPromise = writeContract(config, {
      address: myTokenAddress[getChainId(config)],
      abi: myTokenAbi,
      functionName: 'mint',
      args: [myTokenAddress[getChainId(config)], parseEther('1000000000')],
    });
    const mintResultPromise = mintPromise.then((tx) => {
      return client.waitForTransactionReceipt({
        hash: tx,
      });
    });

    toast.promise(mintResultPromise, {
      loading: 'Minting...',
      success: () => {
        setIsPending(false);
        return 'Minted!';
      },
      error: (err) => {
        setIsPending(false);
        return err.message;
      },
    });
    return 'Minted!';
  }

  return (
    <Button onClick={() => mint()}>
      <CardStackPlusIcon className="mr-2 h-4 w-4" /> Mint
    </Button>
  );
}
