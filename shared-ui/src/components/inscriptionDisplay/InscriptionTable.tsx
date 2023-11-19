import {
  Center,
  HStack,
  Heading,
  Image,
  Link,
  SimpleGrid,
  Skeleton,
  Text,
  VStack,
} from "@chakra-ui/react";
import { PublicKey } from "@solana/web3.js";
import { useMemo } from "react";

import { useWallet } from "@solana/wallet-adapter-react";
import React from "react";
import {
  SolscanLink,
  getInscriptionV3Pda,
  useInscriptionDataForRoot,
  useInscriptionForRoot,
  useOffChainMetadataCache,
} from "../..";
import { TensorButton } from "../../components/migration/TensorButton";
import { InscriptionImage } from "./InscriptionImage";
import { InscriptionV1V2 } from "./InscriptionV1V2";
import { MutabilityDisplay } from "./MutabilityDisplay";
import { useUrlPrefixForInscription } from "./useUrlPrefixForInscription";
import { useMediaPrefix } from "./useMediaPrefix";

export const InscriptionTable = ({ mint }: { mint: PublicKey }) => {
  const {
    inscription: {
      data: inscription,
      isFetching: isFetchingInscription,
      refetch: refreshInscription,
    },
  } = useInscriptionForRoot(mint);
  const {
    data: inscriptionData,
    isFetching: isFetchingInscriptionData,
    refetch: refreshInscriptionData,
  } = useInscriptionDataForRoot(mint);

  const inscriptionV3Pda = useMemo(() => getInscriptionV3Pda(mint)[0], [mint]);

  const { data: offchainData } = useOffChainMetadataCache(mint);

  const urlPrefix = useUrlPrefixForInscription(inscription);
  const base64ImageInscription = useMemo(
    () =>
      urlPrefix === "application/text" || urlPrefix === "text/plain"
        ? Buffer.from(inscriptionData?.item?.buffer ?? []).toString("ascii")
        : Buffer.from(inscriptionData?.item?.buffer ?? []).toString("base64"),
    [inscriptionData?.item?.buffer, urlPrefix]
  );

  const {mediaType} = useMediaPrefix(mint);

  const { publicKey } = useWallet();
  return (
    <VStack columnGap={2}>
      <Heading size="lg">
        Order #{Number(inscription?.item.order ?? 0).toLocaleString()}
      </Heading>
      <HStack>
        <Heading size="md">Trading</Heading>
        <TensorButton mint={inscription?.item.root} />
      </HStack>

      <MutabilityDisplay inscription={inscription} />
      <SimpleGrid columns={2} spacing={10} className="min-h-300 h-300">
        <Center>
          <Heading size="md">Off-chain Image</Heading>
        </Center>
        <Center>
          <Heading size="md">FOC Inscription</Heading>
        </Center>
        <VStack>
          {offchainData?.images.square ? (
            <Image
              className="aspect-square rounded-md"
              style={{ minHeight: "200px" }}
              src={offchainData?.images.square}
              fallback={
                <Skeleton isLoaded={true}>
                  <img
                    src="https://img.freepik.com/premium-vector/gallery-simple-icon-vector-image-picture-sign-neumorphism-style-mobile-app-web-ui-vector-eps-10_532800-801.jpg"
                    style={{
                      height: "300px",
                      maxHeight: "300px",
                      width: "100%",
                      borderRadius: "20px",
                    }}
                  />
                </Skeleton>
              }
            />
          ) : (
            <Skeleton
              startColor="#aaa"
              endColor="#aaa"
              style={{
                minHeight: "300px",
                maxHeight: "300px",
                aspectRatio: "1/1",
                borderRadius: 8,
              }}
            />
          )}
        </VStack>
        <VStack>
          {base64ImageInscription ? (
            urlPrefix === "application/text" || urlPrefix === "text/plain" ? (
              <Center
                sx={{ height: "100%", minHeight: "300px", maxHeight: "300px" }}
              >
                <Text color="white">{base64ImageInscription}</Text>
              </Center>
            ) : (
              <InscriptionImage root={mint} />
            )
          ) : (
            <>
              <Skeleton
                startColor="#aaa"
                endColor="#aaa"
                style={{
                  minHeight: "100%",
                  aspectRatio: "1/1",
                  borderRadius: 8,
                }}
              />
            </>
          )}
        </VStack>
        <VStack>
          <Link target="_blank" href={offchainData?.images.url}>
            View Original
          </Link>
        </VStack>

        <VStack>
          <Text mt={3}>{(mediaType)?.slice(0, 15)}</Text>

          <HStack>
            <Text>View inscription account</Text>
            {inscriptionV3Pda && (
              <SolscanLink address={inscriptionV3Pda.toBase58()} />
            )}
          </HStack>
          <HStack>
            <Text>View data account</Text>
            {inscriptionData && (
              <SolscanLink address={inscriptionData.pubkey?.toBase58()} />
            )}
          </HStack>
        </VStack>
      </SimpleGrid>
      {publicKey?.toBase58()?.startsWith("5LufDW6Mtb") && (
        <InscriptionV1V2 mint={mint} />
      )}
    </VStack>
  );
};
