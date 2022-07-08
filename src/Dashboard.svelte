<script>
import { handleError } from './lib/errors.js'
import {onMount} from "svelte";
import Nav from './lib/Nav.svelte'
import Invite from './lib/Invite.svelte'
import Revenue from './lib/Revenue.svelte'
import Ownership from './lib/Ownership.svelte'
import Royalty from './lib/Royalty.svelte'
import Gift from './lib/Gift.svelte'
import { refreshDB } from './lib/db.js';
import { uploadPlaceholder } from './lib/Uploader.js';
import { walletconnect } from './settings.js';
let folders = []
const f0 = new F0()
let name = ""
let symbol = ""
let items = []
let uploading = false;
let loading;
let net = ""
let chainId;
let transacting = false;
let netPrefix = ""
let placeholder = ""
let placeholderImage = ""
let editable = false
let config = {}
let keys = []
let files = []
let invites;
let error = ""
let contract;
let owner;
let role;
let action;
let inviteKey;
let abistr;
let superprovider;
let web3;
let InviteAnchor;
let current_network;
let current_account;
let bootstrapped;
let defaultItem;
const get = async () => {
  loading = true;
  if (location.hash.length > 0) {
    let u = location.hash.slice(1)
    let chunks = u.split(":")
    contract = chunks[0]
    if (chunks.length > 1) {
      action = chunks[1]
    }
    if (chunks.length > 2) {
      inviteKey = chunks[2]
    }
  } else {
    error = "[ERROR] no contract address specified"
    return
  }
  chainId = await web3.eth.getChainId();
  netPrefix = (chainId.toString() === "4" ? "rinkeby." : "")
  current_network = (chainId.toString() === "4" ? "rinkeby" : "mainnet")
  await f0.init({
    web3,
    contract,
  })
  defaultItem = {
    name: "etherscan",
    link: `https://${netPrefix}etherscan.io/address/${contract}`,
    text: `https://${netPrefix}etherscan.io/address/${contract}`,
  }
  abistr = JSON.stringify(f0.abi,null,2)
  owner = await f0.api.owner().call()
  role = (owner.toLowerCase() === f0.account.toLowerCase() ? "admin" : "public")
  name = await f0.api.name().call()
  symbol = await f0.api.symbol().call()
  //placeholder = await f0.placeholder()
  config = await f0.config()
  invites = await f0.invites()
  console.log("invites", invites)
  console.log("config", config)
  items = [{
    name: "Default vending machine",
    link: "/mint/#" + contract,
    text: "Open vending machine",
    className: "btn display"
  }, {
    name: "Build your own custom vending machine website",
    link: "https://skinnerbox.factoria.app#" + contract,
    text: "Open skinnerbox factory",
    className: "btn display"
  }, {
    name: "etherscan",
    link: `https://${netPrefix}etherscan.io/address/${contract}`,
    text: `https://${netPrefix}etherscan.io/address/${contract}`,
  }, {
    name: "placeholder uri",
    key: "placeholder",
    link: config.converted.placeholder,
    text: config.raw.placeholder,
    editable: false
  }, {
    name: "base uri",
    key: "base",
    link: config.converted.base,
    text: config.raw.base,
    editable: false
  }, {
    name: "total supply",
    key: "supply",
    text: config.raw.supply,
    editable: false
  }, {
    name: "permanent",
    key: "permanent",
    text: config.raw.permanent.toString(),
    editable: false
  }]
  loading = false
}

