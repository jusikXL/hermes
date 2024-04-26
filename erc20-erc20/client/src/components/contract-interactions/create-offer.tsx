'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircledIcon } from '@radix-ui/react-icons';
import { writeContract, readContract } from '@wagmi/core';
import { getChainId } from '@wagmi/core';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { getAddress, isAddress, parseEther } from 'viem';
import { useAccount, usePublicClient } from 'wagmi';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { myTokenAbi, myTokenAddress, otcMarketAbi, otcMarketAddress } from '@/config/contracts';
import { config } from '@/config/wagmi';
import { useMounted } from '@/hooks/use-mounted';

const formSchema = z.object({
  chain: z.coerce.number().positive(),
  sourceToken: z.coerce
    .string()
    .trim()
    .refine((value) => isAddress(value))
    .transform((value) => getAddress(value)),
  targetToken: z.coerce
    .string()
    .trim()
    .refine((value) => isAddress(value))
    .transform((value) => getAddress(value)),
  amount: z.coerce.number().positive(),
  exchangeRate: z.coerce.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateOffer() {
  const isMounted = useMounted();
  const [isPending, setIsPending] = useState(false);
  const { isConnected, address } = useAccount();
  const client = usePublicClient();

  const [open, setOpen] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: FormValues) {
    setIsPending(true);

    const approvePromise = writeContract(config, {
      address: myTokenAddress[getChainId(config)],
      abi: myTokenAbi,
      functionName: 'approve',
      args: [otcMarketAddress[getChainId(config)], parseEther(values.amount.toString())],
    });
    const approveResultPromise = approvePromise.then((tx) => {
      return client.waitForTransactionReceipt({
        hash: tx,
      });
    });

    toast.promise(approveResultPromise, {
      loading: 'Approving...',
      success: () => {
        const costPromise = readContract(config, {
          address: otcMarketAddress[getChainId(config)],
          abi: otcMarketAbi,
          functionName: 'quoteCrossChainDelivery',
          args: [values.chain, BigInt(0)],
        });

        toast.promise(costPromise, {
          loading: 'Evaluating a gas fee...',
          success: (cost) => {
            const createOfferPromise = writeContract(config, {
              address: otcMarketAddress[getChainId(config)],
              abi: otcMarketAbi,
              functionName: 'createOffer',
              args: [
                values.chain,
                address!,
                values.sourceToken,
                values.targetToken,
                parseEther(values.amount.toString()),
                parseEther(values.exchangeRate.toString()),
              ],
              value: cost,
            });
            const createOfferResultPromise = createOfferPromise.then((tx) => {
              return client.waitForTransactionReceipt({
                hash: tx,
              });
            });

            toast.promise(createOfferResultPromise, {
              loading: 'Creating an offer...',
              success: () => {
                setIsPending(false);
                return 'Offer created!';
              },
              error: (err) => {
                setIsPending(false);
                return err.message;
              },
            });

            return 'Evaluated!';
          },
          error: (err) => {
            setIsPending(false);
            return err.message;
          },
        });
        return 'Approved!';
      },
      error: (err) => {
        setIsPending(false);
        return err.message;
      },
    });
    setOpen(false);
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button disabled={isPending || (isMounted && !isConnected)}>
          <PlusCircledIcon className="mr-2 h-4 w-4" />
          Create offer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-scroll sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a new offer</DialogTitle>
          <DialogDescription>Create a sell offer.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-6 pb-6">
              <FormField
                control={form.control}
                name="chain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chain</FormLabel>
                    <FormControl>
                      <Input placeholder="1" {...field} />
                    </FormControl>
                    <FormDescription>Provide the target chain id.</FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sourceToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source Token</FormLabel>
                    <FormControl>
                      <Input placeholder="0x0000000000000000000000000000000000000000" {...field} />
                    </FormControl>
                    <FormDescription>Provide source token address.</FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Token</FormLabel>
                    <FormControl>
                      <Input placeholder="0x0000000000000000000000000000000000000000" {...field} />
                    </FormControl>
                    <FormDescription>Provide source token address.</FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input placeholder="123" {...field} />
                    </FormControl>
                    <FormDescription>Provide source token amount.</FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="exchangeRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per source token</FormLabel>
                    <FormControl>
                      <Input placeholder="5" {...field} />
                    </FormControl>
                    <FormDescription>Provide exchange rate.</FormDescription>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="grid grid-cols-2 gap-4 ">
              <Button type="submit">Create offer</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
