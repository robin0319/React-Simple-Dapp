import { useState, useEffect } from 'react';
import Web3 from 'web3'

import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Dropdown from 'react-bootstrap/Dropdown';
import FormControl from 'react-bootstrap/FormControl';

import { AteronAbi } from './abis';
import { CrowdSaleAbi } from './abisCrowdSale';

import CAValidator from 'cryptocurrency-address-validator';

const web3 = new Web3(Web3.givenProvider);

const contractAddress = '0xc1670a98ccd1c494D39fF8b055Ed10A5D8337F34';
const AteronContract = new web3.eth.Contract(AteronAbi, contractAddress);

const crowdSaleContractAddress = '0x0c5b8523780A0E4Ba180e0CAd3C3D2c782aCa6d4';
const CrowdSaleContract = new web3.eth.Contract(CrowdSaleAbi, crowdSaleContractAddress);

const Interface = () => {
    const [lockedList, setLockedList] = useState([
        '0x52FeA69b68C81E4F17B1E625692846f072732eDE',
        '0x9679E7e8e9011965cCf09c666209392f4b5ebDbF',
        '0x96Ed2eA12F6520bFe12C8434875A8B339F635725',
        '0xB16803663C40D98a4249A4fcC233d9a2c90f3D20',
        '0x64bc0708faD1137E09e725C6a27601262477419E',
        '0x7270Df0505699cE986613F6271f5B3d8c0E7f1Dd'
    ]);

    const [walletAddress, setWallet] = useState("");
    const [status, setStatus] = useState("");
    const [connected, setConnected] = useState(false);
    const [icoStatus, setIcoStatus] = useState();
    const [finalICO, setFinal] = useState();
    const [selectedLockedAddress, setSelectedLockedAddress] = useState('0x52FeA69b68C81E4F17B1E625692846f072732eDE');
    const [lockedStatus, setLocked] = useState();
    const [blackAddress, setBlackAddress] = useState('');
    const [distributed, setDistributed] = useState('false');

    const [pauseStatus, setPause] = useState();

    useEffect(() => {
        async function init() {
            const { address, status, conStat } = await getCurrentWalletConnected();
            setWallet(address)
            setStatus(status);
            setConnected(conStat);
            addWalletListener();

            if (connected) {
                const result = await CrowdSaleContract.methods.getStatusICO().call();
                setIcoStatus(result);

                const result1 = await AteronContract.methods.getLockedStatus(selectedLockedAddress).call();
                setLocked(result1);

                const result2 = await AteronContract.methods.getPauseStatus().call();
                setPause(result2);

                const result3 = await CrowdSaleContract.methods.getFinalizeICO().call();
                setFinal(result3);

                const result4 = await AteronContract.methods.balanceOf(walletAddress).call();
                if (result4 == 0) {
                    setDistributed(true);
                }
            }
        }
        init();
    }, [walletAddress, connected]);

    const blackAddressChanged = (e) => {
        setBlackAddress(e.target.value);
    }

    const clickLockedAddress = async (address) => {
        setSelectedLockedAddress(address);
        const result = await AteronContract.methods.getLockedStatus(address).call();
        setLocked(result);
    }

    const addToBlackListPressed = async () => {
        if (blackAddress.length == 0) {
            alert("Input address");
            return;
        }
        var valid = CAValidator.validate(blackAddress, 'ETH');
        if (!valid) {
            alert("Invalid address");
        }
        else {
            await AteronContract.methods.addBlackList(blackAddress).send({
                from: walletAddress,
                to: contractAddress
            });
        }
    }

    const onClickStartICO = async () => {
        await CrowdSaleContract.methods.setStatusICO(true).send({
            from: walletAddress,
            to: crowdSaleContractAddress
        });

        await AteronContract.methods.setSaleContractAddress(crowdSaleContractAddress).send({
            from: walletAddress,
            to: contractAddress
        });

        const result = await CrowdSaleContract.methods.getStatusICO().call();
        setIcoStatus(result);
    }

    const onClickEndICO = async () => {
        await CrowdSaleContract.methods.setStatusICO(false).send({
            from: walletAddress,
            to: crowdSaleContractAddress
        });

        const result = await CrowdSaleContract.methods.getStatusICO().call();
        setIcoStatus(result);
    }

    const distributeCrowdSale = async () => {
        let amount = '3000000000000000000000';
        await AteronContract.methods.transfer(crowdSaleContractAddress, amount).send({
            from: walletAddress,
            to: contractAddress
        });
    }

    const initialDistribution = async () => {
        // Private Sale Part
        let amount = '125000000000000000000';
        await AteronContract.methods.transfer('0x3f87Dab2Bc2C087f1789fb303ce45f7B136B7C43', amount).send({
            from: walletAddress,
            to: contractAddress
        });
        await AteronContract.methods.transfer('0xC7E3D35187D6ceA8Dfe2d683D8b6DfEc437Ae83F', amount).send({
            from: walletAddress,
            to: contractAddress
        });
        await AteronContract.methods.transfer('0x63c3aeB98702Cba017EF9baa0325F8738dD13b86', amount).send({
            from: walletAddress,
            to: contractAddress
        });
        await AteronContract.methods.transfer('0xdc73082B2c4CA6330F8d9D21d2fddC109f3c772d', amount).send({
            from: walletAddress,
            to: contractAddress
        });
        amount = '500000000000000000000';
        await AteronContract.methods.transfer('0x52FeA69b68C81E4F17B1E625692846f072732eDE', amount).send({
            from: walletAddress,
            to: contractAddress
        });

        // Futer Partner Allocation
        amount = '2200000000000000000000';
        await AteronContract.methods.transfer('0x9679E7e8e9011965cCf09c666209392f4b5ebDbF', amount).send({
            from: walletAddress,
            to: contractAddress
        });

        // Advisors
        amount = '1500000000000000000000';
        await AteronContract.methods.transfer('0x96Ed2eA12F6520bFe12C8434875A8B339F635725', amount).send({
            from: walletAddress,
            to: contractAddress
        });

        // Marketing and CEXs
        amount = '1000000000000000000000';
        await AteronContract.methods.transfer('0xE4D1627b332eEC502DFAB5897f8114c8Ed381305', amount).send({
            from: walletAddress,
            to: contractAddress
        });
        await AteronContract.methods.transfer('0xB16803663C40D98a4249A4fcC233d9a2c90f3D20', amount).send({
            from: walletAddress,
            to: contractAddress
        });

        // Play To Earn
        amount = '4000000000000000000000';
        await AteronContract.methods.transfer('0x64bc0708faD1137E09e725C6a27601262477419E', amount).send({
            from: walletAddress,
            to: contractAddress
        });

        // Team
        amount = '6000000000000000000000';
        await AteronContract.methods.transfer('0x7270Df0505699cE986613F6271f5B3d8c0E7f1Dd', amount).send({
            from: walletAddress,
            to: contractAddress
        });

        // Dex Liquidity
        amount = '300000000000000000000';
        await AteronContract.methods.transfer('0x8aa6a022CdfACe5eB2Da4639845e8fd644E7160E', amount).send({
            from: walletAddress,
            to: contractAddress
        });

        lockedList.map(async (lockedAddress) => {
            await AteronContract.methods.setLockedStatus(lockedAddress, 'true').send({
                from: walletAddress,
                to: contractAddress
            });
        });
    }

    function addWalletListener() {
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", (accounts) => {
                if (accounts.length > 0) {
                    setWallet(accounts[0]);
                    setStatus("👆🏽 Control locked addresses, Blacklist, ICO");
                    setConnected(true);
                } else {
                    setWallet("");
                    setStatus("🦊 Connect to Metamask using the top right button.");
                    setConnected(false);
                }
            });
        } else {
            setWallet("");
            setStatus(
                <p>
                    {" "}
                    🦊{" "}
                    <a target="" href={`https://metamask.io/download.html`}>
                        You must install Metamask, a virtual Ethereum wallet, in your
                        browser.
                    </a>
                </p>
            );
            setConnected(false);
        }
    }

    const getCurrentWalletConnected = async () => {
        if (window.ethereum) {
            try {
                const addressArray = await window.ethereum.request({
                    method: "eth_accounts",
                });
                if (addressArray.length > 0) {
                    return {
                        address: addressArray[0],
                        status: "👆🏽 Control locked addresses, Blacklist, ICO",
                        conStat: true,
                    };
                } else {
                    return {
                        address: "",
                        status: "🦊 Connect to Metamask using the top right button.",
                        conStat: false,
                    };
                }
            } catch (err) {
                return {
                    address: "",
                    status: "😥 " + err.message,
                    conStat: false,
                };
            }
        } else {
            return {
                address: "",
                status: (
                    <span>
                        <p>
                            {" "}
                            🦊{" "}
                            <a target="" href={`https://metamask.io/download.html`}>
                                You must install Metamask, a virtual Ethereum wallet, in your
                                browser.
                            </a>
                        </p>
                    </span>
                ),
                conStat: false,
            };
        }
    };

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const addressArray = await window.ethereum.request({
                    method: "eth_requestAccounts",
                });
                const obj = {
                    status: "👆🏽 Control locked addresses, Blacklist, ICO",
                    address: addressArray[0],
                    conStat: true,
                };
                return obj;
            } catch (err) {
                return {
                    address: "",
                    status: "😥 " + err.message,
                    conStat: false,
                };
            }
        } else {
            return {
                address: "",
                status: (
                    <span>
                        <p>
                            {" "}
                            🦊{" "}
                            <a target="" href={`https://metamask.io/download.html`}>
                                You must install Metamask, a virtual Ethereum wallet, in your
                                browser.
                            </a>
                        </p>
                    </span>
                ),
                conStat: false,
            };
        }
    };

    const connectWalletPressed = async () => {
        const walletResponse = await connectWallet();
        setStatus(walletResponse.status);
        setWallet(walletResponse.address);
        setConnected(walletResponse.conStat);
    }

    const freezePressed = async (stat) => {
        await AteronContract.methods.setLockedStatus(selectedLockedAddress, stat).send({
            from: walletAddress,
            to: contractAddress
        });
        const result = await AteronContract.methods.getLockedStatus(selectedLockedAddress).call();
        setLocked(result);
    }

    const onFinalizeICO = async () => {
        await CrowdSaleContract.methods.finalizeICO().send({
            from: walletAddress,
            to: crowdSaleContractAddress
        });

        const result = await CrowdSaleContract.methods.getFinalizeICO().call();
        setFinal(result);
    }

    const onClickPause = async () => {
        await AteronContract.methods.setPauseStatus(true).send({
            from: walletAddress,
            to: contractAddress
        });

        const result = await AteronContract.methods.getPauseStatus().call();
        setPause(result);
    }

    const onClickUnpause = async () => {
        console.log("here");
        await AteronContract.methods.setPauseStatus(false).send({
            from: walletAddress,
            to: contractAddress
        });

        const result = await AteronContract.methods.getPauseStatus().call();
        console.log(result);
        setPause(result);
    }

    return (
        <Container style={{ marginTop: '80px' }}>
            <Row style={{ marginBottom: '20px' }}>
                <Col>
                </Col>
                <Col>
                    <button id="walletButton" onClick={connectWalletPressed}>
                        {walletAddress.length > 0 ? (
                            "Connected: " +
                            String(walletAddress).substring(0, 6) +
                            "..." +
                            String(walletAddress).substring(38)
                        ) : (
                                <span>Connect Wallet</span>
                            )}
                    </button>
                </Col>
            </Row>
            <Row>
                <h1 id="title">🧙‍♂️ Ateron Contract Admin Panel</h1>
            </Row>
            <Row style={{ backgroundColor: '#bbeffd', marginTop: '20px', paddingTop: '30px', paddingBottom: '30px' }}>
                <Col>
                    <Button onClick={distributeCrowdSale} disabled={distributed}>Distribute to CrowdSale - 15% (30,000,000)</Button>
                </Col>

                <Col>
                    <Button onClick={initialDistribution} disabled={distributed}>Initial Distribution</Button>
                </Col>
            </Row>
            <Row style={{ backgroundColor: '#bbeffd', marginTop: '20px', paddingTop: '30px', paddingBottom: '30px' }}>
                <Col>
                    <Dropdown >
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                            {selectedLockedAddress}
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            {
                                lockedList.map((address, index) => (
                                    <Dropdown.Item key={index} as="button" disabled={!connected}>
                                        <div onClick={() => clickLockedAddress(address)}>
                                            {address}
                                        </div>
                                    </Dropdown.Item>
                                ))
                            }
                        </Dropdown.Menu>
                    </Dropdown>
                </Col>
                <Col>
                    {
                        connected ? (
                            lockedStatus ? (
                                <Button onClick={() => freezePressed(false)} variant="warning">Unfreeze</Button>
                            ) : (
                                    <Button onClick={() => freezePressed(true)} variant="primary">Freeze</Button>
                                )
                        ) : (
                                <span>Not connected</span>
                            )
                    }
                </Col>
            </Row>

            <Row style={{ backgroundColor: '#bbeffd', marginTop: '20px', paddingTop: '30px', paddingBottom: '30px', paddingLeft: '70px' }}>
                <Col>
                    <FormControl
                        placeholder="Input address"
                        value={blackAddress}
                        onChange={blackAddressChanged}
                        disabled={!connected}
                    />
                </Col>
                <Col>
                    <Button onClick={addToBlackListPressed} variant="danger" disabled={!connected}>Add to Blacklist</Button>
                </Col>
            </Row>

            <Row style={{ backgroundColor: '#bbeffd', marginTop: '20px', paddingTop: '30px', paddingBottom: '30px' }}>
                <Col>
                    <Button onClick={onClickPause} style={{ width: '70%' }} variant="primary" disabled={!connected || pauseStatus}>Pause Transaction</Button>
                </Col>
                <Col>
                    <Button onClick={onClickUnpause} style={{ width: '70%' }} variant="success" disabled={!connected || !pauseStatus}>Unpause Transaction</Button>
                </Col>
            </Row>

            <Row style={{ backgroundColor: '#bbeffd', marginTop: '20px', paddingTop: '30px', paddingBottom: '30px' }}>
                <Col>
                    <Button onClick={onClickStartICO} style={{ width: '70%' }} variant="primary" disabled={!connected || icoStatus || finalICO}>Start ICO</Button>
                </Col>
                <Col>
                    <Button onClick={onClickEndICO} style={{ width: '70%' }} variant="success" disabled={!connected || !icoStatus || finalICO}>End ICO</Button>
                </Col>
                <Col>
                    <Button onClick={onFinalizeICO} style={{ width: '70%' }} variant="danger" disabled={!connected || finalICO}>Finalize ICO</Button>
                </Col>
            </Row>

            <Row style={{ marginTop: '20px' }}>
                <p id="status">
                    {status}
                </p>
            </Row>
        </Container>
    )
}

export default Interface;