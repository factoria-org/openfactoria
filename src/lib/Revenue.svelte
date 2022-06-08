<script>
export let contract;
//export let f0;
export let web3
export let role;
import { handleError } from './errors.js'
import { createEventDispatcher } from 'svelte';
let balance;
let balanceEth;
let shownSetWithdrawer;
let withdrawing;
let settingWithdrawer;
let withdrawer = {
  account: "",
  permanent: false,
};

const dispatch = createEventDispatcher();
const withdraw = async () => {
  try {
    withdrawing = true;
    let tx = await f0.api.withdraw().send()
  } catch (e) {
    dispatch("error", {
      error: handleError(e.message)
    })
  }
  withdrawing = false;
  await init()
}
const showSetWithdrawer = () => {
  shownSetWithdrawer = true;
}
const setWithdrawer = async () => {
  try {
    settingWithdrawer = true;
    console.log("settingWithdrawer", settingWithdrawer)
    let tx = await f0.api.setWithdrawer(withdrawer).send()
  } catch (e) {
    dispatch("error", {
      error: handleError(e.message)
    })
  }
  settingWithdrawer = false;
  await init()
}
const render = async () => {
  let _balance = await f0.web3.eth.getBalance(contract)
  console.log("_balance", _balance)
  balance = _balance
  balanceEth = balance / 10 ** 18
  console.log("f0.api", f0.api)
  let _withdrawer = await f0.api.withdrawer().call()
  console.log("withdd", _withdrawer)
  withdrawer = _withdrawer;
}
const f0 = new F0()
const init = async () => {
  await f0.init({
    web3,
    contract,
  })
  await render()
}
init()
</script>
<div class='revenue {role}'>
  <h2>Revenue</h2>
  <div>
    <form on:submit|preventDefault|stopPropagation={withdraw} class="form">
      <div class='item'>
        <div class='name'>withdraw</div>
        <div class='val'>
          <div class='faded'>Balance</div>
          <div class='annotation'>{balanceEth} ETH ({balance} wei)</div>
          {#if withdrawing}
            <div class='loading'><i class="fa-solid fa-circle-notch fa-spin"></i><br>withdrawing...</div>
          {:else}
            <input class='display' type='submit' value='withdraw'>
          {/if}
        </div>
      </div>
    </form>
  </div>
  <div>
    <form on:submit|preventDefault|stopPropagation={setWithdrawer} class="form">
      <div class='item'>
        <div class='name'>set withdrawer</div>
        <div class='val'>
          <div class='faded'>Current withdrawer</div>
          <div class='annotation'>account: {withdrawer.account}</div>
          <div class='annotation'>permanent: {withdrawer.permanent}</div>
          {#if shownSetWithdrawer}
            <br>
            <input type='text' placeholder='enter the withdrawer address' bind:value={withdrawer.account}>
            <div class='annotation'>
              <input name='permanent' type='checkbox' bind:checked={withdrawer.permanent}>
              <label for='permanent'>permanent (can't change forever)</label>
            </div>
            {#if settingWithdrawer}
              <div class='loading'><i class="fa-solid fa-circle-notch fa-spin"></i><br>setting the withdrawer...</div>
            {:else}
              <input type='submit' value='save to the blockchain'>
            {/if}
          {:else}
            <button on:click={showSetWithdrawer}>Set withdrawer</button>
          {/if}
        </div>
      </div>
    </form>
  </div>
  <div>
    <div class='form'>
      <div class='item'>
        <div class='name'>Revenue split</div>
        <div class='val'>
          <div class='faded'>Moneypipe</div>
          <div class='annotation'>Auto-split mint revenue among multiple people using moneypipe:</div>
          <a target="_blank" class='btn display' href="https://moneypipe.xyz">Create a revenue split on Moneypipe</a>
        </div>
      </div>
    </div>
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
  padding: 5px 0px;
  font-size: 12px;
  text-transform: uppercase;
}
</style>
