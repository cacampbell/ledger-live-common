import eip55 from "eip55";
import BigNumber from "bignumber.js";
import { NFT, NFTWithMetadata, Operation } from "../types";

type AnyNFT = NFT | NFTWithMetadata;
type Collection = NFT["collection"] | NFTWithMetadata["collection"];

type CollectionWithNFT = Collection & {
  nfts: Array<Omit<AnyNFT, "collection">>;
};

type CollectionWithNFTMap = Record<string, CollectionWithNFT>;

export const nftsFromOperations = (ops: Operation[]): NFT[] => {
  const nftsMap = ops
    // if ops are Operations get the prop nftOperations, else ops are considered nftOperations already
    .flatMap((op) => (op?.nftOperations ? op.nftOperations : op))
    .reduce((acc: Record<string, NFT>, nftOp: Operation) => {
      if (!nftOp?.contract) {
        return acc;
      }

      // Creating a "token for a contract" unique key
      const contract = eip55.encode(nftOp.contract!);
      const nftKey = contract + nftOp.tokenId!;
      const { tokenId, standard, id } = nftOp;

      const nft = (acc[nftKey] ?? {
        id,
        tokenId: tokenId!,
        amount: new BigNumber(0),
        collection: {
          contract,
          standard: standard!,
        },
      }) as NFT;

      if (nftOp.type === "IN") {
        nft.amount = nft.amount.plus(nftOp.value);
      } else if (nftOp.type === "OUT") {
        nft.amount = nft.amount.minus(nftOp.value);
      }

      acc[nftKey] = nft;

      return acc;
    }, {});

  return Object.values(nftsMap);
};

export function nftsByCollections(
  nfts: AnyNFT[] = [],
  collectionAddress?: string
): CollectionWithNFT[] {
  const filteredNfts = collectionAddress
    ? nfts.filter((n) => n.collection.contract === collectionAddress)
    : nfts;

  const CollectionMap = filteredNfts.reduce(
    (acc: CollectionWithNFTMap, nft: AnyNFT) => {
      const { collection, ...nftWithoutCollection } = nft;

      if (!acc[collection.contract]) {
        acc[collection.contract] = { ...collection, nfts: [] };
      }
      acc[collection.contract].nfts.push(nftWithoutCollection);

      return acc;
    },
    {} as CollectionWithNFTMap
  );

  return Object.values(CollectionMap);
}
