<template>
  <div class="w3-row">
    <div class="w3-col m3">
      <My-id />
      <div
        v-for="(notification, index) of notifications"
        :key="notification.iceConnect"
      >
        <Notification
          :index="index"
          :notification="notification"
          @answerNotification="answerNotification"
        />
      </div>
      <List-connect />
    </div>

    <div class="w3-col m6">
      <div v-for="(connect, index) of list_connect" :key="connect.id">
        <div v-show="connect == current_connect">
          <Connect @createOffer="createOffer" :connect="connect" />
          <Send-files :connect="connect" :index="index" />
        </div>
      </div>
    </div>

    <div class="w3-col m3">
      <Receive-files />
    </div>
  </div>
</template>

<script>
import "@/static/assets/css/formulate.css";
import MyId from "../components/Home/MyId.vue";
import ListConnect from "../components/Home/ListConnect.vue";
import Connect from "../components/Home/Connect.vue";
import SendFiles from "../components/Home/SendFiles.vue";
import ReceiveFiles from "../components/Home/ReceiveFiles.vue";
import Notification from "../components/Home/Notification.vue";
import { mapActions, mapGetters } from "vuex";
export default {
  components: {
    MyId,
    ListConnect,
    Connect,
    SendFiles,
    ReceiveFiles,
    Notification,
  },

  data() {
    return {
      notifications: [],
    };
  },

  computed: {
    ...mapGetters({
      list_connect: "get_list_connect",
      current_connect: "get_current_connect",
      id_socket: "get_id_socket",
      messages_socket: "get_messages_socket",
      files_receive: "get_files_receive",
    }),
  },
  watch: {
    messages_socket: function () {
      switch (this.messages_socket.type) {
        case "OFFER":
          let notifiData = {
            iceConnect: this.messages_socket.iceConnect,
            idConnect: this.messages_socket.idConnect,
          };
          this.notifications.unshift(notifiData);
          break;
        case "ACCEPT":
          console.log("on accept connect");
          let data = {
            iceConnect: this.messages_socket.iceConnect,
            idConnect: this.messages_socket.idConnect,
          };
          this.acceptAnswer(data);
          break;
      }
    },
  },
  methods: {
    ...mapActions([
      "set_connect",
      "add_list_connect",
      "set_current_connect",
      "add_files_receive",
      "set_file",
    ]),

    //connect ice server
    async connectIce(idAccept, idOffer) {
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
              "turns:hk-turn1.xirsys.com:5349?transport=tcp",
            ],
            credential: "7885ae4a-2f78-11ec-aa20-0242ac120004",
          },
        ],
      });

      //for send file
      let channel = await connection.createDataChannel("data");

      //receive data
      let receiveMessage;
      let receiveBuffer = [];
      let idFiles;
      connection.ondatachannel = (event) => {
        channel = event.channel;
        channel.onmessage = (event) => {
          console.log("receive channel");
          try {
            if (JSON.parse(event.data)) {
              receiveMessage = JSON.parse(event.data);
              receiveMessage.sizeReceived = 0;

              idFiles = this.files_receive.length;
              receiveMessage.id = idFiles;
              receiveMessage.received = null;
              /*
              receiveMessage:{
                id
                type,
                name,
                size,
                sizeReceived,
                received
              }
               */
              this.add_files_receive(receiveMessage);
              return;
            }
          } catch {}

          if (receiveMessage.type == "InitMessage") {
            let blob = new Blob([event.data]);

            receiveBuffer.push(blob);
            receiveMessage.sizeReceived += blob.size;

            let setFilesProcess = {
              index: idFiles,
              sizeReceived: receiveMessage.sizeReceived,
            };
            this.set_file(setFilesProcess);

            if (receiveMessage.sizeReceived == receiveMessage.size) {
              const received = new Blob(receiveBuffer);

              let setFilesReceived = {
                index: idFiles,
                received: URL.createObjectURL(received),
              };

              this.set_file(setFilesReceived);
            }
          }
        };
      };

      let index;
      if (idAccept == null) {
        //create connect
        index = this.list_connect.indexOf(this.current_connect);
        let dataConnect = {
          index: index,
          conIce: connection,
          idConnect: idOffer,
          channel: channel,
          stateConnect: "waiting",
        };
        this.set_connect(dataConnect);
      } else {
        //accept connect
        let dataConnect = {
          id: this.list_connect.length,
          idConnect: idAccept,
          conIce: connection,
          channel: channel,
          stateConnect: "waiting",
        };
        this.add_list_connect(dataConnect);
        this.set_current_connect(dataConnect);
        index = this.list_connect.length - 1;
      }

      connection.oniceconnectionstatechange = (event) => {
        let dataState = {
          index: index,
          stateConnect: connection.iceConnectionState,
        };
        this.set_connect(dataState);
      };

      return connection;
    },

    async createOffer(idConnect) {
      const connection = await this.connectIce(null, idConnect);

      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);
      console.log(offer);
      connection.onicecandidate = async (event) => {
        if (!event.candidate) {
          let message = {
            type: "OFFER",
            idPerson: this.id_socket,
            idConnect: idConnect,
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
            idPerson: this.id_socket,
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
      this.list_connect.forEach((item) => {
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
            /*this.listConnects.forEach((item) => {
              if (item.idConnect == res.data.id) {
                item.idConnect = null;
                item.stateConnect = "failed";
              }
            });*/
          }
          if (res.data.type == "SUCCESS") {
            console.log("Request send to user " + res.data.id + " success");
          }
        })
        .catch((e) => {
          alert("not found id");
        });
    },

    answerNotification(answer, index, dataNoti) {
      if (answer) {
        this.acceptOffer(dataNoti);
      }

      this.notifications.splice(index, 1);
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