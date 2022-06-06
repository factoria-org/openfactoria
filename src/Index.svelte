<script>
import {onMount} from "svelte";
import { handleError } from './lib/errors.js'
import Nav from './lib/Nav.svelte'
import { uploadPlaceholder } from './lib/Uploader.js';
import { factory } from './lib/factory.js';
export let version;
let web3 = new Web3(window.ethereum)
let collections = []
let uploading = false;
let deploying;
let loading;
let displayForm = "hidden"
let files = []
let placeholderImage = "";
let error = "";
let payload = {
  name: "",
  symbol: "",
  placeholder: "",
  supply: "",
  base: ""
}
let current_account;
let current_network;
let factory_contract;
const getcollections = async () => {
  loading = true;
  let accounts = await window.ethereum.send('eth_requestAccounts');
  let account = accounts.result[0]
  current_account = account;
  console.log("current_account", current_account)
  let _collections = await factory_contract.getPastEvents("CollectionAdded", {
    filter: { receiver: account },
    fromBlock: 0,
    toBlock: 'latest'
  }).then((r) => {
    return r.map((x) => {
      return x.returnValues.collection
    })
  })
  let addresses = Array.from(new Set(_collections))
  let c = []
  const f0 = new F0()
  for(let address of addresses) {
    console.log("address", address)
//    await f0.init({
//      web3,
//      contract: address,
//    })
    c.push({
      address,
      name: "fetching...",
      symbol: ""
    })
  }
  collections = c
  loading = false;
  let toremove = []
  for(let i=0; i<collections.length; i++) {
    let address = collections[i].address
    await f0.init({
      web3,
      contract: address,
    })
    let owner = await f0.api.owner().call()
    if (owner.toLowerCase() !== account.toLowerCase()) {
      console.log("remove at", i)
      toremove.push(i)
      continue
    } else {
      let name = await f0.api.name().call()
      let symbol = await f0.api.symbol().call()
      collections[i].name = name
      collections[i].symbol = symbol
    }
  }
  for(let i of toremove) {
    collections.splice(i, 1)
  }
}
const create = () => {
  displayForm = ""
}
const close = () => {
  displayForm = "hidden"
}
const genesis = async () => {
  deploying = true;
  console.log("payload", payload)
  let all = "0x0000000000000000000000000000000000000000000000000000000000000000"  // bytes32 version of "*"
  let accounts = await window.ethereum.send('eth_requestAccounts');
  let account = accounts.result[0]
  try {
    let tx = await factory_contract.methods.genesis(
      account,
      payload.name,
      payload.symbol,
      {
        placeholder: payload.placeholder,
        base: payload.base,
        supply: payload.supply,
        permanent: false
      },
    ).send({ from: account })
    console.log("tx", tx)
    deploying = false;
    location.href = "/contract/#" + tx.events.CollectionAdded.returnValues.collection
  } catch (e) {
    error = e.message
  }
//  await getcollections()
}
const upload = async () => {
  if (files.length > 0) {
    uploading = true
    let metacid = await uploadPlaceholder(files[0])
    payload.placeholder = "ipfs://" + metacid
    uploading = false;
  }
}
$: {
  if (payload && payload.placeholder) {
    fetch("https://ipfs.io/ipfs/" + payload.placeholder.replace("ipfs://", "")).then((r) => { return r.json() }).then((meta) => {
      if (meta.image.startsWith("ipfs://")) {
        placeholderImage =  "https://ipfs.io/ipfs/" + meta.image.replace("ipfs://", "")
      } else if (meta.image.startsWith("http")) {
        placeholderImage = meta.image
      }
    })
  }
}
let isv2 = (version === "v2" ? "selected" : "")
let isv1 = (version === "v1" ? "selected" : "")
loading = true;
onMount(async () => {
  factory_contract = await factory(web3, version)
  current_network = factory_contract.$network
  await getcollections()
})
</script>
<div class='error'>{error}</div>
<Nav v1={isv1} v2={isv2} network={current_network} account={current_account}/>
{#if loading}
  <div class='loading'><i class="fa-solid fa-circle-notch fa-spin"></i><br>loading...</div>
{:else}
{#if displayForm === "hidden"}
  <div class='top'>
    <button on:click={create}>+ create a contract</button>
  </div>
{/if}
<header>
<form class='form {displayForm}' on:submit|preventDefault|stopPropagation={genesis}>
  <div class='item'>
    <label>name</label>
    <input type='text' bind:value={payload.name} placeholder='name'>
  </div>
  <div class='item'>
    <label>symbol</label>
    <input type='text' bind:value={payload.symbol} placeholder='symbol'>
  </div>
  <div class='item'>
    <label>placeholder uri</label>
    <input type='text' bind:value={payload.placeholder} placeholder='placeholder uri (optional. if not set, a default image will be used)'>
    <div class='file-holder'>
      {#if placeholderImage && placeholderImage.length > 0}
      <img class='thumb' src={placeholderImage}>
      {/if}
    </div>
    {#if uploading}
      <div class='loading'><i class="fa-solid fa-circle-notch fa-spin"></i><br>uploading...</div>
    {:else}
      <input type='file' accept="image/*" bind:files={files} on:change={upload}>
    {/if}
  </div>
  <div class='item'>
    <label>total supply</label>
    <input type='number' bind:value={payload.supply} placeholder='total supply'>
  </div>
  <div class='item'>
    <label>base uri</label>
    <input type='text' bind:value={payload.base} placeholder='base uri (optional. you can set it later)'>
  </div>
  {#if displayForm === "hidden"}
  {:else}
    <div class='item'>
      {#if deploying}
        <div class='loading'><i class="fa-solid fa-circle-notch fa-spin"></i><br>deploying...</div>
      {:else}
        <input type='submit' value='Deploy'>
      {/if}
      <button on:click={close}>close</button>
    </div>
  {/if}
</form>
</header>
{#each collections as collection}
  <a class='item' href="/contract/#{collection.address}">
    {#if collection.name}
    <h2>{collection.name} ({collection.symbol})</h2>
    {/if}
    <div>{collection.address}</div>
  </a>
{/each}
{/if}
