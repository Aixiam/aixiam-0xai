import { PublicClient } from 'wagmi';
import { getAddress } from 'ethers';

export const resolveEnsAddressUtil = async (publicClient: PublicClient, name: string): Promise<string | null> => {
  if (!publicClient || !name) return null;
  try {
    const resolvedAddress = await publicClient.getEnsAddress({ name });
    return resolvedAddress ? getAddress(resolvedAddress) : null;
  } catch (err) {
    console.error(`Error resolving ENS name ${name}:`, err);
    return null;
  }
};

export const compileVyperCode = async (code: string): Promise<{ abi: unknown[]; bytecode: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
        console.log(code); resolve({
          abi: [],
          bytecode: "0x"
        });
    }, 1000);
  });
};
