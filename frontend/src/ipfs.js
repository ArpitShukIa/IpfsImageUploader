import {create} from 'ipfs-http-client'

const projectId = process.env.REACT_APP_INFURA_PROJECT_ID
const projectSecret = process.env.REACT_APP_INFURA_PROJECT_SECRET
const ipfsBaseUrl = process.env.REACT_APP_INFURA_PROJECT_BASE_URL

const auth = 'Basic ' + btoa(projectId + ':' + projectSecret);

export const ipfsClient = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth
    }
})

export const getIpfsFileUrl = (fileHash) => `${ipfsBaseUrl}/ipfs/${fileHash}`
