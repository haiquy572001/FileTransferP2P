<template>
  <div class="w3-row-padding connect-main">
    <div class="w3-card w3-round w3-white">
      <div class="w3-container w3-padding">
        <!--h6 class="w3-opacity">Parent Id :</h6>
                  <p contenteditable="true" class="w3-border w3-padding">216</p-->
        <div v-if="connect.conIce == undefined">
          <p>
            <label><b>Id Connect</b></label>
            <input
              class="w3-input w3-border w3-theme-l5"
              name="first"
              type="text"
              v-model="idConnect"
            />
          </p>
          <p>
            <label><b>Message</b></label>
            <input
              class="w3-input w3-border w3-theme-l5"
              name="last"
              type="text"
            />
          </p>
          <p>
            <button
              type="button"
              class="w3-button w3-theme"
              @click="createOffer()"
            >
              <i class="fa fa-code-fork"></i> Connect
            </button>
          </p>
        </div>
        <div v-else>
          <h5>
            Partner ID : <b>{{ current_connect.idConnect }}</b>
          </h5>
          <h5>
            Status :
            <b style="color: #4caf50">{{
              connect.stateConnect.toUpperCase()
            }}</b>
          </h5>
          <p>
            <button
              type="button"
              class="w3-button w3-theme"
              @click="closeConnect()"
            >
              <i class="fa fa-times"></i> Close Connect
            </button>
          </p>
          <br />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
export default {
  props: ["connect"],
  data() {
    return {
      idConnect: null,
    };
  },
  computed: {
    ...mapGetters({
      current_connect: "get_current_connect",
      list_connect: "get_list_connect",
      id_socket: "get_id_socket",
    }),
  },
  methods: {
    ...mapActions([
      "set_connect", 
      "close_connect",
      "add_list_connect",
      "set_current_connect"
    ]),

    async createOffer() {
      if (this.idConnect == null || "") {
        alert("id must not be null !!!");
        return;
      } else {
        this.$emit("createOffer", this.idConnect);
      }
    },

    closeConnect() {
      let index = this.list_connect.indexOf(this.connect);

      this.connect.conIce.close();

      this.close_connect(index);

      if (this.list_connect.length == 0) {
        let dataConnect = {
          id: this.list_connect.length,
          idConnect: null,
          conIce: null,
          channel: null,
          stateConnect: null,
        };
        this.add_list_connect(dataConnect);
      }
      this.set_current_connect(this.list_connect[0]);
    },
  },
};
</script>

<style>
.connect-main {
  margin-bottom: 8px;
}
</style>