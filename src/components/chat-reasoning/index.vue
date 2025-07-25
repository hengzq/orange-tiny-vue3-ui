<template>
  <div class="chat-reasoning">
    <div class="dots">
      <div></div>
      <div></div>
      <div></div>
    </div>
  </div>
</template>
<script setup lang="ts">
</script>

<style lang="less" scoped>
.chat-reasoning {
  .dots {
    width: 1.2em;
    height: 2.2em;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .dots div {
    width: 0.2em;
    height: 0.2em;
    border-radius: 50%;
    background-color: black;
    animation: fade 0.8s ease-in-out infinite;
  }

  .dots div:nth-of-type(1) {
    animation-delay: -0.4s;
  }

  .dots div:nth-of-type(2) {
    animation-delay: -0.2s;
  }

  @keyframes fade {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
}
</style>