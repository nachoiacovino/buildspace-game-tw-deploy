import { SmartContract } from '@thirdweb-dev/sdk';
import { useEffect, useState } from 'react';
import { transformCharacterData } from '../utils/transformCharacterData';
import { Character } from '../utils/types';
import Image from 'next/image';
import { useAddress } from '@thirdweb-dev/react';

/*
 * We pass in our characterNFT metadata so we can show a cool card in our UI
 */
export const Arena = ({
  contract,
  characterNFT,
  setCharacterNFT,
}: {
  contract: SmartContract<any> | null;
  characterNFT: any;
  setCharacterNFT: any;
}) => {
  const [boss, setBoss] = useState<Character | undefined>(undefined);
  const address = useAddress();
  console.log('characternftarena', characterNFT);

  /*
   * We are going to use this to add a bit of fancy animations during attacks
   */
  const [attackState, setAttackState] = useState('');

  const runAttackAction = async () => {
    try {
      if (contract) {
        setAttackState('attacking');
        console.log('Attacking boss...');
        const attackTxn = await contract.call('attackBoss');
        await attackTxn.wait();
        console.log('attackTxn:', attackTxn);
        setAttackState('hit');
      }
    } catch (error) {
      console.error('Error attacking boss:', error);
      setAttackState('');
    }
  };

  useEffect(() => {
    /*
     * Setup async function that will get the boss from our contract and sets in state
     */
    const fetchBoss = async () => {
      const bossTxn = await contract?.call('getBigBoss');
      console.log('Boss:', bossTxn);
      setBoss(transformCharacterData(bossTxn));
    };

    /*
     * Setup logic when this event is fired off
     */
    const onAttackComplete = (e: any) => {
      const bossHp = e.data.newBossHp.toNumber();
      const playerHp = e.data.newPlayerHp.toNumber();
      const sender = e.data.from.toString();

      console.log(`AttackComplete: Boss Hp: ${bossHp} Player Hp: ${playerHp}`);

      /*
       * If player is our own, update both player and boss Hp
       */
      if (address === sender.toLowerCase()) {
        setBoss((prevState: any) => {
          return { ...prevState, hp: bossHp };
        });
        setCharacterNFT((prevState: any) => {
          return { ...prevState, hp: playerHp };
        });
      } else {
      /*
       * If player isn't ours, update boss Hp only
       */
        setBoss((prevState: any) => {
          return { ...prevState, hp: bossHp };
        });
      }
    };

    if (contract) {
      /*
       * contract is ready to go! Let's fetch our boss
       */
      fetchBoss();
      contract.events.addEventListener('AttackComplete', onAttackComplete);
    }

    /*
     * Make sure to clean up this event when this component is removed
     */
    return () => {
      if (contract) {
        contract.events.removeEventListener('AttackComplete', onAttackComplete);
      }
    };
  }, [contract, address, setCharacterNFT]);

  return (
    <div className="arena-container">
      {/* Replace your Boss UI with this */}
      {boss && (
        <div className="boss-container">
          <div className={`boss-content ${attackState}`}>
            <h2>🔥 {boss.name} 🔥</h2>
            <div className="image-content">
              <Image
                src={boss.imageURI}
                width="300px"
                height="300px"
                alt={`Boss ${boss.name}`}
              />
              <div className="health-bar">
                <progress value={boss.hp} max={boss.maxHp} />
                <p>{`${boss.hp} / ${boss.maxHp} HP`}</p>
              </div>
            </div>
          </div>
          <div className="attack-container">
            <button className="cta-button" onClick={runAttackAction}>
              {`💥 Attack ${boss.name}`}
            </button>
          </div>
        </div>
      )}

      {characterNFT && (
        <div className="players-container">
          <div className="player-container">
            <h2>Your Character</h2>
            <div className="player">
              <div className="image-content">
                <h2>{characterNFT.name}</h2>
                <Image
                  width="300px"
                  height="300px"
                  src={characterNFT.imageURI}
                  alt={`Character ${characterNFT.name}`}
                />
                <div className="health-bar">
                  <progress value={characterNFT.hp} max={characterNFT.maxHp} />
                  <p>{`${characterNFT.hp} / ${characterNFT.maxHp} HP`}</p>
                </div>
              </div>
              <div className="stats">
                <h4>{`⚔️ Attack Damage: ${characterNFT.attackDamage}`}</h4>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
