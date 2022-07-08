<script>
import { uploadInvite } from './inviteuploader.js';
import { handleError } from './errors.js'
import MintTable from './MintTable.svelte';
import { onMount, createEventDispatcher } from 'svelte';
export let invites = {}
export let contract;
export let inviteKey;
//export let f0;
export let web3;
export let netPrefix;
export let role;
const f0 = new F0()
const dispatch = createEventDispatcher();
let picker;
let inviteItems = []
let listStr = ""
let listFormStyle = "hidden"
let inviteFormStyle = "hidden"
let publishingInvite = false;
let uploadButtonStyle = ""
let uploadingInvites;
let listCid;
let invitelist;
let mintTx;
let minting;
let count = 1;
let root;
let auth;
let authstr;
let value;
let showauth;
let selectedInvite;
let listName;
const showPrivate = () => {
  inviteFormStyle = "hidden"
  listFormStyle = ""
}
const showPublic = () => {
  listFormStyle = "hidden"
  listCid = ""
  root = "0x0000000000000000000000000000000000000000000000000000000000000000"
  inviteFormStyle = ""
  flatpickr("#picker", {  
    inline: true,
    enableTime: true,
    minuteIncrement: 1,
    defaultDate: (invite.start ? parseInt(invite.start) * 1000 : new Date(0))
  });
}
const createList = async () => {
  // 0. Turn the string into a list
  let list = listStr.split("\n").map((line) => {
    return line.trim()
  }).filter((line) => {
    return line && line.length > 0
  })

  // 1. upload the invite list to IPFS
  uploadingInvites = true
  uploadButtonStyle = "hidden"
  console.log("listName", listName)
  let cid = await uploadInvite(list, listName) 
  listCid = cid;
  uploadingInvites = false

  invitelist = new Invitelist(list)
  console.log("invitelist", invitelist)
  root = invitelist.root()

  // 2. display the form
//  listFormStyle = "hidden"
  inviteFormStyle = ""
  flatpickr("#picker", {  
    inline: true,
    enableTime: true,
    minuteIncrement: 1,
    defaultDate: (invite.start ? parseInt(invite.start) * 1000 : new Date(0))
  });
}
const hexcid = (cid) => {
  if (cid && cid.length > 0) {
    let v1 = new Cids(cid)
    let bytes = v1.multihash
    bytes = bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
    return "0x" + bytes.slice(4)
  } else {
    return "0x00"
  }
}
const createInvite = async () => {
  publishingInvite = true
  let cid = hexcid(listCid)
  let tx = await f0.api.setInvite(root, cid, invite).send()
  console.log("tx", tx)
  publishingInvite = false
  inviteFormStyle = "hidden"
  listFormStyle = "hidden"
  dispatch("refresh")
}
let invite = {
  price: 0,
  limit: 0,
  start: 0
};
const edit = (_invite) => {
  invite.price = _invite.priceWei
  invite.limit = _invite.limit
  invite.start = _invite.startUnix
  root = _invite.key
  listCid = _invite.cid
  inviteFormStyle = ""
  console.log("invite.start", invite.start)
  flatpickr("#picker", {  
    inline: true,
    enableTime: true,
    minuteIncrement: 1,
    defaultDate: (invite.start ? parseInt(invite.start) * 1000 : new Date(0))
  });
}
const authgen = async (_invite) => {
  selectedInvite = _invite;
  showauth = true;
  await calc()
}
const share = async (_invite) => {
  selectedInvite = _invite;
  showauth = true;
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
  //authstr = JSON.stringify([auth.key, auth.proof], null, 2)
  authstr = JSON.stringify([auth.key, auth.proof])
  try {
    dispatch("error", {
      error: null
    })
    let tx = await f0.api.mint(auth, count).estimate({
      value: value
    })
  } catch (e) {
    dispatch("error", {
      error: handleError(e.message)
    })
  }
}
const mint = async () => {
  try {
    minting = true;
    dispatch("error", {
      error: null
    })
    mintTx = await f0.api.mint(auth, count).send({
      value: value
    })
  } catch (e) {
    dispatch("error", {
      error: handleError(e.message)
    })
  }
  minting = false;
}
onMount(async () => {
  await f0.init({
    web3,
    contract,
  })
  if (invites && invites[inviteKey]) {
    await authgen(invites[inviteKey]) 
  }
})
$: {
  inviteItems = [] 
  for(let key in invites) {
    let o = invites[key].condition
    let date = new Date(o.converted.start)
    inviteItems.push({
      name: invites[key].name,
      key: key,
      cid: invites[key].cid,
      limit: `${o.converted.limit}`,
      price: `${o.converted.eth}`,
      priceWei: `${o.raw.price}`,
      start: `${date.toDateString()} ${date.toLocaleTimeString()}`,
      startUnix: o.raw.start,
    })
  }
  if (picker) {
    invite.start = new Date(picker).getTime()/1000
    console.log("# picker", picker)
    console.log("inviet.start", invite.start)
  }
}
let shareURL;
$: {
  if (selectedInvite) {
    shareURL = location.protocol + "//" + location.host + location.pathname + "#" + contract + ":mint:" + selectedInvite.key
  }
}

