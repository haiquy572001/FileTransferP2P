<template>
  <div class="w3-card w3-round w3-white w3-center receive-main">
    <div class="w3-container">
      <h4>Receive Files:</h4>
      <hr />
      <div v-for="file of files_receive" :key="file.id">
        <div class="w3-panel">
          <p class="w3-text-blue w3-left">
            <i class="fa fa-file-text-o" style="margin-right: 10px"></i
            ><a :href="file.received" :download="file.name" ><b class="fileName">{{file.name}}</b></a>
          </p>
        </div>
      </div>
      <br />
      <hr />
      <p>
        <button class="w3-button w3-block w3-theme-l4" @click="downloadAll">
          <i class="fa fa-download"></i>
          Download all
        </button>
      </p>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
export default {
  computed: {
    ...mapGetters({
      files_receive: "get_files_receive",
    }),
  },

  methods: {
    downloadAll() {
      console.log(this.files_receive);
    },
  },
};
</script>

<style>
.receive-main {
  margin-bottom: 8px;
}

.fileName{
 
}
</style>