<script>
import { handleError } from './lib/errors.js'
import MintTable from './lib/MintTable.svelte';
import { onMount, createEventDispatcher } from 'svelte';
import { walletconnect } from './settings.js';
const dispatch = createEventDispatcher();
let invites = {}
let inviteItems = []
const f0 = new F0()
let count = 1
let error = ""
let contract
let inviteKey
let selectedInvite;
let showauth;
let auth;
let minting;
let loading;
let mintTx;
let value = 0;
let name
let symbol
let valueEth;
let netPrefix;
let network;
let web3;
let superprovider;
const code = {
  4: "rinkeby.",
  1: "",
  5: "goerli.",
}
const current_net = {
  4: "rinkeby",
  1: "mainnet",
  5: "goerli",
}
const authgen = async (_invite) => {
  selectedInvite = _invite;
  showauth = true;
  location.hash = "#" + contract + ":" + selectedInvite.key;
  await calc()
}
const calc = async () => {
  let _invite = selectedInvite
  console.log("*", _invite)
  auth = {
    key: _invite.key,
    proof: f0._invites[_invite.key].proof
  }
  value = "" + f0._invites[_invite.key].condition.raw.price * count
  valueEth = value / 10**18
  try {
    error = ""
    let estimate = await f0.api.mint(auth, count).estimate({
      value: value
    })
    console.log("estimate", estimate)
  } catch (e) {
    console.log("error", e.message)
    error = handleError(e.message)
  }
}
const mint = async () => {
  try {
    minting = true;
    error = ""
    let _invite = selectedInvite
    auth = {
      key: _invite.key,
      proof: f0._invites[_invite.key].proof
    }
    mintTx = await f0.api.mint(auth, count).send({
      value: value
    })
  } catch (e) {
    error = handleError(e.message)
  }
  minting = false;
}
const close = () => {
  location.hash = "#" + contract
  showauth = false;
}
const render = async () => {
  loading = true;
  try {
    if (location.hash.length > 0) {
      let u = location.hash.slice(1)
      let chunks = u.split(":")
      contract = chunks[0]
      if (chunks.length > 1) {
        inviteKey = chunks[1]
      }
    } else {
      error = "[ERROR] no contract address specified"
      return
    }
    await f0.init({
      web3,
      contract,
    })
    let chainId = await web3.eth.getChainId();
    netPrefix = code[chainId]
    network = current_net[chainId]

    name = await f0.api.name().call()
    symbol = await f0.api.symbol().call()
    invites = await f0.myInvites()
    if (invites && invites[inviteKey]) {
      await authgen(invites[inviteKey]) 
    }
    inviteItems = [] 
    for(let key in invites) {
      let o = invites[key].condition
      let date = new Date(o.converted.start)

      if (o.converted.limit > 0) {
        inviteItems.push({
          name: invites[key].name,
          key: key,
          cid: invites[key].cid,
          limit: `${o.converted.limit}`,
          price: `${o.converted.eth}`,
          start: `${date.toDateString()} ${date.toLocaleTimeString()}`,
          startUnix: o.raw.start,
        })
      }

    }
  } catch (e) {
    error = e.message
  }
  loading = false;
}
onMount(async () => {
  let provider
  superprovider = new Superprovider({
    walletconnect
  })
  try {
    let provider = await superprovider.current();
    if (!provider) {
      provider = await superprovider.connect()
    }
    web3 = new Web3(provider)
  } catch (e) {
    error = e.message
  }
  await render()
})
</script>
<div class='error'>{error}</div>
<div class='container'>
{#if name}
<div class='ns'>
  <h2>{name} ({symbol})</h2>
  <!--
  <a target="_blank" href="https://{netPrefix}etherscan.io/address/{contract}#code">ETHERSCAN:{contract}</a>
  -->
  <a target="_blank" href="/contract/#{contract}"><i class="fa-solid fa-link"></i> {contract}</a>
  <div class='annotation'>Mint your NFT from an invite list below.</div>
</div>
{/if}
{#if showauth}
<div class='showauth info'>
  <div class='header'>
    <div class='invitename'>
      <div class='faded'>invite</div>
      <div>{selectedInvite.name ? selectedInvite.name : selectedInvite.key}</div>
    </div>
    <div class='flexible'></div>
    <button on:click={close}><i class="fa-solid fa-circle-xmark"></i></button>
  </div>
  <h2>{valueEth} ETH</h2>
  <div class='selector'>
    <div class='name'>count</div>
    <div class='value'>
      <input type='number' bind:value={count} placeholder="mint count" on:input={ () => { calc() } }>
    </div>
  </div>
  {#if minting}
    <div class='loading'><i class="fa-solid fa-circle-notch fa-spin"></i><br>minting NFTs...</div>
  {:else}
    <button id='mint-button' class="display" on:click={() => { mint() }}>mint</button>
  {/if}
  {#if mintTx}
    <MintTable tx={mintTx} web3={web3} contract={contract} />
  {/if}
</div>
{:else}
  {#if loading}
    <div class='loading'><i class="fa-solid fa-circle-notch fa-spin"></i><br>loading invites...</div>
  {:else}
    {#if inviteItems && inviteItems.length > 0 }
      <table>
        <tr>
          <th>name</th>
          <th>price</th>
          <th class='invite-limit'>limit</th>
          <th class='invite-mint'>mint</th>
        </tr>
        {#each inviteItems as invite}
          <tr>
            <td>{invite.name ? invite.name : invite.key }</td>
            <td>{invite.price} ETH</td>
            <td class='invite-limit'>{invite.limit}</td>
            <td class='invite-mint'>
              <button class='display' on:click={() => { authgen(invite) }}>mint</button>
            </td>
          </tr>
        {/each}
      </table>
    {:else}
      <div class='empty'>you are not on any invite list<br>for this vending machine</div>
    {/if}
  {/if}
{/if}
<footer>
  <i class="fa-solid fa-circle-info"></i> Experiencing slow load time?<br><br>anyone can <a target="_blank" href="https://skinnerbox.factoria.app/#{contract}">instantly deploy this vending machine and mint!</a>
</footer>
<nav>
  <div>powered by</div>
  <h1><a href="/">factoria</a></h1>
</nav>
</div>
<style>
.title {
  padding: 0px 10px;
  margin: 10px 5px;
  letter-spacing: -1px;
  border-left: 10px solid white;
  /*
  color: rgba(255,255,255,0.8);
  */
  font-size: 20px;
  text-transform:lowercase;
  font-weight: bold;
}
nav {
  margin-top: 50px;
  padding: 30px 0;
  font-size: 14px;
  color: black;
  text-align: center;
  background: #f5f5f5;
}
nav h1 {
  padding: 0;
  font-size: 30px;
  margin-top: 5px;
  color: black;
  text-transform: lowercase;
}
nav h1 a{
  text-decoration: none;
  color: black;
}
.container {
  max-width: 600px;
  margin: 0px auto;
  padding: 10px;
  box-sizing: border-box;
}
table {
  width: 100%;
  box-sizing: border-box;
  padding: 0px;
  table-layout: fixed;
}
th {
  padding: 10px;
  font-size: 14px;
  color: black;
  background: #eaeaea;
}
td {
  padding: 10px;
  box-sizing: border-box;
  font-size: 14px;
  /*
  font-family: Menlo, monaco, monospace;
  */
  letter-spacing: 1px;
  color: black;
  word-break: break-all;
  text-align: center;
}
td:first-child {
  text-align: left;
}
td button {
  width: 100%;
}
.name {
  text-align: left;
}
.loading {
  width: 100%;
  padding: 50px;
  box-sizing: border-box;
}
.info {
  background: #fafafa;
}
.info .item {
  padding: 10px 0 0;
}
.info .item .val {
  font-size: 40px;
  font-weight: bold;
}
.item button {
  width: 100%;
}
.item .name {
  width: 150px;
}
.header {
  display: flex;
  align-items: flex-start;
}
.flexible {
  flex-grow: 1;
}
.header button {
  background: none;
  padding: 0;
  font-size: 30px;
  margin: 0;
}
.faded {
  opacity: 0.6;
}
h2 {
  padding: 20px;
  text-align: center;
  font-size: 40px;
  box-sizing: border-box;
}
#mint-button {
  margin: 0;
  padding: 10px 20px;
  font-size: 16px;
  box-sizing: border-box;
  width: 100%;
}
.selector {
  font-size: 20px;
}
.selector .name {
  font-weight: bold;
  font-size: 20px;
}
.selector .value {
  flex-grow: 1;
  padding: 10px 0;
}
.selector input[type=number] {
  font-size: 30px;
  padding: 20px;
  font-weight: bold;
  border: 2px solid #dadada;
}
.invitename {
  word-break: break-all;
  padding-right: 20px;
  color: black;
  font-weight: bold;
  font-size: 20px;
}
.invitename h3 {
  font-weight: bold;
  text-transform: uppercase;
  color: rgba(255,255,255,0.9);
  font-size: 20px;
}
.buttons {
  padding: 10px 0;
}
.buttons a {
  padding: 5px;
  font-size: 16px;
  color: black;
}
.ns h2 {
  text-align: left;
  padding: 0;
  letter-spacing: -2px;
  font-family: sans-serif;
  font-size: 40px;
  line-height: 40px;
}
.ns {
/*
  border-left: 10px solid white;
  margin: 10px 5px 20px;
  padding: 10px 20px;
  */
  padding: 50px 0 0;
  font-size: 14px;
  color: black;
}
.annotation {
  color: white;
  padding: 5px 0;
  font-family: sans-serif;
  letter-spacing: 1px;
}
.ns a {
  display: block;
  padding: 10px 0;
  color: black;

  font-family: Menlo, monaco, monospace;
  font-size: 12px;
  text-decoration: none;
}
.ns a img {
  height: 12px;
  vertical-align: top;
}
.empty {
  text-transform: uppercase;
  padding: 50px;
  box-sizing: border-box;
  width: 100%;
  text-align: center;
  font-size: 12px;
}
footer {
  padding: 20px;
  box-sizing: border-box;
  font-size: 14px;
  color: rgba(0,0,0,0.6);
  line-height: 14px;
}
footer a {
  color: black;
}
.network {
  font-weight: bold;
  color: black;
  border-left: 5px solid yellowgreen;
  padding: 5px 10px;
  margin: 0 0 20px;
  font-size: 12px;
}
.account {
  color: black;
  font-size: 12px;
  font-weight: normal;
  font-family: Menlo, monaco, monospace;
}
</style>
