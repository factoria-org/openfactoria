<script>
import localforage from 'https://esm.run/localforage';
import Nav from './lib/Nav.svelte'
let db = localforage.createInstance({ name: "api_key" })
let key = "";
let disabled = "";
db.getItem("key").then((_key) => {
  key = _key
})
const save = async () => {
  await db.setItem("key", key)
  disabled = "disabled"
}
</script>
<Nav config={"selected"} />
<div class='top'>
<form class='form' on:submit|preventDefault|stopPropagation={save}>
  <div class='item'>
    <label>NFT.STORAGE API KEY</label>
    <input type='text' placeholder="NFT.STORAGE key" bind:value={key}>
  </div>
  <div class='item'>
    {#if !disabled}
    <input {disabled} type='submit' value="save" />
    <br><br>
    <div class='description'>You can get a free API key at <a href="https://nft.storage">https://nft.storage</a></div>
    {/if}
  </div>
</form>
</div>
<style>
.description {
  padding: 10px 0;
  text-transform: lowercase;
}
.description a {
  color: royalblue;
  text-decoration: none;
}
.form {
  margin: 0;
  border: none;
  padding: 0;
}
</style>
