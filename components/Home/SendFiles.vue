<template>
  <div class="w3-row-padding">
    <div class="w3-card w3-round w3-white">
      <div class="w3-container w3-padding">
        <h4>Upload Files</h4>

        <div class="w3-container w3-border w3-theme-l5 w3-padding-16">
          <FormulateInput
            type="file"
            name="file"
            label="Drag and drop files"
            :id="'fileInputHover' + index"
          />
        </div>
        <br />
        <p class="w3-left">Total size: 120.4 Kb</p>
        <p class="w3-right">
          <label>Send to all</label>
          <input type="checkbox" class="" />
        </p>

        <div>
          <button
            type="button"
            class="w3-button w3-theme-d1 w3-margin-bottom w3-block"
            @click="sendFiles"
          >
            <i class="fa fa-paper-plane"></i> Send
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["connect", "index"],
  mounted() {
    let inputFile = document.getElementById("fileInputHover" + this.index);
    inputFile.addEventListener("change", () => {
      this.size = inputFile.files[0].size/1024;
    });
  },
  data() {
    return {
      filesData: null,
      size: 0,
    };
  },

  methods: {
    sendFiles() {
      if(this.connect.conIce == undefined){
        alert("You must connect first");
        return;
      }
      let fileInput = document.getElementById("fileInputHover" + this.index);
      const files = fileInput.files;
      console.log(files);

      let file = files[0];
      if(file == undefined){
        alert("Select file to send");
        return;
      }
      let initMessage = {
        type: "InitMessage",
        name: file.name,
        size: file.size,
      };
      //this.currentConnect.channel.send(JSON.stringify(initMessage));
      this.connect.channel.send(JSON.stringify(initMessage));
      const chunkSize = 16384;
      let fileReader = new FileReader();
      let offset = 0;
      fileReader.addEventListener("load", (e) => {
        console.log("FileRead.onload ", e);
        this.connect.channel.send(e.target.result);
        offset += e.target.result.byteLength;
        if (offset < file.size) {
          readSlice(offset);
        }
      });
      const readSlice = (o) => {
        console.log("readSlice ", o);
        const slice = file.slice(offset, o + chunkSize);
        fileReader.readAsArrayBuffer(slice);
      };
      readSlice(0);
    },
  },
};
</script>