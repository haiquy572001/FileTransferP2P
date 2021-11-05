<template>
    <div class="w3-card w3-round w3-white w3-center notification-main">
        <div class="w3-container">
          <p>Request Connect</p>
          <img
            src="~/assets/w3images/avatar6.png"
            alt="Avatar"
            style="width: 20%"
          /><br />
          <span>Person ID : {{notification.idConnect}} want to connect</span>
          <div class="w3-row w3-opacity">
            <div class="w3-half">
              <button
                class="w3-button w3-block w3-green w3-section"
                title="Accept"
                @click="accept()"
              >
                <i class="fa fa-check"></i>
              </button>
            </div>
            <div class="w3-half">
              <button
                class="w3-button w3-block w3-red w3-section"
                title="Decline"
                @click="denied()"
              >
                <i class="fa fa-remove"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
</template>

<script>
export default {
    props:["index","notification"],
    methods:{
      accept(){
        this.$emit("answerNotification",true,this.index,this.notification);
      },

      denied(){
        this.$emit("answerNotification",false,this.index,this.notification);
      }
    }
}
</script>

<style>
.notification-main {
  margin-bottom: 8px;
}
</style>