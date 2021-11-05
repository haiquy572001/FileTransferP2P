<template>
  <div class="w3-card w3-round w3-white w3-hide-small">
    <div class="w3-container">
      <p>List Connects</p>
      <p v-for="connect of list_connect" :key="connect.id">
        <button
          class="tabConnect"
          :class="{ tabConnectActive: connect == current_connect }"
          @click="detailConnect(connect)"
        >
          <i class="fa fa-circle-o-notch fa-fw w3-margin-right"></i>
          <b v-if="connect.idConnect != null"
            >Partner: {{ connect.idConnect }}</b
          >
          <b v-else>New Connect</b>
        </button>
      </p>
      <button
        class="w3-button w3-tiny w3-theme-d1 w3-margin-bottom"
        @click="newConnect()"
      >
        <i class="fa fa-plus fa-fw fa-1x"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
export default {
  computed: {
    ...mapGetters({
      list_connect: "get_list_connect",
      current_connect: "get_current_connect",
    }),
  },
  methods: {
    ...mapActions(["add_list_connect", "set_current_connect"]),
    newConnect() {
      let dataConnect = {
        id: this.list_connect.length,
        idConnect: null,
        conIce: null,
        channel: null,
        stateConnect: null,
      };
      this.add_list_connect(dataConnect);
    },

    detailConnect(connect) {
      this.set_current_connect(connect);
    },
  },
};
</script>

<style>
.tabConnectActive {
  background-color: #607d8b;
  color:white;
}
.tabConnect {
  border: 1px solid #ccc !important;
  display: block;
  width: 100%;
  text-align: left !important;
  padding: 8px 16px;
  overflow: hidden;
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
}
</style>