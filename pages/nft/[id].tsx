import {
  useAddress,
  useDisconnect,
  useMetamask,
  useNFTDrop,
} from "@thirdweb-dev/react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import React, { useEffect } from "react";
import { sanityClient, urlFor } from "../../sanity";
import { Collection } from "../../typing";
import { useState } from "react";
import { BigNumber } from "ethers";
import toast, { Toaster } from "react-hot-toast";
interface Props {
  collection: Collection;
}

function NFTDropPage({ collection }: Props) {
  //Auth
  const [claimedSupply, setClaimedSupply] = useState<number>(0);
  const [totalSupply, setTotalSupply] = useState<BigNumber>();
  const [loading, setLoading] = useState<boolean>(true);
  const [PriceIn, setPriceIn] = useState<string>();
  const nftDrop = useNFTDrop(collection.address);

  const connectWithMetamask = useMetamask();
  const address = useAddress();
  const disconnect = useDisconnect();

  useEffect(() => {
    if (!nftDrop) return;

    const fetchPrice = async () => {
      const claimConditions = await nftDrop.claimConditions.getAll();
      setPriceIn(claimConditions?.[0].currencyMetadata.displayValue);
    };
    fetchPrice();
  });

  useEffect(() => {
    if (!nftDrop) return;
    const fetchedNFTdropData = async () => {
      const climed = await nftDrop.getAllClaimed();
      const total = await nftDrop.totalSupply();

      setClaimedSupply(climed.length);
      setTotalSupply(total);

      setLoading(false);
    };
    fetchedNFTdropData();
  }, [nftDrop]);
  const minNft = () => {
    if (!nftDrop || !address) return;

    const quantity = 1;
    setLoading(true);
    const nofi = toast.loading("Minting...", {
      style: {
        background: "white",
        color: "green",
        fontWeight: "bolder",
        fontSize: "17px",
        padding: "20px",
      },
    });
    nftDrop
      .claimTo(address, quantity)
      .then(async (tx) => {
        const recepit = tx[0].receipt;
        const claimedTokenId = tx[0].id;
        const claimedNFT = await tx[0].data();

        toast("HOORAY...YOU Successfully Minted!", {
          duration: 8000,
          style: {
            background: "green",
            color: "white",
            fontWeight: "bolder",
            fontSize: "17px",
            padding: "20px",
          },
        });
      })
      .catch((err) => {
        console.log(err);
        toast("Whoops...Something went wrong!", {
          style: {
            background: "red",
            color: "green",
            fontWeight: "bolder",
            fontSize: "17px",
            padding: "20px",
          },
        });
      })
      .finally(() => {
        setLoading(false);
        toast.dismiss(nofi);
      });
  };

  return (
    <div className="flex h-screen flex-col lg:grid lg:grid-cols-10 ">
      <Toaster position="bottom-center" />
      <Head>
        <title>{collection.title}</title>
      </Head>
      <div className=" lg:col-span-4 bg-gradient-to-br from-cyan-800 to-rose-500">
        <div className="flex flex-col items-center justify-center py-2 lg:min-h-screen">
          <div className="bg-gradient-to-br from-yellow-400 to-purple-600 p-2 rounded-xl">
            <img
              className="w-44 rounded-xl object-cover lg:h-96 lg:w-72  "
              src={urlFor(collection.previewImage).url()}
              alt=""
            />
          </div>
          <div className="text-center p-5 space-y-2">
            <h1 className="text-4xl font-bold text-white">PAPAFAM</h1>
            <h2 className="text-xl text-gray-300">
              A collection of youuouo Apes who live & breathe React!
            </h2>
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-12 lg:col-span-6">
        <header className="flex items-center justify-between">
          <Link href={"/"}>
            <h1 className="w-52 cursor-pointer text-xl font-extralight sm:w-80 ">
              The{" "}
              <span className="font-extrabold underline decoration-pink-600/50">
                PAPAFAM
              </span>{" "}
              NFT Market Place
            </h1>
          </Link>
          <button
            onClick={() => (address ? disconnect() : connectWithMetamask())}
            className="rounded-full bg-rose-400 text-white px-4 py-2 text-xs font-bold lg:px-5 lg:py-3 lg:text-base"
          >
            {address ? "Sign Out" : "Sign In"}
          </button>
        </header>
        <hr className="my-2 border" />
        {address && (
          <p className="text-center text-sm text-rose-400">
            You're logged in with wallet {address.substring(0, 5)}...
            {address.substring(address.length - 5)}
          </p>
        )}

        <div className="mt-10 flex flex-1 flex-col items-center space-y-6 text-center lg:space-y-0 lg:justify-center">
          <img
            className="w-80  object-cover lg:relative lg:top-[-50px] lg:h-40"
            src={urlFor(collection.mainImage).url()}
            alt=""
          />
          <h1 className="text-3xl font-bold lg:relative lg:top-[-20px] lg:text-5xl lg:font-extrabold">
            {collection.title}
          </h1>
          {loading ? (
            <p className="pt-1 text-xl animate-pulse  text-green-500">
              Loading Supply Count...
            </p>
          ) : (
            <p className="pt-1 lg:relative lg:top-[30px] text-xl text-green-500">
              {claimedSupply} /{totalSupply?.toString()} NFT's claimed
            </p>
          )}
          {loading && (
            <img
              className="h-[150px]  p-0 w-[200px] object-contain"
              src="https://cdn.hackernoon.com/images/0*4Gzjgh9Y7Gu8KEtZ.gif"
              alt=""
            />
          )}
        </div>
        <button
          onClick={minNft}
          disabled={
            loading || claimedSupply === totalSupply?.toNumber() || !address
          }
          className="h-[47px] w-full bg-red-600 text-white disabled:bg-gray-400 rounded-full mt-10 font-bold"
        >
          {loading ? (
            <>Loading</>
          ) : claimedSupply === totalSupply?.toNumber() ? (
            <>SOLD OUT</>
          ) : !address ? (
            <>Sign in to Mint</>
          ) : (
            <span className="font-bold"> Mint NFT {PriceIn} ETH</span>
          )}
        </button>
      </div>
    </div>
  );
}

export default NFTDropPage;

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const query = `*[_type == "collection" && slug.current == $id][0]{
     _id,
     title,
     address,
     description,
     nftCollectionName,
     mainImage {
         asset
     },
     previewImage {
         asset
     },
     slug {
        current
     },
     creator-> {
         _id,
         name,
         address,
         slug {
             current
         },
     },
  }`;
  const collection = await sanityClient.fetch(query, {
    id: params?.id,
  });
  if (!collection) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      collection,
    },
  };
};
