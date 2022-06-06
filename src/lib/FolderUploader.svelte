<script>
import localforage from 'https://esm.run/localforage';
import { NFTStorage } from 'https://cdn.jsdelivr.net/npm/nft.storage/dist/bundle.esm.min.js'
import FolderBrowser from "./FolderBrowser.svelte"
import { fileFolders, metadataFolders } from './store.js';
import { getDB, refreshDB } from './db.js';
let files = []
let metafiles = []
let generatingMeta;
let generatingMetaCounter;
let manualShown;
let uploading = false;
let name;
let type;
let formStyle = "hidden"
let metaFolderName;
let manualSaved;
let disabled = {
  upload: false,
  uploadMeta: false,
  generateMeta: false
}
let manual = {
  cid: ""
}
const upload = async (_type, _name, _files) => {
  if (_type && _name && _name.length > 0) {
    let db = getDB(_type)
    let n = await db.getItem(_name)
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

      const cid = await storage.storeDirectory(_files)
      console.log("cid", cid)
      const status = await storage.status(cid)
      console.log("status", status)
      uploading = false

      await db.setItem(_name, cid)
//      name = ""

      let _fileFolders = await refreshDB("file")
      $fileFolders = _fileFolders

      let _metadataFolders = await refreshDB("metadata")
      $metadataFolders = _metadataFolders
//      formStyle = "hidden"
    }
    disabled.upload = true
  } else {
    alert("the folder name and type should not be empty")
  }
}
const uploadMeta = async () => {
  await upload("metadata", metaFolderName, metafiles);
  disabled.uploadMeta = true
}
const generateMeta = async () => {
  generatingMeta = true;
  let m = []
  for(let i=0; i<files.length; i++) {
    generatingMetaCounter = i+1;
    let file = files[i]
    let arrayBuf = await file.arrayBuffer()
    console.log("arrayBuf", arrayBuf)
    let cid = await ipfsh.file(new Uint8Array(arrayBuf))
    let meta = {
      image: "ipfs://" + cid
    }
    let metafile = new File([JSON.stringify(meta)], `${i+1}.json`)
    m.push(metafile)
  }
  metafiles = m
  metaFolderName = name
  console.log("metafiles", metafiles)
  console.log("type", type)
  generatingMeta = false;
  disabled.generateMeta = true
}
//const close = () => {
//  formStyle = "hidden"
//}
const show = () => {
  formStyle = ""
}
const showManual = () => {
  manualShown = true;
}
const manualSave = async () => {
  if (type && name && name.length > 0 && manual.cid.length > 0) {
    let db = getDB(type)
    let n = await db.getItem(name)
    if (n) {
      alert("folder name already exists")
    } else {
      await db.setItem(name, manual.cid)
      let _fileFolders = await refreshDB("file")
      $fileFolders = _fileFolders
      let _metadataFolders = await refreshDB("metadata")
      $metadataFolders = _metadataFolders
    }
    manualSaved = true;
  } else {
    error = "The cid and the name should not be empty";
  }
}
</script>
{#if formStyle === "hidden"}
  <div class='top'>
    <button on:click={show}>+ Upload a folder</button>
  </div>
{/if}
<form on:submit|preventDefault|stopPropagation={() => { upload(type, name, files) }} class='form {formStyle}'>
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
  {#if type && name && name.length > 0}
    <div class='item'>
      <label class='name'>Select a folder</label>
      <input type="file" webkitdirectory multiple bind:files={files} />
      <div class='manual'>
        <div>or <span class='clickable' on:click={showManual}>save folder CIDs manually</span></div>
        {#if manualShown}
        <form on:submit|preventDefault|stopPropagation={manualSave}>
          <input type='text' placeholder="IPFS CID" bind:value={manual.cid}>
          {#if manualSaved}
            <div class='disabled btn'>Saved the folder</div>
          {:else}
            <input type='submit' value="Save"/>
          {/if}
        </form>
        {/if}
      </div>
    </div>
    <div class='item'>
      {#if files.length > 0}
        {#if disabled.upload}
          {#if type == "metadata"}
            <div class='disabled btn'>Uploaded metadata</div>
          {:else}
            <div class='disabled btn'>Uploaded files</div>
          {/if}
        {:else}
          {#if type == "metadata"}
            <input type="submit" value="Upload metadata to IPFS" />
          {:else}
            <input type="submit" value="Upload files to IPFS" />
          {/if}
        {/if}
      {/if}
      {#if type=="file" && files.length > 0}
        {#if generatingMeta}
          <div class='loading'><i class="fa-solid fa-circle-notch fa-spin"></i><br>generating metadata ({generatingMetaCounter}...</div>
        {:else}
          {#if metafiles.length > 0}
            {#if disabled.generateMeta}
              <div class='btn disabled'>Generated metadata</div>
            {/if}
            {#if disabled.uploadMeta}
              <div class='btn disabled'>Uploaded metadata</div>
            {:else}
              <button on:click|stopPropagation|preventDefault={uploadMeta}>Upload metadata to IPFS</button>
            {/if}
          {:else}
            <button on:click|stopPropagation|preventDefault={generateMeta}>Generate metadata</button>
          {/if}
        {/if}
      {/if}
    </div>
  {/if}
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
.btn.disabled {
  background: gray; 
}
.manual {
  padding: 10px 0;
}
.manual input, .manual .btn {
  margin-top: 10px;
}
.clickable {
  cursor: pointer;
  color: royalblue;
  display: inline-block;
}
</style>
