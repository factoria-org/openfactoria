<script>
import localforage from 'https://esm.run/localforage';
import { fileFolders, metadataFolders } from './store.js';
import { refreshDB } from './db.js';
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
    </div>
  {/each}
  </div>
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
    </div>
  {/each}
  </div>
{/if}
</div>
<style>
.tab {
  margin-bottom: 30px;
}
.tab h2 {
  padding: 0 20px; 
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
</style>
