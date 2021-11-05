export default {
    set_id_socket(state, idSocket) {
        state.id_socket = idSocket;
    },

    set_con_socket(state, conSocket) {
        state.con_socket = conSocket;
    },

    set_messages_socket(state, messagesSocket) {
        state.messages_socket = messagesSocket;
    },

    set_current_connect(state, data) {
        state.current_connect = data;
    },

    add_list_connect(state, connect) {
        state.list_connect.push(connect);
    },

    set_connect(state, data) {
        let index = data.index;

        for (const key in state.list_connect[index]) {
            if (data[key] != undefined) {
                state.list_connect[index][key] = data[key];
            }
        }
    },

    close_connect(state,index){
        state.list_connect.splice(index,1);
    },

    add_files_receive(state, data) {
        let objData = {
            id: data.id,
            type: data.type,
            name: data.name,
            size: data.size,
            sizeReceived: data.sizeReceived,
            received: data.received
        }
        console.log("on mutation add files");
        console.log(objData);

        state.files_receive.push(objData);
    },

    set_file(state, data) {
        let index = data.index;

        for (const key in state.files_receive[index]) {
            if (data[key] != undefined) {
                state.files_receive[index][key] = data[key];
            }
        }
    }
}