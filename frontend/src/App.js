import {useEffect, useRef, useState} from "react";
import {useEthers} from "@usedapp/core";
import {providers} from "ethers";
import {getDeployedContract} from "./contractUtils"
import {create} from 'ipfs-http-client'

const ipfs = create({host: 'ipfs.infura.io', port: 5001, protocol: 'https'})

function App() {
    const [contract, setContract] = useState(null)
    const [ipfsHash, setIpfsHash] = useState("")
    const [file, setFile] = useState(null)
    const fileRef = useRef()
    const [uploading, setUploading] = useState(false)

    const {account, activateBrowserWallet, deactivate, chainId} = useEthers()

    const isConnected = account !== undefined

    useEffect(() => {
        const provider = new providers.Web3Provider(window.ethereum, "any")
        provider.on("network", (newNetwork, oldNetwork) => {
            // When a Provider makes its initial connection, it emits a "network"
            // event with a null oldNetwork along with the newNetwork. So, if the
            // oldNetwork exists, it represents a changing network
            if (oldNetwork) {
                window.location.reload()
            }
        })
    }, [])

    useEffect(() => {
        const run = async () => {
            if (!account)
                return
            const contract = await getDeployedContract()
            if (!contract) {
                console.log('Not connected to Goerli Test Network')
                return
            }
            setContract(contract)
            const ipfsHash = await contract.ipfsHash(account)
            setIpfsHash(ipfsHash)
        }
        run()
    }, [account, chainId])

    const onFileChange = (e) => {
        setFile(e.target.files[0])
    }

    const onSubmit = (e) => {
        e.preventDefault()
        const run = async () => {
            setUploading(true)
            try {
                const result = await ipfs.add(file)
                setIpfsHash("")
                const tx = await contract.setIpfsHash(result.path)
                await tx.wait(1)
                setIpfsHash(result.path)
            } catch (e) {
                console.log(e)
            }
            setUploading(false)
            fileRef.current.value = ""
            setFile(null)
        }
        if (file)
            run()
    }

    return (
        <div className="container">
            <div>
                {
                    isConnected ?
                        <button className="btn btn-secondary"
                                style={{position: "absolute", right: 30}}
                                onClick={deactivate}
                        >
                            Disconnect
                        </button>
                        : ""
                }
                <h1 className="text-center mt-4">IPFS Image Uploader</h1>
                <hr/>
                <br/>
                {
                    isConnected
                        ? <div>
                            <h4>Your Image</h4>
                            <p>This image is stored on IPFS & The Ethereum Blockchain!</p>
                            {
                                ipfsHash ?
                                    <img src={`https://ipfs.infura.io/ipfs/${ipfsHash}`} alt=""
                                         style={{maxHeight: "300px"}}
                                    /> : ""

                            }
                            <br/><br/>
                            <h4>Upload Image</h4>
                            <input type="file" accept="image/png, image/jpeg" className="form-control"
                                   style={{width: "70%"}} ref={fileRef}
                                   onChange={onFileChange}/>
                            <button className="btn btn-primary mt-2" onClick={onSubmit} disabled={uploading}>
                                {uploading ? "Submitting" : "Submit"}
                            </button>
                        </div>
                        : <div style={{textAlign: "center"}}>
                            <p style={{fontSize: 20}}>Connect to your Metamask wallet</p>
                            <button className="btn btn-primary" onClick={activateBrowserWallet}>Connect</button>
                        </div>
                }
            </div>
        </div>
    )
}

export default App;
