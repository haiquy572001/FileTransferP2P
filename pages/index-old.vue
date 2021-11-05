<template>
  <div class="main">
    <div v-if="idSocket != null">
      <div class="header">
        <b>File Sharing P2P</b>
        <div class="header-right">
          <input type="text" class="header-search" placeholder="Search" />
          <div class="header-sign">Sign In</div>
        </div>
      </div>
      <div class="topnav">
        <a class="active">Home</a>
        <a>Connection</a>
        <a>About</a>
        <a>Help</a>
      </div>
      <div class="row">
        <div class="column1">
          <div class="tabContent">
            <div class="myId">
              <div class="myIdLabel"># My id : {{ idSocket }}</div>
              <button class="btn" @click="newConnect()">New Connect</button>
            </div>
            <div v-for="connect in listConnects" :key="connect.id">
              <div
                class="tab"
                @click="detailConnect(connect)"
                :class="{ tabActive: connect == currentConnect }"
              >
                <div v-if="connect.idConnect != null">
                  Partner id : {{ connect.idConnect }}
                </div>
                <div v-else>New Connect</div>
              </div>
            </div>
          </div>
        </div>
        <div class="column2">
          <div class="column2Contain">
            <div class="connectContain">
              <div
                class="highLeft"
                v-if="
                  currentConnect.idConnect == null ||
                  currentConnect.idConnect == undefined
                "
              >
                <h2 style="color: #505050">Partner ID</h2>
                <div>
                  <input
                    type="text"
                    class="connectIdInput"
                    v-model="currentConnect.idConnectHover"
                  />
                  <button class="btnConnect" @click="createOffer">
                    <img src="~/assets/connect-white.svg" style="width: 19px" />
                    Connect
                  </button>
                </div>
              </div>
              <div v-else class="highLeft">
                <h2 style="color: #505050">
                  Partner ID : {{ currentConnect.idConnect }}
                </h2>
                <h2 style="color: #505050">
                  State :
                  <div
                    v-if="currentConnect.stateConnect == 'waiting'"
                    class="stateWaiting"
                  ></div>
                  <div
                    v-if="currentConnect.stateConnect == 'connected'"
                    class="stateConnected"
                  ></div>
                  <div
                    v-if="
                      currentConnect.stateConnect == 'disconnected' ||
                      currentConnect.stateConnect == 'failed'
                    "
                    class="stateDisconnected"
                  ></div>
                  <div class="stateConnect">
                    {{ currentConnect.stateConnect.toUpperCase() }}
                  </div>
                </h2>

                <button class="btn" @click="closeConnect()">
                  Close Connect
                </button>
              </div>
            </div>

            <div class="filesContainer">
              <div class="rowFile">
                <div class="columnFile">
                  <div class="highLeft">
                    <h2 style="color: #505050">Upload Files</h2>

                    <FormulateInput
                      type="file"
                      name="file"
                      label="Select your files to upload"
                      help="Select one or more files to upload"
                      id="fileData"
                      multiple
                    />
                    <button class="btn" @click="sendFile()">Send Files</button>
                  </div>
                </div>
                <div class="columnFile">
                  <div class="highLeft">
                    <h2 style="color: #505050">Receive Files</h2>
                    <div id="filesBox">
                      <!-- For file link download -->
                    </div>
                    <div id="myProgress">
                      <div id="myBar"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="watingConnect">
      <h2>wating connect socket server ...</h2>
      <div class="loader"></div>
    </div>
  </div>
</template>

<script>
import "@/static/assets/css/formulate.css";

