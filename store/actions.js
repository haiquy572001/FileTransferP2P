export default {
    set_id_socket({ commit }, idSocket) {
        commit("set_id_socket", idSocket);
    },

    set_con_socket({ commit }, conSocket) {
        commit("set_con_socket", conSocket);
    },

    set_messages_socket({ commit }, messagesSocket) {
        commit("set_messages_socket", messagesSocket);
    },

    add_list_connect({ commit }, connect) {
        commit("add_list_connect", connect);
    },

    set_current_connect({ commit }, data) {
        commit("set_current_connect", data);
    },

    set_connect({commit},data){
        commit("set_connect",data);
    },

    close_connect({commit},index){
        commit("close_connect",index);
    },

    add_files_receive({commit},data){
        commit("add_files_receive",data);
    },

    set_file({commit},data){
        commit("set_file",data);
    }
}