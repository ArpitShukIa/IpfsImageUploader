import SimpleStorage from "./chain-info/contracts/SimpleStorage.json"
import networkMapping from "./chain-info/deployments/map.json"
import {Contract, providers, utils} from "ethers";

export const getDeployedContract = async () => {
    const {abi} = SimpleStorage
    const provider = new providers.Web3Provider(window.ethereum)
    const {chainId} = await provider.getNetwork()
    if (!chainId || !networkMapping[String(chainId)]) {
        return null
    }
    const contractAddress = networkMapping[String(chainId)]["SimpleStorage"][0]
    const contractInterface = new utils.Interface(abi)
    const contract = new Contract(contractAddress, contractInterface, provider.getSigner())
    return await contract.deployed()
}
