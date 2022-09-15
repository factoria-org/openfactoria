<script>
export let contract;
export let chainId;
export let web3;
export let role;
import { handleError } from './errors.js'
import { createEventDispatcher } from 'svelte';
import { factory } from './factory.js';
const dispatch = createEventDispatcher();
let owner;
let settingOwnership;
let shownTransferOwnership;
let factoryContract;
const showTransferOwnership = () => {
  shownTransferOwnership = true;
}
const transferOwnership = async () => {
  try {
    settingOwnership = true;
    console.log("factoryContract", factoryContract)
    let tx = await factoryContract.methods.addCollection(owner, contract).send({
      from: f0.account
    })
    console.log("tx1", tx)
    tx = await f0.api.transferOwnership(owner).send()
    console.log("tx2", tx)
  } catch (e) {
    dispatch("error", {
      error: handleError(e.message)
    })
  }
  settingOwnership = false;
  await init()
}
let f0 = new F0();
const init = async () => {
  await f0.init({
    web3,
    contract,
  })
  owner = await f0.api.owner().call()
  factoryContract = await factory(web3, "v2")
}
init()
</script>
<div class='ownership {role}'>
  <h2>Ownership</h2>
  <div>
    <form on:submit|preventDefault|stopPropagation={transferOwnership} class="form">
      <div class='item'>
        <div class='name'>ownership</div>
        <div class='val'>
          <div class='faded'>Current owner</div>
          <div class='annotation'>{owner}</div>
          {#if shownTransferOwnership}
            <br>
            <input type='text' placeholder='enter the withdrawer address' bind:value={owner}>
            {#if settingOwnership}
              <div class='loading'><i class="fa-solid fa-circle-notch fa-spin"></i><br>setting the withdrawer...</div>
            {:else}
              <input type='submit' value='save to the blockchain'>
            {/if}
          {:else}
            <button on:click={showTransferOwnership}>Transfer ownership</button>
          {/if}
        </div>
      </div>
    </form>
  </div>
</div>
<style>
.faded {
  opacity: 0.4;
}
.form .item {
  align-items: baseline;
}
button, input[type=submit], .btn {
  margin-top: 5px;
}
.name {
  text-align: left;
}
.item {
  padding: 0;
  border: none;
}
.loading {
  width: 100%;
}
label {
  display: inline-block;
}
.annotation {
  padding: 5px 0px;
  font-size: 12px;
  text-transform: uppercase;
}
</style>
