import { NFTStorage } from 'https://cdn.jsdelivr.net/npm/nft.storage/dist/bundle.esm.min.js'
import { getDB, } from './db.js';
export let uploadInvite = async (list, name) => {
  let apidb = getDB("api_key")
  let key = await apidb.getItem("key")
  if (!key) {
    let confirmed = confirm("NFT.STORAGE api key needed. Go to the config page and set it first")
    if (confirmed) {
      location.href = "/config/"
    }
  }
  let token = key
  const storage = new NFTStorage({ token })
  let L = {
    addresses: list
  }
  if (name) L.name = name
  const str = JSON.stringify(L)
  const bytes = new TextEncoder().encode(str);
  const blob = new Blob([bytes], { type: "application/json;charset=utf-8" });
  const cid = await storage.storeBlob(blob)
  return cid
}
