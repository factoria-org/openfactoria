import localforage from 'https://esm.run/localforage';
export const getDB = (name) => {
  return localforage.createInstance({
    name,
  });
}
export const removeFromDB = async (name, key) => {
  console.log("remove", name, key)
  const db = getDB(name)
  await db.removeItem(key)
}
export const refreshDB = async (name) => {
  const db = getDB(name)
  let items = []
  await db.iterate(function(val, key, i) {
    console.log(val, key)
    items.push({
      name: key,
      cid: val
    })
  })
  console.log(name, "items", items)
  return items
}