</script>
<div class='invites {role}'>
<h2>Invites</h2>
<div class='head'>
  <button on:click={showPrivate}>Create a Private Invite</button>
  <button on:click={showPublic}>Create a Public Invite</button>
</div>
<form on:submit|preventDefault|stopPropagation={createList} class="form {listFormStyle}">
  {#if inviteFormStyle == "hidden"}
    <input type='text' placeholder='the name of the invite list' bind:value={listName}>
    <textarea bind:value={listStr} placeholder="line separated address list"></textarea>
  {:else}
    <input disabled type='text' placeholder='the name the invite list' bind:value={listName}>
    <textarea bind:value={listStr} disabled placeholder="line separated address list"></textarea>
  {/if}
  {#if uploadingInvites}
    <div class='loading'><i class="fa-solid fa-circle-notch fa-spin"></i><br>saving invites to IPFS...</div>
  {/if}
  {#if uploadButtonStyle != "hidden"}
    <input type='submit' value="Upload the list to IPFS"/>
  {/if}
</form>
<form on:submit|preventDefault|stopPropagation={createInvite} class="form {inviteFormStyle}">
  <div class='item'>
    <div class='name'>invite key</div>
    <div class='val'>
      {#if root == "0x0000000000000000000000000000000000000000000000000000000000000000" }
        <div class='annotation'>0x0 => public invite key</div>
      {:else}
        <div class='annotation'>The merkle root of the invite list</div>
      {/if}
      <input disabled type='text' bind:value={root}>
    </div>
  </div>
  {#if listCid}
  <div class='item'>
    <div class='name'>IPFS cid</div>
    <div class='val'>
      <input disabled type='text' bind:value={listCid}>
    </div>
  </div>
  {/if}
  <div class='item'>
    <div class='name'>price</div>
    <div class='val'>
      <div class='annotation'>{invite.price / 10 ** 18} ETH</div>
      <input type='text' bind:value={invite.price}>
    </div>
  </div>
  <div class='item'>
    <div class='name'>start time</div>
    <div class='val'>
      <input id='start' type='text' bind:value={invite.start}>
      <div class='annotation'>Leave as "1969-12-31 19:00" <b>(Unix timestamp 0)</b> to start immediately</div>
      <input type='text' id='picker' bind:value={picker}>
    </div>
  </div>
  <div class='item'>
    <div class='name'>mint limit</div>
    <div class='val'>
      <input type='text' bind:value={invite.limit}>
    </div>
  </div>
  <div class='item'>
    {#if publishingInvite}
      <div class='loading'><i class="fa-solid fa-circle-notch fa-spin"></i><br>publishing the invite to the blockchain...</div>
    {:else}
      <div class='name'>
        <input type='submit' value="Publish to the blockchain" />
      </div>
    {/if}
  </div>
</form>
{#if showauth}
<div class='showauth info'>
  <div class='head'>
    <h3>Invite Key<br>{selectedInvite.key}</h3>
    <div class='annotation'>
      Mint directly from this page, or mint on&nbsp;<a href="https://{netPrefix}etherscan.io/address/{contract}#writeContract" target="_blank">Etherscan</a>
    </div>
    <div class='share'>
      <div>share this invite</div>
      <input type='text' readonly bind:value={shareURL} />
    </div>
  </div>
  <div class='item'>
    <div class='name'>mint (payableAmount)</div>
    <div class='val'>
      <pre>{value}</pre>
    </div>
  </div>
  <div class='item'>
    <div class='name'>auth (tuple)</div>
    <div class='val'>
      <pre>{authstr}</pre>
    </div>
  </div>
  <div class='item'>
    <div class='name'>_count (mint count)</div>
    <div class='val'>
      <input type='number' bind:value={count} placeholder="mint count" on:input={ () => { calc() } }>
    </div>
  </div>
  <div class='item'>
    <div class='name'>mint</div>
    <div class='val'>
      {#if minting}
        <div class='loading'><i class="fa-solid fa-circle-notch fa-spin"></i><br>minting NFTs...</div>
      {:else}
        <button class="display" on:click={() => { mint(invite) }}>mint</button>
      {/if}
    </div>
  </div>
  {#if mintTx}
    <MintTable tx={mintTx} web3={web3} contract={contract} />
  {/if}
</div>
{/if}
<div class='table-container'>
<table>
  <tr>
    <th>Name</th>
    <th>Invite key</th>
    <th>Invite list (IPFS)</th>
    <th class='invite-limit'>limit</th>
    <th>price</th>
    <th>start time</th>
    <th class='invite-mint'>mint</th>
    <th class='invite-share'>invite link</th>
    {#if role !== "public"}
      <th class='invite-edit'>edit invite</th>
    {/if}
  </tr>
  {#each inviteItems as invite}
    <tr class={selectedInvite && selectedInvite.key == invite.key ? "selected" : ""}>
      <td class='invite-name'>{invite.name ? invite.name : ""}</td>
      <td>{invite.key}</td>
      {#if invite.cid == "bafkreiaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}
        <td>
          <div>Public</div>
          <div class='faded'>anyone can mint</div>
        </td>
      {:else}
        <td><a target="_blank" href="https://ipfs.io/ipfs/{invite.cid}">{invite.cid}</a></td>
      {/if}
      <td class='invite-limit'>{invite.limit}</td>
      <td>
        <div>{invite.price} ETH</div>
        <div class='faded'>{invite.priceWei} wei</div>
      </td>
      <td>
        <div>{invite.start}</div>
        <div class='faded'>(unix timestamp: {invite.startUnix})</div>
      </td>
      <td class='invite-mint'>
        <button class='display' on:click={() => { authgen(invite) }}>mint</button>
        <div class='disabled'>selected</div>
      </td>
      <td class='invite-share'>
        <button class='display' on:click={() => { share(invite) }}>share</button>
      </td>
      {#if role !== "public"}
        <td class='invite-edit'><button on:click={() => { edit(invite) }}>edit</button></td>
      {/if}
    </tr>
  {/each}
</table>
</div>
</div>
<style>
.table-container {
  overflow-x: auto;
}
.head {
  margin: 10px 5px;
}
table {
  box-sizing: border-box;
  padding: 0px;
}
th {
  padding: 10px;
  font-size: 14px;
  color: rgba(255,255,255,0.8);
  background: rgba(0,0,0,0.3);
  color: royalblue;
}
td {
  padding: 10px;
  min-width: 100px;
  box-sizing: border-box;
  background: rgba(0,0,0,0.1);
  font-size: 14px;
  color: rgba(255,255,255,0.8);
  word-break: break-all;
}
td button {
  width: 100%;
}
a {
  color: royalblue;
}
button {
  margin: 0;
}
textarea {
  height: 200px;
}
.form .item {
  align-items: baseline;
}
.faded {
  opacity: 0.4;
}
button, input[type=submit] {
  margin-top: 10px;
}
.name {
  text-align: left;
}
.item {
  padding: 10px 0;
  border: none;
}
.loading {
  width: 100%;
  box-sizing: border-box;
}
/*
#start {
  display: none;
}
*/
#picker {
  margin-bottom: 10px;
}
.flatpickr-calendar {
  border-radius: 0 !important;
}
.flatpickr-time {
  border-radius: 0;
}
.flatpickr-time input[type=text], .flatpickr-time input[type=number] {
  outline: none;
  /*
  border: none !important;
  */
  border-radius: 0;
}
.annotation {
  padding: 10px 5px;
  font-size: 12px;
  text-transform: uppercase;
}
.showauth .val {
  padding: 10px;
}
.showauth .head {
  margin: 0;
  padding: 50px;
  background: rgba(0,0,0,0.1);
}
.head .annotation {
  padding: 0;
}
h3 {
  font-size: 20px; 
  color: royalblue;
  margin-bottom: 10px;
}
tr.selected td {
  background: rgba(0,0,0,0.5);
  color: royalblue;
}
tr.selected a {
  color: white;
}
tr.selected .display {
  display: none !important;
}
tr .disabled {
  display: none;
}
tr.selected .disabled {
  display: block;
  text-align: center;
}
/*
#start {
  display: none;
}
*/
.share {
  margin-top: 10px;
  display: flex;
  align-items: center;
  background: rgba(0,0,0,0.2);
  padding: 5px 10px;
}
.share div {
  padding: 5px 10px 5px 0;
  flex-shrink: 0;
  font-size: 14px;
}
.share input[type=text] {
  border: none;
  flex-grow: 1;
  padding: 5px 10px;
  box-sizing: border-box;
}
td.invite-name {
  text-align: center;
}
.invite-share, .invite-mint, .invite-edit {
  width: 100px;
  text-align: center;
}
.invite-limit {
  width: 50px;
  text-align: center;
}
</style>
