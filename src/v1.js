import Index from './Index.svelte'

const index = new Index({
  target: document.getElementById('index'),
  props: {
    version: "v1"
  }
})

export default index
