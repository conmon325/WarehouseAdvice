import { useState, useEffect } from 'react'
import { Row, Col, Spinner } from 'react-bootstrap'
import Countdown from 'react-countdown'
import Web3 from 'web3'

// Import Images + CSS
import twitter from '../images/socials/twitter.svg'
import instagram from '../images/socials/instagram.svg'
import opensea from '../images/socials/opensea.svg'
import showcase from '../images/showcase.png'
import '../App.css'
import logo from '../images/logo.png'

// Import Components
import Navbar from './Navbar'

// Import ABI + Config
import OpenPunks from '../abis/OpenPunks.json'
import config from '../config.json'



function App() {
	const [web3, setWeb3] = useState(null)
	const [openPunks, setOpenPunks] = useState(null)

	const [supplyAvailable, setSupplyAvailable] = useState(0)

	const [account, setAccount] = useState(null)
	const [networkId, setNetworkId] = useState(null)
	const [ownerOf, setOwnerOf] = useState([])

	const [explorerURL, setExplorerURL] = useState('https://etherscan.io')
	const [openseaURL, setOpenseaURL] = useState('https://opensea.io')

	const [isMinting, setIsMinting] = useState(false)
	const [isError, setIsError] = useState(false)
	const [message, setMessage] = useState(null)

	const [currentTime, setCurrentTime] = useState(new Date().getTime())
	const [revealTime, setRevealTime] = useState(0)

	const [counter, setCounter] = useState(7)
	const [isCycling, setIsCycling] = useState(false)

	const loadBlockchainData = async (_web3, _account, _networkId) => {
		// Fetch Contract, Data, etc.
		try {
			const openPunks = new _web3.eth.Contract(OpenPunks.abi, OpenPunks.networks[_networkId].address)
			setOpenPunks(openPunks)

			const maxSupply = await openPunks.methods.maxSupply().call()
			const totalSupply = await openPunks.methods.totalSupply().call()
			setSupplyAvailable(maxSupply - totalSupply)

			const allowMintingAfter = await openPunks.methods.allowMintingAfter().call()
			const timeDeployed = await openPunks.methods.timeDeployed().call()
			setRevealTime((Number(timeDeployed) + Number(allowMintingAfter)).toString() + '000')

			if (_account) {
				const ownerOf = await openPunks.methods.walletOfOwner(_account).call()
				setOwnerOf(ownerOf)
			} else {
				setOwnerOf([])
			}

		} catch (error) {
			setIsError(true)
			setMessage(" ")
		}
	}

	const loadWeb3 = async () => {
		if (typeof window.ethereum !== 'undefined') {
			const web3 = new Web3(window.ethereum)
			setWeb3(web3)

			const accounts = await web3.eth.getAccounts()

			if (accounts.length > 0) {
				setAccount(accounts[0])
			} else {
				setMessage('Please connect with MetaMask')
			}

			const networkId = await web3.eth.net.getId()
			setNetworkId(networkId)

			if (networkId !== 5777) {
				setExplorerURL(config.NETWORKS[networkId].explorerURL)
				setOpenseaURL(config.NETWORKS[networkId].openseaURL)
			}

			await loadBlockchainData(web3, accounts[0], networkId)

			window.ethereum.on('accountsChanged', function (accounts) {
				setAccount(accounts[0])
				setMessage(null)
			})

			window.ethereum.on('chainChanged', (chainId) => {
				// Handle the new chain.
				// Correctly handling chain changes can be complicated.
				// We recommend reloading the page unless you have good reason not to.
				window.location.reload();
			})
		}
	}

	// MetaMask Login/Connect
	const web3Handler = async () => {
		if (web3) {
			const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
			setAccount(accounts[0])
		}
	}

	const mintNFTHandler = async () => {
		if (revealTime > new Date().getTime()) {
			window.alert('Minting is not live yet!')
			return
		}

		if (ownerOf.length > 0) {
			window.alert('You\'ve already minted!')
			return
		}

		// Mint NFT
		if (openPunks && account) {
			setIsMinting(true)
			setIsError(false)

			await openPunks.methods.mint(1).send({ from: account, value: 0 })
				.on('confirmation', async () => {
					const maxSupply = await openPunks.methods.maxSupply().call()
					const totalSupply = await openPunks.methods.totalSupply().call()
					setSupplyAvailable(maxSupply - totalSupply)

					const ownerOf = await openPunks.methods.walletOfOwner(account).call()
					setOwnerOf(ownerOf)
				})
				.on('error', (error) => {
					window.alert(error)
					setIsError(true)
				})
		}

		setIsMinting(false)
	}

	const cycleImages = async () => {
		const getRandomNumber = () => {
			const counter = (Math.floor(Math.random() * 1000)) + 1
			setCounter(counter)
		}

		if (!isCycling) { setInterval(getRandomNumber, 3000) }
		setIsCycling(true)
	}

	useEffect(() => {
		loadWeb3()
		cycleImages()
	}, [account]);

	return (
		<div>
			<Navbar web3Handler={web3Handler} account={account} explorerURL={explorerURL} />
			<main>
				<section id='welcome' className='welcome'>

					<Row className='header my-3 p-3 mb-0 pb-0'>
					
						<h1>Available NJ Warehouses</h1>
						
					</Row>



					<Row className='flex m-2'>
						<h2 className='text-center p-0'>Interactive Map</h2>
						<Col md={5} lg={4} xl={5} xxl={4} className='text-center'>
							<iframe src="//conmon.maps.arcgis.com/apps/mapviewer/index.html?webmap=36a5253571284fd9a94a089a4191dbc2" height="800" width="1200"></iframe>
						</Col>
						<Col md={5} lg={4} xl={5} xxl={4}>
							{isError ? (
								<p>{message}</p>
							) : (
								<div>
									
								</div>
							)}
						</Col>
					</Row>

					<Row className='flex m-2'>
						<h2 className='text-center p-0'>Market Insight</h2>
						<h2 className='text-center p-0'>Video Library</h2>
						<Col md={5} lg={4} xl={5} xxl={4} className='text-center'>
							<iframe src="https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7189622504812892160" height="800" width="300" frameborder="0" allowfullscreen="" title="Embedded post"></iframe>						</Col>
						<Col md={5} lg={4} xl={5} xxl={4}>

						<Col md={5} lg={4} xl={5} xxl={4} className='text-center'>
						<iframe src="https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7239609511181758464" height="800" width="300" frameborder="0" allowfullscreen="" title="Embedded post"></iframe>						</Col>
						<Col md={5} lg={4} xl={5} xxl={4}></Col>

					
						
							{isError ? (
								<p>{message}</p>
							) : (
								<div>
									
								</div>
							)}
						</Col>
					</Row>


					<Row className='flex m-2'>
						
						<Col md={5} lg={4} xl={5} xxl={4} className='text-center'>
						<iframe src="https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7225113647813988352" height="573" width="504" frameborder="0" allowfullscreen="" title="Embedded post"></iframe>						</Col>
						<Col md={5} lg={4} xl={5} xxl={4}>

						<Col md={5} lg={4} xl={5} xxl={4} className='text-center'>
						<iframe src="https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7207009714264510464" height="625" width="504" frameborder="0" allowfullscreen="" title="Embedded post"></iframe>						</Col>
						<Col md={5} lg={4} xl={5} xxl={4}></Col>

					
						
							{isError ? (
								<p>{message}</p>
							) : (
								<div>
									
								</div>
							)}
						</Col>
					</Row>


				</section>
				<section id='about' className='about'>

					<Row className='flex m-2'>
						<h2 className='text-center p-3'>Contact Us</h2>
						<h2 className='text-center p-3'>For More Information</h2>
						
						<Col md={5} lg={4} xl={5} xxl={4} className='text-center p-3'>
						<iframe src="https://docs.google.com/forms/d/e/1FAIpQLSfmXwMBoiZP_jE5EoxtLJGV3mrZN3YEmgCJYg-8CaGcPD-8Lg/viewform?embedded=true" width="1200" height="1200" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>
						</Col>
						<Col md={5} lg={4} xl={5} xxl={4}>
							{isError ? (
								<p>{message}</p>
							) : (
								<div>
									
								</div>
							)}
						</Col>
					</Row>

					

				</section>
			</main>
			<footer>

			</footer>
		</div>
	)
}

export default App
