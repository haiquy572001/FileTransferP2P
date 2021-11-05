<template>
  <div class="w3-card w3-round w3-white myId-main">
    <div class="w3-container">
      <h4 class="w3-center">My Id :<b>{{id_socket}}</b></h4>
      <p class="w3-center">
        <img
          src="~/assets/w3images/avatar3.png"
          class="w3-circle"
          style="height: 106px; width: 106px"
          alt="Avatar"
        />
      </p>
      <hr />
      <p>
        <i class="fa fa-user-o fa-fw w3-margin-right w3-text-theme"></i>
        Login
      </p>
    </div>
  </div>
</template>

<script>
import {mapActions,mapGetters} from "vuex";
export default {
  computed:{
    ...mapGetters({
      id_socket:"get_id_socket"
    })
  }
};
</script>
<style>
.myId-main{
    margin-bottom:8px;
}
</style>