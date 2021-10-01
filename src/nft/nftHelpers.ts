import { NFT, NFTWithMetadata } from "../types";

type AnyNFT = NFT | NFTWithMetadata;
type Collection = NFT["collection"] | NFTWithMetadata["collection"];

type CollectionWithNFT = Collection & {
  nfts: Array<Omit<AnyNFT, "collection">>;
};

type CollectionWithNFTMap = Record<string, CollectionWithNFT>;

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