const refresh = async () => {
  loading = true;
  try {
    await get()
  } catch (e) {
    error = e.message
  }
  loading = false;
}
const triggererror = async (e) => {
  if (e.detail.error) {
    error = e.detail.error
  } else {
    error = ""
  }
}
const Config = {
  editable: false,
  transacting: false,
  edit: async () => {
    Config.editable = true
    items = items.map((item) => {
      if (typeof item.editable !== 'undefined') {
        item.editable = true
      }
      return item
    })
  },
  save: async () => {
    let isvalid = (config.raw.base.length === 0 || /ipfs:\/\/[^/]+\//.test(config.raw.base))
    if (isvalid) {
      try {
        Config.transacting = true;
        let tx = await f0.api.setConfig(config.raw).send()
        await get()
        Config.editable = false
        Config.transacting = false;
      } catch (e) {
        error = e.message
        Config.transacting = false;
      }
    } else {
      error = "The base URI must take the following format: 'ipfs://<cid>/', or an empty string"
    }
  },
  cancel: () => {
    items = items.map((item) => {
      if (typeof item.editable !== 'undefined') {
        item.editable = false
      }
      return item
    })
    Config.editable = false
  }
}
const Ns = {
  editable: false,
  transacting: false,
  edit: async () => {
    Ns.editable = true
  },
  save: async () => {
    Ns.transacting = true;
    let tx = await f0.api.setNS(name, symbol).send()
    name = await f0.api.name().call()
    symbol = await f0.api.symbol().call()
    Ns.editable = false
    Ns.transacting = false;
  },
  cancel: () => {
    Ns.editable = false
  }
}
const upload = async () => {
  if (files.length > 0) {
    uploading = true
    try {
      let metacid = await uploadPlaceholder(files[0])
      config.raw.placeholder = "ipfs://" + metacid
    } catch (e) {
      let confirmed = confirm("NFT.STORAGE api key needed. Go to the config page and set it first")
      if (confirmed) {
        window.open("/config/")
      }
    }
    uploading = false;
  }
}
const select = (cid) => {
  config.raw.base = `ipfs://${cid.trim()}/` 
}
const init = async () => {
  await get()
  folders = await refreshDB("metadata")
  bootstrapped = true;
}
onMount(async () => {
  try {
    superprovider = new Superprovider({ walletconnect })
    let provider = await superprovider.current()
    if (!provider) {
      provider = await superprovider.connect()
    }
    current_account = superprovider.account
    web3 = new Web3(provider)
    await init()
  } catch (e) {
    error = e.message
  }
})
$: {
  if (config && config.raw) {
    Object.keys(config.raw).forEach((key) => {
      if (typeof config.raw[key] === "string") {
        config.raw[key] = config.raw[key].trim()
      }
    })
    fetch("https://ipfs.io/ipfs/" + config.raw.placeholder.replace("ipfs://", "")).then((r) => { return r.json() }).then((meta) => {
      if (meta.image.startsWith("ipfs://")) {
        placeholderImage =  "https://ipfs.io/ipfs/" + meta.image.replace("ipfs://", "")
      } else if (meta.image.startsWith("http")) {
        placeholderImage = meta.image
      }
    })
    keys = Object.keys(config.raw)
  }
}
$: {
  if (action === "mint") {
    console.log("InviteAnchor", InviteAnchor)
    if (InviteAnchor) {
      InviteAnchor.scrollIntoView({behavior: "smooth"})
    }
  }
}
</script>
<div class='error'>{error}</div>
<Nav contracts={"selected"} network={current_network} account={current_account}/>
{#if loading}
  <div class='loading'><i class="fa-solid fa-circle-notch fa-spin"></i><br>loading...</div>
{:else}
<div class={role}>
{#if bootstrapped}
<div class='info'>
  <div class='ns'>
    {#if Ns.editable}
      <div class='item'>
        <div class='name'>name</div>
        <div class='val'>
          <input type='text' bind:value={name} />
        </div>
      </div>
      <div class='item'>
        <div class='name'>symbol</div>
        <div class='val'>
          <input type='text' bind:value={symbol} />
        </div>
      </div>
    {:else}
      <div class='item'>
        <h1>{name} ({symbol})</h1>
      </div>
    {/if}
    <div class='item'>
      {#if Ns.editable}
        {#if Ns.transacting}
          <div class='loading'><i class="fa-solid fa-circle-notch fa-spin"></i><br>saving to the blockchain...</div>
        {:else}
          <div class='bar'>
            <button on:click={Ns.save}>save</button>
            <button on:click={Ns.cancel}>cancel</button>
          </div>
        {/if}
      {:else}
        <div class='bar'>
          <button on:click={Ns.edit}>edit</button>
        </div>
      {/if}
    </div>
  </div>
</div>
{/if}
{#if bootstrapped}
  <div class='info'>
    <div class='config'>
      <h2>Configuration</h2>
      {#each items as item}
        <div class='item'>
          <div class='name'>{item.name}</div>
          <div class='val'>
            {#if item.editable}
              {#if item.key === 'permanent'}
                <input name='permanent' type='checkbox' bind:checked={config.raw[item.key]} />
                <span>{config.raw[item.key]}</span>
              {:else}
                <input type='text' class='val' bind:value={config.raw[item.key]} />
              {/if}
              {#if item.key === "placeholder"}
                {#if uploading}
                  <div class='loading'><i class="fa-solid fa-circle-notch fa-spin"></i><br>uploading...</div>
                {:else}
                  <input type='file' accept="image/*" bind:files={files} on:change={upload}>
                {/if}
              {/if}
              {#if item.key === "base"}
                <div class='folders'>
                  {#each folders as folder}
                    <div class='item'>
                      <button on:click={() => {select(folder.cid)}}>select</button>
                      <div class='folder'>
                        <h3>{folder.name}</h3>
                        <div>{folder.cid}</div>
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}
            {:else}
              {#if item.link}
                <a target="_blank" class='val {item.className ? item.className : ""}' href={item.link}>{item.text}</a>
              {:else}
                <div>{item.text}</div>
              {/if}
            {/if}
            {#if item.key === "placeholder"}
              <div class='file-holder'>
                <img class='thumb' src={placeholderImage}>
              </div>
            {/if}
          </div>
        </div>
      {/each}
      <div class='item'>
        {#if Config.editable}
          {#if Config.transacting}
            <div class='loading'><i class="fa-solid fa-circle-notch fa-spin"></i><br>saving to the blockchain...</div>
          {:else}
            <div class='bar'>
              <button on:click={Config.save}>save</button>
              <button on:click={Config.cancel}>cancel</button>
            </div>
          {/if}
        {:else}
          <div class='bar'>
            <button on:click={Config.edit}>edit</button>
          </div>
        {/if}
      </div>
    </div>
  </div>
{:else}
  {#if defaultItem}
  <div class='info'>
    <div class='config'>
      <h2>Configuration</h2>
      <div class='item'>
        <div class='name'>{defaultItem.name}</div>
        <div class='val'>
          <a target="_blank" class='val' href={defaultItem.link}>{defaultItem.text}</a>
        </div>
      </div>
    </div>
  </div>
  {/if}
{/if}
{#if bootstrapped}
  {#if role != "public"}
  <div class='info'>
    <Gift role={role} netPrefix={netPrefix} invites={invites} contract={contract} web3={web3} on:refresh={refresh} on:error={triggererror} />
  </div>
  {/if}
  <div class='info'>
    <div bind:this={InviteAnchor}></div>
    <Invite role={role} netPrefix={netPrefix} invites={invites} inviteKey={inviteKey} contract={contract} web3={web3} on:refresh={refresh} on:error={triggererror} />
  </div>
  <div class='info'>
    <Royalty role={role} contract={contract} web3={web3} chainId={chainId} on:error={triggererror} />
  </div>
  <div class='info'>
    <Revenue role={role} contract={contract} web3={web3} on:error={triggererror} />
  </div>
  <div class='info'>
    <Ownership role={role} contract={contract} web3={web3} chainId={chainId} on:error={triggererror} />
  </div>
{/if}
{#if abistr && abistr.length > 0}
<div class='info'>
  <div class='abi'>
    <h2>ABI</h2>
    <br>
    <textarea readonly bind:value={abistr}></textarea>
  </div>
</div>
{/if}
</div>
{/if}
<style>
.folders {
  margin: 10px 0;
  border: 1px solid rgba(255,255,255,0.1);
}
h1 {
  padding: 0px;
}
.info .folders .item {
  align-items: center;
  padding: 10px 20px;
}
.folder {
  flex-grow: 1;
}
.info .item {
  padding: 10px 5px;
  border: none;
}
.name {
  text-align: left;
  color: rgba(255,255,255,0.9);
  padding: 0;
  margin-bottom: 10px;
}
.folder > * {
  margin-bottom: 2px;
}
.item {
  align-items: start;
}
.bar {
  text-align: left;
}
.abi textarea {
  height: 300px;
}
table {
  table-layout:fixed;
  width:100%;
}
</style>
