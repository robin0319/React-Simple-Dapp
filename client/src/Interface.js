import { useState, useEffect } from 'react';
import Web3 from 'web3'

import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FormControl from 'react-bootstrap/FormControl';

import { AteronAbi } from './abis';
import { CrowdSaleAbi } from './abisCrowdSale';

const web3 = new Web3(Web3.givenProvider);

const contractAddress = '0xc1670a98ccd1c494D39fF8b055Ed10A5D8337F34';
const AteronContract = new web3.eth.Contract(AteronAbi, contractAddress);

const crowdSaleContractAddress = '0x0c5b8523780A0E4Ba180e0CAd3C3D2c782aCa6d4';
const CrowdSaleContract = new web3.eth.Contract(CrowdSaleAbi, crowdSaleContractAddress);

const weiAmount = 1000000000000000000;
const tokenAmountPerBnb = 10000;

const Interface = () => {
    const [walletAddress, setWallet] = useState("");
    const [status, setStatus] = useState("");
    const [connected, setConnected] = useState(false);
    const [maxAmount, setMaxAmount] = useState(0);
    const [inputAmout, setInputAmount] = useState(0);

    useEffect(() => {
        async function init() {
            const { address, status, conStat } = await getCurrentWalletConnected();
            setWallet(address)
            setStatus(status);
            setConnected(conStat);
            addWalletListener();

            if (connected) {
                const amount = await web3.eth.getBalance(walletAddress);
                setMaxAmount(amount / weiAmount);
            }
        }
        init();
    }, [walletAddress, connected]);

    function addWalletListener() {
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", (accounts) => {
                if (accounts.length > 0) {
                    setWallet(accounts[0]);
                    setStatus("👆🏽 Buy ATRN using BNB");
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
                        status: "👆🏽 Buy ATRN using BNB",
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
                    status: "👆🏽 Buy ATRN using BNB",
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

    const buyPressed = async () => {
        if (inputAmout > maxAmount) {
            alert("Max amount is " + maxAmount);
            return;
        }
        if (inputAmout < 0) {
            alert("Min amount is 0");
            return;
        }
        if (inputAmout.length === 0) {
            alert("Input the amount");
            return;
        }

        await CrowdSaleContract.methods.buyTokens(walletAddress).send({
            from: walletAddress,
            to: crowdSaleContractAddress,
            value: inputAmout * weiAmount
        });
    }

    const onChangeInput = (e) => {
        setInputAmount(e.target.value);
    }

    return (
        <Container style={{ marginTop: '100px' }}>
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
                <h1 id="title">🧙‍♂️ Buy Ateron Token(ATRN) in ICO</h1>
            </Row>
            <Row style={{ backgroundColor: '#c8ffd8', marginTop: '20px', paddingTop: '30px', paddingBottom: '30px' }}>
                <Col>
                    <FormControl
                        placeholder="Input BNB Amount"
                        value={inputAmout}
                        onChange={onChangeInput}
                        type='number'
                    />
                </Col>
                <Col>
                    <span>Max BNB Amount: {maxAmount} bnb</span>
                </Col>
            </Row>

            <Row style={{ backgroundColor: '#feffc8', marginTop: '20px', paddingTop: '30px', paddingBottom: '30px' }}>
                <Col>
                    <Row>
                        <Col>
                            <span>You will receive</span>
                        </Col>
                        <Col sm='10'>
                            <FormControl
                                disabled={true}
                                value={inputAmout * tokenAmountPerBnb}
                            />
                        </Col>
                    </Row>
                </Col>
                <Col>
                    <Button onClick={buyPressed} style={{ width: '70%' }} variant="success" disabled={!connected}>Buy ATRN</Button>
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