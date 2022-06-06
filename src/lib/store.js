import { writable } from 'svelte/store';
/*
let _items;
const apiURL = "https://jsonplaceholder.typicode.com/todos";
const f0 = new F0()
async function getData(){
  await f0.init({
    web3: new Web3(window.ethereum),
    contract: contract_address
  })
  let _name = await f0.api.name().call()
  let _symbol = await f0.api.symbol().call()
  items = [{
    name: "name",
    text: _name
  }, {
    name: "symbol",
    text: _symbol
  }]
  console.log("items", items)
}
getData();
export let items = writable(_items);
*/
export let fileFolders = writable([]);
export let metadataFolders = writable([]);
export let apikey = writable("")




