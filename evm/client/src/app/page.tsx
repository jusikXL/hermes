import CreateOffer from '@/components/contract-interactions/create-offer';
import ListOtc from '@/components/contract-interactions/list-otc';
import Mint from '@/components/contract-interactions/mint';

export default function Home() {
  return (
    <div className="flex items-center space-x-4">
      <ListOtc />
      <Mint />
      <CreateOffer />
    </div>
  );
}
