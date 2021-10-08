<template>
  <div>
    <!--h3>Your id is : {{ idPerson }}</h3>
    <hr style="width: 500px" />
    <h2>Connect to Person id</h2>
    <input type="text" v-model="idConnect" />
    <button @click="callConnect">Connect</button>
    <hr style="width: 500px" />
    <h2>Send Messages</h2>
    <input type="text" v-model="sendMessage">
    <button @click="send">Send</button-->
    <div class="about-section">
      <h1>File Transfer P2P</h1>
      <p>Fast, convenient and private for sharing files to everybody</p>
    </div>
    <div clas="row">
      <div class="column">
        <div class="card" style="background-color: #96d4d4">
          <div class="container">
            <h2 class="name-app">My ID</h2>
            <hr>
            <h1 style="color: black">{{idPerson}}</h1>
          </div>
        </div>
      </div>
      <div class="column">
        <div class="card" style="background-color: #ffc0c7">
          <div class="container">
            <h2 class="name-app">Connect to ID</h2>
            <input type="text" class="textInput" v-model="idConnect"/>
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
            <input type="text" class="textInput" v-model="sendMessage"/>
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
let conWs = new WebSocket("ws://localhost:3000/");

let channel = null;
const connection = new RTCPeerConnection({
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
});

connection.ondatachannel = (event) => {
  console.log("ondatachannel");
  channel = event.channel;
  channel.onmessage = (event) => alert(event.data);
};

export default {
  data() {
    return {
      idPerson: null,
      idConnect: null,
      icePerson: "",
      sendMessage: "",
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
        .post("http://localhost:3000", {
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
      channel.send(this.sendMessage);
      this.sendMessage = "";
    },
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
