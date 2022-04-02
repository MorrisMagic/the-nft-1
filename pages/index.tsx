import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import { sanityClient, urlFor } from "../sanity";
import { Collection } from "../typing";

interface Props {
  collections: Collection[];
}
const Home = ({ collections }: Props) => {
  return (
    <div className="mx-auto max-w-7xl flex min-h-screen flex-col lg:py-12 lg:px-32  py-20 px-10 2xl:px-0">
      <Head>
        <title>NFT Drop</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className=" mb-10 text-4xl font-extralight ">
        The{" "}
        <span className="font-extrabold underline decoration-pink-600/50  ">
          PAPAFAM
        </span>{" "}
        NFT Market Place
      </h1>
      <main className="bg-slate-100 lg:p-10 p-10 shadow-xl shadow-rose-400/20">
        <div className="grid space-x-3 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {collections.map((collection) => (
            <Link href={`/nft/${collection.slug.current}`}>
              <div className="flex flex-col items-center cursor-pointer transition-all duration-200 hover:scale-105 ">
                <img
                  className="h-96 lg:h-[330px] lg:w-[220px] w-60 mr-[55px] rounded-2xl object-cover"
                  src={urlFor(collection.mainImage).url()}
                  alt=""
                />
                <div className="p-5">
                  <h2 className=" lg:text-xl lg:font-bold text-3xl">
                    {collection.title}
                  </h2>
                  <p className="mt-2 text-sm text-gray-400 ">
                    {collection.title}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;
export const getServerSideProps: GetServerSideProps = async () => {
  const query = `*[_type == "collection"]{
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

  const collections = await sanityClient.fetch(query);
  console.log(collections);

  return {
    props: {
      collections,
    },
  };
};
