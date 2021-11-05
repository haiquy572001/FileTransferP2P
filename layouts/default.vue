<template>
  <div class="w3-theme-l5">
    <Top />
    <div
      class="w3-container w3-content"
      style="max-width: 1400px; padding-top: 80px; min-height: 97vh"
    >
      <div v-if="id_socket != null"><Nuxt /></div>
      <div v-else>
        <Loading />
      </div>
    </div>
    <br />
  </div>
</template>

<script>
import Top from "../components/Top.vue";
import { mapGetters, mapActions } from "vuex";
import Loading from "../components/Loading.vue";
export default {
  components: { Top, Loading },
  computed: {
    ...mapGetters({
      id_socket: "get_id_socket",
      con_socket: "get_con_socket",
      messages_socket: "get_messages_socket",
      list_connect: "get_list_connect",
    }),
  },
  watch: {
    messages_socket: function () {
      switch (this.messages_socket.type) {
        case "INIT":
          this.set_id_socket(this.messages_socket.id);
          let dataConnect = {
            id: 0,
            idConnect: null,
            conIce: null,
            channel: null,
            stateConnect: null,
          };
          this.add_list_connect(dataConnect);
          this.set_current_connect(dataConnect);
          break;
        case "OFFER":
          break;
        case "ACCEPT":
          break;
      }
    },
  },
  created() {
    this.connectSocket();
  },

  methods: {
    ...mapActions([
      "set_id_socket",
      "set_con_socket",
      "set_messages_socket",
      "add_list_connect",
      "set_current_connect",
    ]),
    connectSocket() {
      let urlSocket = "wss://file-sharing-gz-api.herokuapp.com";
      let conSocket = new WebSocket(urlSocket);
      this.set_con_socket(conSocket);

      conSocket.onmessage = (event) => {
        let result = JSON.parse(event.data);
        console.log("hava message socket");
        console.log(result);
        this.set_messages_socket(result);
      };
    },
  },
};
</script>

<style>
html,
body,
h1,
h2,
h3,
h4,
h5 {
  font-family: "Open Sans", sans-serif;
}
</style>