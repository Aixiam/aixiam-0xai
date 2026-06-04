import { useAccount, useNetwork, usePublicClient } from 'wagmi';
import { getAddress } from 'ethers';
import { useQuery } from '@tanstack/react-query';

interface UseWeb3Result {
  isConnected: boolean;
  address?: `0x${string}`;
  chainId?: number;
  networkName?: string;
  publicClient: ReturnType<typeof usePublicClient>;
  resolveEnsAddress: (name: string) => Promise<string | null>;
  versoriumxEnsAddress: string | null;
  isLoadingEns: boolean;
  ensError: Error | null;
}

const VERSORIUMX_ENS_NAME = 'versoriumx.eth';

export const useWeb3 = (): UseWeb3Result => {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const publicClient = usePublicClient();

  const networkName = chain?.name;
  const chainId = chain?.id;

  const resolveEnsAddress = async (name: string): Promise<string | null> => {
    if (!publicClient || !name) return null;
    try {
      const resolvedAddress = await publicClient.getEnsAddress({ name });
      return resolvedAddress ? getAddress(resolvedAddress) : null;
    } catch (err) {
      console.error(`Error resolving ENS name ${name}:`, err);
      return null;
    }
  };

  const { data: versoriumxEnsAddress, isLoading: isLoadingEns, error: ensError } = useQuery<string | null, Error>(
    ['versoriumxEnsAddress', publicClient?.chain?.id],
    () => resolveEnsAddress(VERSORIUMX_ENS_NAME),
    {
      enabled: !!publicClient,
      staleTime: 1000 * 60 * 60,
      cacheTime: 1000 * 60 * 60 * 24,
    }
  );

  return {
    isConnected,
    address,
    chainId,
    networkName,
    publicClient,
    resolveEnsAddress,
    versoriumxEnsAddress: versoriumxEnsAddress ?? null,
    isLoadingEns,
    ensError: ensError as Error | null,
  };
};
