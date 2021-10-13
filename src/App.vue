<template>
  <div>
    <div class="about-section">
      <h1>File Transfer P2P</h1>
      <p>Fast, convenient and private for sharing files to everybody</p>
    </div>
    <div clas="row">
      <div class="column">
        <div class="card" style="background-color: #96d4d4">
          <div class="container">
            <h2 class="name-app">My ID</h2>
            <hr />
            <h1 style="color: black">{{ idPerson }}</h1>
          </div>
        </div>
      </div>
      <div class="column">
        <div class="card" style="background-color: #ffc0c7">
          <div class="container">
            <h2 class="name-app">Connect to ID</h2>
            <input type="text" class="textInput" v-model="idConnect" />
            <p>
              <button class="button" @click="callConnect">Connect</button>
            </p>
          </div>
        </div>
      </div>
      <div class="column">
        <div class="card" style="background-color: #dfd9d8">
          <div class="container">
            <h2 class="name-app">Transfer</h2>
            <!--input type="text" class="textInput" v-model="sendMessage" /-->
            <input
              type="file"
              id="fileSend"
              style="color: black"
              @change="handleFileInputChange"
            />
            <p>
              <button @click="send" class="button">Send</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
let conWs = new WebSocket("ws://gammazeta.herokuapp.com/");

let channel = null;
const connection = new RTCPeerConnection({
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
});

export default {
  data() {
    return {
      idPerson: null,
      idConnect: null,
      icePerson: "",
      sendMessage: "",

      receiveBuffer: [],
      receiveMessage: null,
    };
  },

  mounted() {
    conWs.onmessage = (event) => {
      let result = JSON.parse(event.data);

      if (result.type == "INIT") {
        this.idPerson = result.id;
      }

      if (result.type == "OFFER") {
        console.log(result.idConnect);
        var checkConfirm = confirm(
          "Person id " + result.idConnect + " want to connect"
        );
        if (checkConfirm) {
          console.log("accept connect");

          const offer = JSON.parse(result.iceConnect);
          connection.setRemoteDescription(offer);

          connection.onicecandidate = (event) => {
            if (!event.candidate) {
              console.log("response success");
              console.log(JSON.stringify(connection.localDescription));

              this.icePerson = JSON.stringify(connection.localDescription);
              this.idConnect = result.idConnect;
              this.callApi("ACCEPT");
            }
          };
          const answer = connection.createAnswer();
          connection.setLocalDescription(answer);
        } else {
          console.log("denied");
        }
      }

      if (result.type == "ACCEPT") {
        const answer = JSON.parse(result.iceConnect);
        connection.setRemoteDescription(answer);
      }
    };

    connection.ondatachannel = (event) => {
      channel = event.channel;
      channel.onmessage = (event) => {
        try {
          if (JSON.parse(event.data)) {
            this.receiveMessage = JSON.parse(event.data);
            console.log("init message");
            console.log(this.receiveMessage);
            this.receiveMessage.sizeReceived = 0;
            return;
          }
        } catch {}

        if (this.receiveMessage.type == "InitMessage") {
          this.receiveBuffer.push(event.data);
          console.log(event.data.size);
          this.receiveMessage.sizeReceived += event.data.size;

          if (this.receiveMessage.sizeReceived == this.receiveMessage.size){
            const received = new Blob(this.receiveBuffer);
            //downloadAnchor.href = URL.createObjectURL(received);

            let downloadLink = document.createElement("a");

            downloadLink.download = this.receiveMessage.name;

            downloadLink.innerHTML = "Download File";
            downloadLink.href = URL.createObjectURL(received);
            downloadLink.style.display = "none";
            document.body.appendChild(downloadLink);

            downloadLink.click();
            downloadLink.remove();
            this.receiveBuffer = [];
          }
        }
        //receiveBuffer.push(event.data);

        //const received = new Blob(receiveBuffer);
        //downloadAnchor.href = URL.createObjectURL(received);
      };
    };
  },

  methods: {
    async callConnect() {
      channel = connection.createDataChannel("data");
      channel.onmessage = (event) => alert(event.data);
      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);
      connection.onicecandidate = (event) => {
        if (!event.candidate) {
          this.icePerson = JSON.stringify(connection.localDescription);
          this.callApi("OFFER");
        }
      };
    },

    async callApi(type) {
      await axios
        .post("https://gammazeta.herokuapp.com/", {
          idPerson: this.idPerson,
          icePerson: this.icePerson,
          idConnect: this.idConnect,
          type: type,
        })
        .then((res) => {
          console.log(res);
        })
        .catch((e) => {
          console.log(e);
        });
    },
    send() {
      //channel.send(this.sendMessage);
      //this.sendMessage = "";
      let fileInput = document.getElementById("fileSend");
      const file = fileInput.files[0];
      let initMessage = {
        type: "InitMessage",
        name: file.name,
        size: file.size,
      };
      channel.send(JSON.stringify(initMessage));

      const chunkSize = 16384;
      let fileReader = new FileReader();
      let offset = 0;
      fileReader.addEventListener("error", (error) =>
        console.error("Error reading file:", error)
      );
      fileReader.addEventListener("abort", (event) =>
        console.log("File reading aborted:", event)
      );
      fileReader.addEventListener("load", (e) => {
        console.log("FileRead.onload ", e);
        channel.send(e.target.result);
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

    async handleFileInputChange() {},
  },
};
</script>

<style>
body {
  font-family: Arial, Helvetica, sans-serif;
  margin: 0;
  background-color: #282a35;
  color: white;
}

html {
  box-sizing: border-box;
}

*,
*:before,
*:after {
  box-sizing: inherit;
}

.column {
  float: left;
  width: 33.33%;
  padding: 0 8px;
}

.card {
  margin: 0px 5px 20px 5px;
  border-radius: 10px;
  text-align: center;
  padding-bottom: 20px;
  height: 250px;
}

.textInput {
  width: 60%;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
}

.name-app {
  font-size: 40px;
  font-weight: 700;
  color: black;
}

.intro-app {
  font-weight: 400;
  font-size: 18px;
  color: #3a3a3a !important;
  height: 50px;
}

.about-section {
  padding: 50px;
  text-align: center;
  background-color: #04aa6d;
  color: #fff;
  margin-bottom: 40px;
}

.about-section h1 {
  font-size: 60px;
  font-weight: 700;
  color: white;
  background-color: #282a35;
  clear: both;
  display: inline-block;
  padding: 10px 25px 10px 25px;
}

.about-section p {
  font-size: 30px;
  font-weight: 400;
  margin: 5px;
}

.container {
  padding: 1px 16px;
}

.container::after,
.row::after {
  content: "";
  clear: both;
  display: table;
}

.title {
  color: grey;
}

.button {
  border: none;
  outline: 0;
  display: inline-block;
  padding: 8px;
  color: white;
  background-color: #282a35;
  text-align: center;
  cursor: pointer;
  width: 70%;
  font-size: 18px;
  border-radius: 25px;
  text-decoration: none;
}

.button:hover {
  background-color: black;
}
</style>
