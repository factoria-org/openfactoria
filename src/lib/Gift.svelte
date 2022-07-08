<script>
import { uploadInvite } from './inviteuploader.js';
import { handleError } from './errors.js'
import { createEventDispatcher } from 'svelte';
import MintTable from './MintTable.svelte';
export let invites = {}
export let contract;
//export let f0;
export let web3;
export let netPrefix;
export let role;
let gifting;
let count
let receiver
let giftTx;
const dispatch = createEventDispatcher();
const f0 = new F0()
const init = async () => {
  await f0.init({
    web3,
    contract,
  })
}
const gift = async () => {
  gifting = true;
  giftTx = await f0.api.gift(receiver, count).send({
    from: f0.account
  })
  receiver = ""
  count = 0
  gifting = false;
}
init()
</script>
<div class='gift {role}'>
  <h2>Gift</h2>
  {#if gifting}
    <div class='loading'><i class="fa-solid fa-circle-notch fa-spin"></i><br>gifting NFTs...</div>
  {:else}
    <form on:submit|preventDefault|stopPropagation={gift} class="form">
      <div class='item'>
        <div class='name'>receiver address</div>
        <div class='val'>
          <input type='text' placeholder="receiver address" bind:value={receiver}/>
        </div>
      </div>
      <div class='item'>
        <div class='name'>count</div>
        <div class='val'>
          <input type='number' placeholder="how many tokens to gift" bind:value={count}/>
        </div>
      </div>
      <div class='item'>
        <div class='name'></div>
        <div class='val'>
          <input type='submit' value="Gift" />
        </div>
      </div>
    </form>
  {/if}
  {#if giftTx}
    <MintTable tx={giftTx} web3={web3} contract={contract} />
  {/if}
</div>
<style>
button, input[type=submit] {
  margin-top: 10px;
}
.item .name {
  text-align: left;
  color: rgba(255,255,255,0.9);
  padding: 0;
  margin-bottom: 10px;
}
.item {
  padding: 10px 0;
  border: none;
}
.loading {
  width: 100%;
}
</style>
