<template>
  <div class="watingConnect">
    <h2>wating connect socket server ...</h2>
    <div class="loader"></div>
  </div>
</template>

<script>
export default {};
</script>

<style>
.watingConnect {
  text-align: center;
  margin-top: 50px;
}
.loader {
  border: 16px solid #f3f3f3;
  border-radius: 50%;
  border-top: 16px solid #3498db;
  width: 120px;
  height: 120px;
  -webkit-animation: spin 1.3s linear infinite; /* Safari */
  animation: spin 1.3s linear infinite;
  display: inline-block;
  clear: both;
}

/* Safari */
@-webkit-keyframes spin {
  0% {
    -webkit-transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>