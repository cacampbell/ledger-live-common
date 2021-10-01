import memoize from "lodash/memoize";
import { useEffect, useState } from "react";
import { nftsFromOperations } from "./nftHelpers";
import { apiForCurrency, NFTMetadataOutput } from "../api/Ethereum";
import { CryptoCurrency, Operation, NFT, NFTWithMetadata } from "../types";

export const overloadNfts = async (
  nftsOrOps: NFT[] | Operation[],
  currency: CryptoCurrency
): Promise<NFTWithMetadata[]> => {
  const api = apiForCurrency(currency);

  // if entry has a standard at its root it's an NFT Operation, not an NFT
  const nfts = ["ERC721", "ERC1155"].includes(
    (nftsOrOps[0] as Operation)?.standard || ""
  )
    ? ((nftsOrOps ?? []) as NFT[])
    : nftsFromOperations(nftsOrOps as Operation[]);

  const NFTMetadata: NFTMetadataOutput = await api.getNFTMetadata(
    nfts.map(({ collection: { contract }, tokenId }) => ({
      contract,
      tokenId,
    }))
  );

  return (nfts || []).map((nft: NFT) => {
    const md =
      NFTMetadata?.[nft.collection.contract?.toLowerCase()]?.[nft.tokenId] ??
      {};

    return {
      id: nft.id,
      tokenId: nft.tokenId,
      amount: nft.amount,
      nftName: md.nftName,
      picture: md.picture,
      description: md.description,
      properties: md.properties,
      collection: {
        contract: nft.collection.contract,
        standard: nft.collection.standard,
        tokenName: md.tokenName,
      },
    } as NFTWithMetadata;
  });
};

const memoOverloadNfts = memoize(overloadNfts);

export const useNfts = (
  nftsOrOps: NFT[] | Operation[],
  currency: CryptoCurrency
): NFTWithMetadata[] => {
  const [overloadedNfts, setOverloadedNfts] = useState<NFTWithMetadata[]>([]);

  useEffect(() => {
    memoOverloadNfts(nftsOrOps, currency).then(setOverloadedNfts);
  }, [nftsOrOps, currency]);

  return overloadedNfts;
};
