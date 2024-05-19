'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ListBulletIcon } from '@radix-ui/react-icons';
import { writeContract } from '@wagmi/core';
import { getChainId } from '@wagmi/core';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { getAddress, isAddress } from 'viem';
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
import { otcMarketAbi, otcMarketAddress } from '@/config/contracts';
import { config } from '@/config/wagmi';
import { useMounted } from '@/hooks/use-mounted';

const formSchema = z.object({
  chain: z.coerce.number().positive(),
  address: z.coerce
    .string()
    .trim()
    .refine((value) => isAddress(value))
    .transform((value) => getAddress(value)),
});

type FormValues = z.infer<typeof formSchema>;

export default function ListOtc() {
  const isMounted = useMounted();
  const [isPending, setIsPending] = useState(false);
  const { isConnected } = useAccount();
  const client = usePublicClient();

  const [open, setOpen] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: FormValues) {
    setIsPending(true);

    const txPromise = writeContract(config, {
      address: otcMarketAddress[getChainId(config)],
      abi: otcMarketAbi,
      functionName: 'listOtcMarket',
      args: [values.chain, values.address],
    });

    const resultPromise = txPromise.then((tx) => {
      return client.waitForTransactionReceipt({
        hash: tx,
      });
    });

    toast.promise(resultPromise, {
      loading: 'Loading...',
      success: () => {
        setIsPending(false);
        return 'OTC listed!';
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
          <ListBulletIcon className="mr-2 h-4 w-4" />
          List OTC
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>List OTC Market</DialogTitle>
          <DialogDescription>Add OTC Market to the supported white list.</DialogDescription>
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
                    <FormDescription>Provide chain id of the OTC market.</FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="0x0000000000000000000000000000000000000000" {...field} />
                    </FormControl>
                    <FormDescription>Provide address of the OTC market.</FormDescription>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="grid grid-cols-2 gap-4 ">
              <Button type="submit">List OTC</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
