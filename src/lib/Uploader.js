import { NFTStorage } from 'https://cdn.jsdelivr.net/npm/nft.storage/dist/bundle.esm.min.js'
import { getDB, } from './db.js';
export let uploadPlaceholder = async (file) => {
  let apidb = getDB("api_key")
  let key = await apidb.getItem("key")
  if (!key) {
    throw new Error()
  }
  let token = key
  const storage = new NFTStorage({ token })
  const cid = await storage.storeBlob(file)
  console.log("cid", cid)
  const str = JSON.stringify({
    image: "ipfs://" + cid
  })
  const bytes = new TextEncoder().encode(str);
  const blob = new Blob([bytes], { type: "application/json;charset=utf-8" });
  const metacid = await storage.storeBlob(blob)
  console.log("metacid", metacid)
  return metacid
}
