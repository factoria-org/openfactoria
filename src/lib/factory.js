/*
const factory_abi = [{
  "anonymous": false,
  "inputs": [
    {
      "indexed": true,
      "internalType": "address",
      "name": "sender",
      "type": "address"
    },
    {
      "indexed": true,
      "internalType": "address",
      "name": "receiver",
      "type": "address"
    },
    {
      "indexed": false,
      "internalType": "address",
      "name": "collection",
      "type": "address"
    }
  ],
  "name": "CollectionAdded",
  "type": "event"
}, {
  "inputs": [
    {
      "internalType": "address",
      "name": "_receiver",
      "type": "address"
    },
    {
      "internalType": "string",
      "name": "name",
      "type": "string"
    },
    {
      "internalType": "string",
      "name": "symbol",
      "type": "string"
    },
    {
      "components": [
        {
          "internalType": "string",
          "name": "placeholder",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "base",
          "type": "string"
        },
        {
          "internalType": "uint64",
          "name": "supply",
          "type": "uint64"
        },
        {
          "internalType": "bool",
          "name": "permanent",
          "type": "bool"
        }
      ],
      "internalType": "struct F0.Config",
      "name": "config",
      "type": "tuple"
    }
  ],
  "name": "genesis",
  "outputs": [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    }
  ],
  "stateMutability": "payable",
  "type": "function"
}]
*/
const factory_abi = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "collection",
        "type": "address"
      }
    ],
    "name": "CollectionAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_receiver",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_collection",
        "type": "address"
      }
    ],
    "name": "addCollection",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_receiver",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "symbol",
        "type": "string"
      },
      {
        "components": [
          {
            "internalType": "string",
            "name": "placeholder",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "base",
            "type": "string"
          },
          {
            "internalType": "uint64",
            "name": "supply",
            "type": "uint64"
          },
          {
            "internalType": "bool",
            "name": "permanent",
            "type": "bool"
          }
        ],
        "internalType": "struct F0.Config",
        "name": "config",
        "type": "tuple"
      }
    ],
    "name": "genesis",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]
const royalty_abi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "collection",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "get",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "royalty",
    "outputs": [
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      },
      {
        "internalType": "uint32",
        "name": "amount",
        "type": "uint32"
      },
      {
        "internalType": "bool",
        "name": "permanent",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "collection",
        "type": "address"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "receiver",
            "type": "address"
          },
          {
            "internalType": "uint32",
            "name": "amount",
            "type": "uint32"
          },
          {
            "internalType": "bool",
            "name": "permanent",
            "type": "bool"
          }
        ],
        "internalType": "struct Royalty.Royaltydef",
        "name": "def",
        "type": "tuple"
      }
    ],
    "name": "set",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]


const addresses = {
  v1: {
    rinkeby: {
      factory: "0x21163B50A0AC9a597C246e192764276cc994F936",
      royalty: "0x956cf692C90E50460BCAE282c36a18807F4A8fCC",
    },
    mainnet: {
      factory: "0xABbA052502321dcB789c90cAeFFe86CA4601bEb3",
      royalty: "0xF0Ec83A355eCa8539d6B4aD1066c3Bc6eA9ef6c3",
    }
  },
  v2: {
    rinkeby: {
      factory: "0xB4051d6205f6B98e5CB1238DaA279D8b875BF144",
      royalty: "0x956cf692C90E50460BCAE282c36a18807F4A8fCC",
    },
    mainnet: {
      factory: "0x4d70631664f1CEc37D33f289A3293662D70741C3",
      royalty: "0xF0Ec83A355eCa8539d6B4aD1066c3Bc6eA9ef6c3",
    }
  }
}
export let factory = async (web3, version) => {
  let chainId = await web3.eth.getChainId();
  let network = (chainId == 4 ? "rinkeby" : "mainnet")
  let c = new web3.eth.Contract(factory_abi, addresses[version][network].factory);
  c.$chainId = chainId
  c.$network = network
  return c
}
export let royalty = async (web3, version) => {
  let chainId = await web3.eth.getChainId();
  let network = (chainId == 4 ? "rinkeby" : "mainnet")
  let r = new web3.eth.Contract(royalty_abi, addresses[version][network].royalty);
  r.$chainId = chainId
  r.$network = network
  return r
}
