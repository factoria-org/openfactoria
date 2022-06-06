import Index from './Index.svelte'

const index = new Index({
  target: document.getElementById('index'),
  props: {
    version: "v2"
  }
})

export default index
