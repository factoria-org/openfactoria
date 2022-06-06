<script>
import localforage from 'https://esm.run/localforage';
import { fileFolders, metadataFolders } from './store.js';
import { removeFromDB, refreshDB } from './db.js';
const rm = async (type, name) => {
  await removeFromDB(type, name)
  $metadataFolders = await refreshDB("metadata")
  $fileFolders = refreshDB("file")
}
$: {
  refreshDB("metadata").then((_metadatas) => {
    $metadataFolders = _metadatas
  })
  refreshDB("file").then((_files) => {
    $fileFolders = _files
  })
}
</script>
<div class='tab'>
<h2>Files</h2>
{#if $fileFolders.length > 0}
  <div class='info'>
  {#each $fileFolders as folder}
    <div class='item'>
      <a target="_blank" class='val' href="https://ipfs.io/ipfs/{folder.cid}">
        <h3>{folder.name}</h3>
        <div>{folder.cid}</div>
      </a>
      <button on:click={() => { rm("file", folder.name) }}><i class="fa-solid fa-trash-can"></i></button>
    </div>
  {/each}
  </div>
{:else}
  <div class='empty'>empty</div>
{/if}
</div>
<div class='tab'>
<h2>Metadata</h2>
{#if $metadataFolders.length > 0}
  <div class='info'>
  {#each $metadataFolders as folder}
    <div class='item'>
      <a target="_blank" class='val' href="https://ipfs.io/ipfs/{folder.cid}">
        <h3>{folder.name}</h3>
        <div>{folder.cid}</div>
      </a>
      <button on:click={() => { rm("metadata", folder.name) }}><i class="fa-solid fa-trash-can"></i></button>
    </div>
  {/each}
  </div>
{:else}
  <div class='empty'>empty</div>
{/if}
</div>
<style>
.tab {
  margin-bottom: 30px;
}
.tab h2 {
  color: white;
  padding: 0 10px; 
  border-left: 4px solid white;
}
.info {
  padding: 0;
}
.item {
  padding: 15px 20px;
}
.item .val {
  color: rgba(255,255,255,0.8);
}
.empty {
  padding: 20px;
  font-size: 12px;
  background: rgba(0,0,0,0.1);
  color: rgba(255,255,255,0.3);
  text-align: center;
  margin-top: 10px;
}
.item button {
  background: none;
  color: royalblue !important;
}
</style>
