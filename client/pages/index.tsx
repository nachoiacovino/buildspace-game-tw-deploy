/* eslint-disable @next/next/no-img-element */
import {
  useAddress,
  useContract,
  useMetamask,
} from '@thirdweb-dev/react';
import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { Arena } from '../components/Arena';
import LoadingIndicator from '../components/LoadingIndicator';
import { SelectCharacter } from '../components/SelectCharacter';
import { transformCharacterData } from '../utils/transformCharacterData';
import { Character } from '../utils/types';

const Home: NextPage = () => {
  const address = useAddress();
  const [characterNFT, setCharacterNFT] = useState<Character | undefined>();
  const connectWithMetamask = useMetamask();
  const [isLoading, setIsLoading] = useState(false);
  

  const { contract } = useContract(
    '0x31347567Ff1DEC757F8aD1E898d8179d081eaA48',
    );

  /*
   * Add this useEffect right under the other useEffect where you are calling checkIfWalletIsConnected
   */
  useEffect(() => {
    /*
     * The function we will call that interacts with out smart contract
     */
    const fetchNFTMetadata = async () => {
      setIsLoading(true)
      console.log('Checking for Character NFT on address:', address);

      const txn = await contract?.call('checkIfUserHasNFT');
      console.log({ txn, transformCharacterData: transformCharacterData(txn) });
      if (txn?.name) {
        console.log('User has character NFT');
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log('No character NFT found');
      }
      setIsLoading(false)
    };

    /*
     * We only want to run this, if we have a connected wallet
     */
    if (address) {
      fetchNFTMetadata();
    }
  }, [address, contract]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ Metaverse Slayer ⚔️</p>
          <p className="sub-text">Team up to protect the Metaverse!</p>
          <div className="connect-wallet-container">
            <img
              src="https://64.media.tumblr.com/tumblr_mbia5vdmRd1r1mkubo1_500.gifv"
              alt="Monty Python Gif"
            />
            {/*
             * Button that we will use to trigger wallet connect
             * Don't forget to add the onClick event to call your method!
             */}
            {address ? (
              characterNFT?.name ? (
                <Arena
                  characterNFT={characterNFT}
                  setCharacterNFT={setCharacterNFT}
                  contract={contract}
                />
              ) : (
                <SelectCharacter
                  setCharacterNFT={setCharacterNFT}
                  contract={contract}
                />
              )
            ) : (
              <button
                className="cta-button connect-wallet-button"
                onClick={connectWithMetamask}
              >
                Connect Wallet To Get Started
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
