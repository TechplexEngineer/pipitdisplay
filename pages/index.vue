<template>
  <div class="container">

    <div class="row">
      <div class="col-md-6">Current Event: </div>
      <div class="col-md-6">Last Updated: </div>
    </div>



    <div>
      <logo />
      <h1 class="title">
        pipitdash
      </h1>
      <h2 class="subtitle">
        FRC Pit Display
      </h2>
      <div class="links">
        <a
          href="https://nuxtjs.org/"
          target="_blank"
          class="button--green"
        >
          Documentation
        </a>
        <a
          href="https://github.com/nuxt/nuxt.js"
          target="_blank"
          class="button--grey"
        >
          GitHub
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import Logo from '~/components/Logo.vue'

export default {
  components: {
    Logo
  }
}
</script>

<style>
html, body {
  background: #202020;
}
</style>
