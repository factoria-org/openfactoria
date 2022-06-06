<script>
import localforage from 'https://esm.run/localforage';
import { NFTStorage } from 'https://cdn.jsdelivr.net/npm/nft.storage/dist/bundle.esm.min.js'
import FolderBrowser from "./FolderBrowser.svelte"
import { fileFolders, metadataFolders } from './store.js';
import { getDB, refreshDB } from './db.js';
let files = []
let uploading = false;
let name;
let type;
let formStyle = "hidden"
const upload = async () => {
  if (type && name && name.length > 0) {
    let db = getDB(type)
    let n = await db.getItem(name)
    if (n) {
      alert("folder name already exists")
    } else {

      let apidb = getDB("api_key")
      let key = await apidb.getItem("key")
      if (!key) {
        alert("NFT.STORAGE api key needed. Go to the config page and set it first")
        location.href = "/config/"
      }

      uploading = true
      const token = key;

      const storage = new NFTStorage({ token })
      console.log("files", files)

      const cid = await storage.storeDirectory(files)
      console.log("cid", cid)
      const status = await storage.status(cid)
      console.log("status", status)
      uploading = false

      await db.setItem(name, cid)
      name = ""

      let _fileFolders = await refreshDB("file")
      $fileFolders = _fileFolders

      let _metadataFolders = await refreshDB("metadata")
      $metadataFolders = _metadataFolders
      formStyle = "hidden"
    }
  } else {
    alert("the folder name and type should not be empty")
  }
}
const close = () => {
  formStyle = "hidden"
}
const show = () => {
  formStyle = ""
}
</script>
{#if formStyle === "hidden"}
  <div class='top'>
    <button on:click={show}>Upload</button>
  </div>
{/if}
<form on:submit|preventDefault|stopPropagation={upload} class='form {formStyle}'>
  <div class='item'>
    <label class='name'>Folder type</label>
    <div class='folder-type'>
      <div>
        <input type="radio" bind:group={type} name="type" value={"metadata"}>
        <label class='inline' for="type">metadata</label>
      </div>
      <div>
        <input type="radio" bind:group={type} name="type" value={"file"}>
        <label for="type" class='inline'>file</label>
      </div>
    </div>
  </div>
  <div class='item'>
    <label class='name'>Folder name</label>
    <input type='text' bind:value={name} placeholder="save the folder as (only stored locally in your browser)">
  </div>
  <div class='item'>
    <label class='name'>Select a folder</label>
    <input type="file" webkitdirectory multiple bind:files={files} />
  </div>
  <div class='item'>
    <input type="submit" value="Save" />
    {#if formStyle === ""}
      <button on:click={close}>Close</button>
    {/if}
  </div>
</form>
{#if uploading}
  <div class='loading'><i class="fa-solid fa-circle-notch fa-spin"></i><br>uploading to IPFS...</div>
{/if}
<FolderBrowser />
<style>
.form .item label {
  color: rgba(255,255,255,0.8);
}
.form {
  margin: 0 0 40px;
}
label.inline {
  display: inline-block;
}
.folder-type {
  padding: 10px;
  background: rgba(0,0,0,0.1);
  margin: 5px 0 0;
}
</style>
