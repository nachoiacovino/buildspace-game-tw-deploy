import { useEffect, useState } from 'react';
import { transformCharacterData } from '../utils/transformCharacterData';
import Image from "next/image"
import { SmartContract } from '@thirdweb-dev/sdk';
import { Character } from '../utils/types';



export const SelectCharacter = ({
  contract,
  setCharacterNFT,
}: {
  contract: SmartContract<any> | null;
  setCharacterNFT: any;
}) => {

  const [characters, setCharacters] = useState<Character[] | undefined>(
    undefined,
  );

  useEffect(() => {
    const getCharacters = async () => {
      try {
        console.log('Getting contract characters to mint');
  
        const charactersTxn = await contract?.call("getAllDefaultCharacters");
        console.log('charactersTxn:', charactersTxn);
  
        const characters = charactersTxn.map((characterData: any) =>
          transformCharacterData(characterData)
        );
  
        setCharacters(characters);
      } catch (error) {
        console.error('Something went wrong fetching characters:', error);
      }
    };
  
    /*
     * Add a callback method that will fire when this event is received
     */
    const onCharacterMint = async (e: any) => {
/*       console.log(
        `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
      ); */

      console.log("Character minted", e.data)
  
      /*
       * Once our character NFT is minted we can fetch the metadata from our contract
       * and set it in state to move onto the Arena
       */
      if (contract) {
        const characterNFT = await contract?.call("checkIfUserHasNFT")
        console.log('CharacterNFT: ', characterNFT);
        setCharacterNFT(transformCharacterData(characterNFT));
      }
    };
  
    if (contract) {
      getCharacters();
  
      /*
       * Setup NFT Minted Listener
       */
      contract.events.addEventListener("CharacterNFTMinted", onCharacterMint);
    }
  
    return () => {
      /*
       * When your component unmounts, let;s make sure to clean up this listener
       */
      if (contract) {
        contract.events.removeEventListener("CharacterNFTMinted", onCharacterMint);
      }
    };
  }, [contract, setCharacterNFT]);

  const mintCharacterNFTAction = async (characterId: number) => {
    try {
      if (contract) {
        console.log('Minting character in progress...');
        const mintTxn = await contract.call("mintCharacterNFT", characterId);
        await mintTxn.wait();
        console.log('mintTxn:', mintTxn);
      }
    } catch (error) {
      console.warn('MintCharacterAction Error:', error);
    }
  };

  return (
    <div className="select-character-container">
      <h2>Mint Your Hero. Choose wisely.</h2>
      <div className="character-grid">
      {(characters || []).map((character, index) => (
        <div className="character-item" key={character.name}>
          <div className="name-container">
            <p>{character.name}</p>
          </div>
          <Image src={character.imageURI} alt={character.name} width="300px" height="300px" />
          <button
            type="button"
            className="character-mint-button"
            onClick={() => mintCharacterNFTAction(index)}
          >{`Mint ${character.name}`}</button>
        </div>
      ))}
      </div>
    </div>
  );
};
