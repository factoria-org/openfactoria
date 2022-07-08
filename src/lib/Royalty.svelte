<script>
export let contract;
export let chainId;
export let web3;
export let role;
import { handleError } from './errors.js'
import { createEventDispatcher } from 'svelte';
import { royalty, factory } from './factory.js';
const dispatch = createEventDispatcher();
let royaltyContract
let factoryContract
let receiver;
let amount;
let creatingConnection;
let settingRoyalty;
let percentage;
let editing;
let f0 = new F0();
let r = {
  receiver: "",
  amount: 0,
  permanent: false
}
let royaltyConnect;
royalty(web3, "v2").then((r) => {
  royaltyContract = r
})
factory(web3, "v2").then((t) => {
  factoryContract = t
})
const init = async () => {
  await f0.init({
    web3,
    contract,
  })
  royaltyConnect = await f0.api.royalty().call()
  if (royaltyConnect !== "0x0000000000000000000000000000000000000000") {
    r = await royaltyContract.methods.royalty(contract).call()
  }
}
const setRoyalty = async () => {
  let accounts = await window.ethereum.send('eth_requestAccounts');
  let account = accounts.result[0]

  console.log("R", r)

  // Set the royalty on Royalty contract
  settingRoyalty = true;
  let tx = await royaltyContract.methods.set(contract, r).send({ from: account })
  console.log("set ro tx", tx)
  settingRoyalty = false;


  // if the royalty connection does not exist, create the connection with factoria
  if (royaltyConnect === "0x0000000000000000000000000000000000000000") {
    creatingConnection = true;
    console.log("royalty address", royaltyContract, royaltyContract._address)
    let tx = await f0.api.setRoyalty(royaltyContract._address).send({
      from: account
    })
    console.log("connect to factoria tx", tx)
    creatingConnection = false;
  }
  await init()
}
const edit = () => {
  editing = true
}
$: {
  percentage = r.amount / 10000
}
init()
</script>
<div class='royalty {role}'>
  <h2>Royalty</h2>
  <div class='head'>
    <button on:click={edit}>edit</button>
  </div>
  {#if editing}
    <div class='form'>
      <form on:submit|preventDefault|stopPropagation={setRoyalty} class="form">
        <div class='item'>
          <div class='name'>receiver</div>
          <div class='val'>
            <input type='text' placeholder='enter the royalty receiver address' bind:value={r.receiver}>
          </div>
        </div>
        <div class='item'>
          <div class='name'>amount</div>
          <div class='val'>
            <input type='text' placeholder='enter the royalty amount out of 1000000' bind:value={r.amount}>
            <div class='annotation'>{percentage}%</div>
          </div>
        </div>
        <div class='item'>
          <div class='name'>permanent</div>
          <div class='val'>
            <input type='checkbox' bind:checked={r.permanent}>
            <label for='permanent'>make permanent</label>
          </div>
        </div>
        <div class='item'>
          {#if creatingConnection}
            <div class='loading'><i class="fa-solid fa-circle-notch fa-spin"></i><br>connecting the royalty contract with factoria...</div>
          {:else if settingRoyalty}
            <div class='loading'><i class="fa-solid fa-circle-notch fa-spin"></i><br>setting the royalty information...</div>
          {:else}
            <div class='name'></div>
            <div class='val'>
              <input type='submit' value='save to the blockchain'>
            </div>
          {/if}
        </div>
      </form>
    </div>
  {:else}
    <div class='form'>
      <div class='item'>
        <div class='name'>receiver</div>
        <div class='val'>
          <input disabled type='text' placeholder='enter the royalty receiver address' bind:value={r.receiver}>
        </div>
      </div>
      <div class='item'>
        <div class='name'>amount</div>
        <div class='val'>
          <input disabled type='text' placeholder='enter the royalty amount out of 1000000' bind:value={r.amount}>
          <div class='annotation'>{percentage}%</div>
        </div>
      </div>
      <div class='item'>
        <div class='name'>permanent</div>
        <div class='val'>
          <label for='permanent'>{r.permanent}</label>
        </div>
      </div>
    </div>
  {/if}
</div>
<style>
.head {
  margin: 10px 5px;
}
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
  margin-bottom: 10px;
}
.item {
  padding: 10px 0;
  border: none;
}
.loading {
  width: 100%;
}
label {
  display: inline-block;
}
.annotation {
  padding: 10px 5px;
  font-size: 12px;
  text-transform: uppercase;
}
</style>
