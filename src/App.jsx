import { useWeb3 } from "@3rdweb/hooks";
import { ThirdwebSDK } from "@3rdweb/sdk";
import { ethers } from 'ethers';
import { useEffect, useMemo, useState } from "react";

const sdk = new ThirdwebSDK('rinkeby');

const bundleDropModule = sdk.getBundleDropModule('0xe6Ae5626bb5975b16464A4F02F882E66FE867524')
const tokenModule = sdk.getTokenModule("0x56A879969946c119097B0879Ad16da0264fe1017");

const App = () => {
  const { connectWallet, address, provider } = useWeb3();
  const [hasCorrectPassword, setHasCorrectPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const signer = provider ? provider.getSigner() : undefined;

  const [memberTokenAmounts, setMemberTokenAmounts] = useState({});
  const [memberAddresses, setMemberAddresses] = useState([]);

  const shortenAddress = (str) => {
    return str.substring(0, 6) + "..." + str.substring(str.length - 4);
  };

  // This useEffect grabs all our the addresses of our members holding our NFT.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
    
    bundleDropModule
      .getAllClaimerAddresses("0")
      .then((addresess) => {
        console.log("🚀 Members addresses", addresess)
        setMemberAddresses(addresess);
      })
      .catch((err) => {
        console.error("failed to get member list", err);
      });
  }, [hasClaimedNFT]);

  // This useEffect grabs the # of token each member holds.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // Grab all the balances.
    tokenModule
      .getAllHolderBalances()
      .then((amounts) => {
        console.log("👜 Amounts", amounts)
        setMemberTokenAmounts(amounts);
      })
      .catch((err) => {
        console.error("failed to get token amounts", err);
      });
  }, [hasClaimedNFT]);

  // Now, we combine the memberAddresses and memberTokenAmounts into a single array
  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      return {
        address,
        tokenAmount: ethers.utils.formatUnits(
          // If the address isn't in memberTokenAmounts, it means they don't
          // hold any of our token.
          memberTokenAmounts[address] || 0,
          18,
        ),
      };
    });
  }, [memberAddresses, memberTokenAmounts]);

  const checkPassword = (ev) => {
    ev.preventDefault();
    if (ev.target.password.value === "papapa33") setHasCorrectPassword(true)
  }

  const mintNft = () => {
    setIsClaiming(true);
    // Call bundleDropModule.claim("0", 1) to mint nft to user's wallet.
    bundleDropModule
    .claim("0", 1)
    .then(() => {
      setHasClaimedNFT(true);
      setIsClaiming(false);
    })
    .catch((err) => {
      console.error("failed to claim", err);
      setIsClaiming(false);
    })
    .finally(() => {
      // Stop loading state.
      setIsClaiming(false);
      // Set claim state.
      setHasClaimedNFT(true);
      // Show user their fancy new NFT!
      console.log(
        `🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address}/0`
      );
    });
  }

  const loadAndConnectWallet = () => {
    setLoading(true)
    connectWallet("injected")
  }

  useEffect(() => {
    // We pass the signer to the sdk, which enables us to interact with
    // our deployed contract!
    sdk.setProviderOrSigner(signer);
  }, [signer]);

  useEffect(() => {
    if (!address) return setLoading(false)

    bundleDropModule
      .balanceOf(address, '0')
      .then(balance => {
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
          console.log(":start: Claimed NFT: ", balance.gt(0));
        } else {
          setHasClaimedNFT(false);
          console.log("This user has not claimed NFT yet.");
        }
      })
      .catch(err => {
        setHasClaimedNFT(false)
        console.log('Error: ', err);
      })
      .finally(() => setLoading(false))
  }, [address])
  
  if (!hasCorrectPassword) {
    return (
      <section style={{ display: 'flex', justifyContent: 'center' }}>
        <form style={{ fontSize: '2em', width: 600, display: 'flex', justifyContent: 'space-around' }} onSubmit={checkPassword}>
          <input 
            autoFocus
            name='password' 
            placeholder='papapassword' 
            style={{ boxShadow: '0 0 10px #5100a2', fontSize: '.85em', background: 'white', border: "none", borderRadius: "5px", padding: ".5em 1em", color: "black"}} 
            type="text" 
          />
          <input 
            style={{ fontSize: '.85em', background: '#5100a2', color: 'white', border: 'none', borderRadius: '5px', padding: '.5em 1em', fontWeight: '600'}}
            type="submit"
          />
        </form>
      </section>
    )
  }

  if (loading) {
    return (
      <div className="landing">
        <h2>Loading...</h2>
      </div>
    )
  }

  if (!address) {
    return (
      <div className="landing">
        <h1>Welcome to ArtesansDAO</h1>
        <button onClick={loadAndConnectWallet} className='btn-hero'>
          Connect your wallet
        </button>
      </div>
    );
  }
  
  if (!hasClaimedNFT) {
    return (
      <div className="landing">
        <h1>Mint your free $Artesanito</h1>
        <button disabled={isClaiming} onClick={() => mintNft()}>
          {isClaiming ? 'Claiming...' : "Mint your NFT"}
        </button>
      </div>
    )
  }

  return (
    <div className="landing">
      <section style={{ marginBottom: '3em'}}>
        <div style={{display: 'flex', justifyContent: 'center', marginBottom: '2em'}}>
          <img alt='NFT' width='200' src='https://ipfs.thirdweb.com/ipfs/bafybeicndai3x6edxpecd727eaa5yulg5krl2dyjjsufd3zw7aozh754tm' />
        </div>
        <div>
          <h2>Welcome back Artesanito, check out your NFT on &nbsp;
            <a style={{ color: 'white' }} target='_blank' rel='noreferrer' href={`https://testnets.opensea.io/assets/${bundleDropModule.address}/0`}>
              OpenSea
            </a>.
          </h2>
        </div>
      </section>
      <section>
        <div className="member-page">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div>
              <h2 style={{textAlign: 'center'}}>Members:</h2>
              <table className="card">
                <thead>
                  <tr>
                    <th>Address</th>
                    <th>Token Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {memberList.map((member) => {
                    return (
                      <tr key={member.address}>
                        <td>{shortenAddress(member.address)}</td>
                        <td>{member.tokenAmount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>  
    </div>
  )
};

export default App;