export default {
  data() {
    return {
      idSocket: null,
      listConnects: [],
      currentConnect: {
        id: null,
        idConnect: null,
        idConnectHover: null,
        conIce: null,
        channel: null,
        stateConnect: null,
      },

      receiveBuffer: [],
      receiveMessage: null,
    };
  },
  async mounted() {
    //let urlSocket = "ws://localhost:5000";
    let urlSocket = "wss://file-sharing-gz-api.herokuapp.com";
    let conSocket = new WebSocket(urlSocket);
    console.log(conSocket);
    conSocket.onmessage = (event) => {
      let result = JSON.parse(event.data);
      console.log("hava message socket");
      console.log(result);
      switch (result.type) {
        case "INIT":
          this.idSocket = result.id;
          this.newConnect(null, true);
          break;
        case "OFFER":
          this.$dialog
            .confirm("Person id " + result.idConnect + " want to connect")
            .then(() => {
              let data = {
                iceConnect: result.iceConnect,
                idConnect: result.idConnect,
              };

              this.acceptOffer(data);
            })
            .catch(function () {
              console.log("denied");
            });
          break;
        case "ACCEPT":
          let data = {
            iceConnect: result.iceConnect,
            idConnect: result.idConnect,
          };
          this.acceptAnswer(data);
          break;
      }
    };
  },

  methods: {
    newConnect(idConnect, show) {
      let dataConnect = {
        id: this.listConnects.length,
        idConnect: idConnect,
        idConnectHover: null,
        conIce: null,
        channel: null,
        stateConnect: null,
      };

      this.listConnects.push(dataConnect);
      if (show) {
        this.detailConnect(dataConnect);
      }
    },

    detailConnect(connect) {
      this.currentConnect = connect;
      console.log(this.currentConnect.idConnect);
    },

    closeConnect() {
      let index = this.listConnects.indexOf(this.currentConnect);
      //this.listConnects.splice(index,1);
      console.log(this.listConnects[index].conIce);
      this.listConnects[index].conIce.close();
      this.listConnects.splice(index, 1);
      if (this.listConnects.length == 0) {
        this.newConnect();
      }
      this.currentConnect = this.listConnects[0];
    },

    //send data
    async sendFile() {
      if (this.currentConnect.channel == null) {
        alert("you must connect first !!!");
        return;
      }
      let fileInput = document.getElementById("fileData");
      const files = fileInput.files;
      let file = files[0];

      let initMessage = {
        type: "InitMessage",
        name: file.name,
        size: file.size,
      };
      this.currentConnect.channel.send(JSON.stringify(initMessage));

      const chunkSize = 16384;
      let fileReader = new FileReader();
      let offset = 0;
      fileReader.addEventListener("load", (e) => {
        console.log("FileRead.onload ", e);
        this.currentConnect.channel.send(e.target.result);
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

    //connect ice server
    async connectIce(idConnect) {
      const connection = await new RTCPeerConnection({
        iceServers: [
          {
            urls: "stun:stun.l.google.com:19302",

            username:
              "NpTr9aqoQ6UVh4Wcl8Gjd5MvQ-TD9MqDa8mF1QiwkszzQ7TacNocWcUYnzIqKOb0AAAAAGFsbAxnYW1tYXpldGE=",
            urls: [
              "stun:hk-turn1.xirsys.com",
              "turn:hk-turn1.xirsys.com:80?transport=udp",
              "turn:hk-turn1.xirsys.com:3478?transport=udp",
              "turn:hk-turn1.xirsys.com:80?transport=tcp",
              "turn:hk-turn1.xirsys.com:3478?transport=tcp",
              "turns:hk-turn1.xirsys.com:443?transport=tcp",
              "turns:hk-turn1.xirsys.com:5349?transport=tcp"
            ],
            credential: "7885ae4a-2f78-11ec-aa20-0242ac120004",
          },
        ],
      });

      //receive data
      let channel = await connection.createDataChannel("data");
      connection.ondatachannel = (event) => {
        channel = event.channel;
        channel.onmessage = (event) => {
          try {
            if (JSON.parse(event.data)) {
              this.receiveMessage = JSON.parse(event.data);
              this.receiveMessage.sizeReceived = 0;
              return;
            }
          } catch {}

          var elem = document.getElementById("myBar");
          if (this.receiveMessage.type == "InitMessage") {
            let blob = new Blob([event.data]);

            this.receiveBuffer.push(blob);
            this.receiveMessage.sizeReceived += blob.size;

            elem.style.width =
              (this.receiveMessage.sizeReceived * 100) /
                this.receiveMessage.size +
              "%";
            if (this.receiveMessage.sizeReceived == this.receiveMessage.size) {
              const received = new Blob(this.receiveBuffer);

              let downloadLink = document.createElement("a");

              downloadLink.download = this.receiveMessage.name;

              downloadLink.innerHTML = this.receiveMessage.name;
              downloadLink.href = URL.createObjectURL(received);
              downloadLink.className = "linkDownload";
              document.getElementById("filesBox").appendChild(downloadLink);
              this.receiveBuffer = [];
              elem.style.width = "1%";
            }
          }
        };
      };

      //append connect show
      let index;
      if (idConnect == null) {
        index = this.listConnects.indexOf(this.currentConnect);
        console.log("index===================>" + index);
        this.listConnects[index].conIce = connection;
        this.listConnects[index].idConnect = this.currentConnect.idConnectHover;
        this.listConnects[index].channel = channel;
      } else {
        this.newConnect(idConnect, true);
        index = this.listConnects.length - 1;
        this.listConnects[index].conIce = connection;
        this.listConnects[index].channel = channel;
      }

      this.listConnects[index].stateConnect = "waiting";
      connection.oniceconnectionstatechange = (event) => {
        
        this.listConnects[index].stateConnect = connection.iceConnectionState;
      };

      return connection;
    },

    //create offer
    async createOffer() {
      if (this.currentConnect.idConnectHover == null || "") {
        alert("id must not be null !!!");
        return;
      }
      const connection = await this.connectIce();

      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);

      connection.onicecandidate = async (event) => {
        if (!event.candidate) {
          let message = {
            type: "OFFER",
            idPerson: this.idSocket,
            idConnect: this.currentConnect.idConnectHover,
            icePerson: JSON.stringify(connection.localDescription),
          };
          console.log(message);
          this.callApiMessage(message);
        }
      };
    },

    //accept offer
    async acceptOffer(data) {
      let connection = await this.connectIce(data.idConnect);

      const offer = JSON.parse(data.iceConnect);
      await connection.setRemoteDescription(offer);

      connection.onicecandidate = async (event) => {
        if (!event.candidate) {
          let message = {
            type: "ACCEPT",
            idPerson: this.idSocket,
            icePerson: JSON.stringify(connection.localDescription),
            idConnect: data.idConnect,
          };
          await this.callApiMessage(message);
        }
      };
      const answer = connection.createAnswer();
      connection.setLocalDescription(answer);
    },

    //accept answer
    acceptAnswer(data) {
      this.listConnects.forEach((item) => {
        if (item.idConnect == data.idConnect) {
          const answer = JSON.parse(data.iceConnect);
          item.conIce.setRemoteDescription(answer);
        }
      });
    },

    //api bridge message
    async callApiMessage(message) {
      await this.$axios
        .post("/", { message })
        .then((res) => {
          console.log(res);
          if (res.data.type == "NOT_FOUND") {
            alert("User " + res.data.id + " not found");
            this.listConnects.forEach((item) => {
              if (item.idConnect == res.data.id) {
                item.idConnect = null;
                item.stateConnect = "failed";
              }
            });
          }
          if (res.data.type == "SUCCESS") {
            console.log("Request send to user " + res.data.id + " success");
          }
        })
        .catch((e) => {
          alert("not found id");
        });
    },
  },
};
</script>

<style>
body {
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
}

.column1,
.column2 {
  float: left;
  overflow: hidden;
  height: calc(100vh - 100px);
  overflow-x: hidden;
}

.column1 {
  width: 25%;
  background-color: #e9edf2;
}
.column2 {
  width: 74%;
  border-left: 1px solid #d6d9dc;
}

.row:after {
  content: "";
  display: table;
  clear: both;
}
/*--------------------------*/
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

.watingConnect {
  text-align: center;
  margin-top: 50px;
}

.header {
  padding: 12px;
}
.header-right {
  float: right;
}
.header-search {
  background-color: #f7f8f9;
  border: 1px solid #d6d9dc;
  font-size: 15px;
}
.header-sign {
  clear: both;
  display: inline-block;
  padding-left: 20px;
  padding-right: 10px;
}
.topnav {
  overflow: hidden;
  background-color: #0064c8;
  color: white;
  font-weight: 590;
}

.topnav a {
  float: left;
  color: #f2f2f2;
  text-align: center;
  padding: 14px 16px;
  text-decoration: none;
  font-size: 17px;
}

.topnav a:hover {
  background-color: #ddd;
  color: black;
}

.topnav a.active {
  border-bottom: 3px solid white;
}

.iconDiv {
  width: 20px;
  margin-right: 10px;
}
.tabContent {
  margin-top: 5px;
  font-size: 18px;
}
.tab {
  padding: 15px;
  font-weight: 590;
  text-align: left;
  color: #52515c;
}
.tab:hover {
  cursor: pointer;
  color: black;
}

.tabActive {
  color: black;
  font-weight: 600;
  border-left: 3px solid #0064c8;
}

.myId {
  padding: 15px;
  font-weight: 600;
  font-size: 22px;
  border-bottom: 1px solid rgb(167, 164, 164);
  margin-bottom: 5px;
}
.myIdLabel {
  display: inline-block;
  clear: both;
  margin-right: 15px;
}
.lb {
  clear: both;
  display: inline-block;
}

.btn {
  padding: 10px;
  font-weight: 600;
  font-size: 15px;
  background-color: #038ff4;
  border: none;
  border-radius: 5px;
  color: white;
}
.btn:hover {
  cursor: pointer;
  background-color: #0064c8;
}

.idConnect {
  font-size: 20px;
  font-weight: 600;
}

.stateWaiting,
.stateConnected,
.stateDisconnected {
  width: 15px;
  height: 15px;
  clear: both;
  border-radius: 10px;
  display: inline-block;
}
.stateConnected {
  background-color: #28be7e;
}
.stateWaiting {
  background-color: blue;
}
.stateDisconnected {
  background-color: rgb(255, 0, 0);
}

.stateConnect {
  display: inline-block;
  clear: both;
  font-size: 20px;
  font-weight: 600;
}

/* ----------------- */

.idRoom {
  color: #363636;
  border-bottom: 1px solid rgb(167, 164, 164);
  font-weight: 600;
  padding: 5px;
  font-size: 20px;
}
.column2Contain {
  margin: 10px;
}

.highLeft {
  border-left: 2px solid #0064c8;
  padding-left: 15px;
  margin-left: 15px;
}

.idNum {
  color: #181818;
  font-weight: 570;
}
.connectIdInput {
  height: 40px;
  width: 250px;
  font-size: 20px;
  font-weight: 600;
}

.btnConnect {
  padding: 12px;
  font-weight: 600;
  font-size: 20px;
  background-color: #038ff4;
  border: none;
  border-radius: 5px;
  margin-left: 25px;
  color: white;
}
.btnConnect:hover {
  cursor: pointer;
  background-color: #0064c8;
}

/*     */

.filesContainer {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid #d6d9dc;
}

.columnFile {
  float: left;
  width: 50%;
}

/* Clear floats after the columns */
.rowFile:after {
  content: "";
  display: table;
  clear: both;
}

.linkDownload {
  width: 80%;
  overflow: hidden;
  color: black;
  border: 1px solid #9ea0a0;
  display: block;
  padding: 10px;
  margin-bottom: 10px;
  text-decoration: none;
  border-radius: 7px;
  background-color: #e9edf2;
}

/*     */

#myProgress {
  width: 87%;
  background-color: #ddd;
}

#myBar {
  width: 1%;
  height: 10px;
  background-color: #038ff4;
}

.connectContain {
  height: 170px;
}
</style>
