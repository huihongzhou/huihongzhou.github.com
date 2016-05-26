
var selfView;
var joinButton;
var audioCheckBox;
var videoCheckBox;

var localStream;
var ref_room;
var peer;
var viewContainer;
var room_text;
var appid_text;
var configuration={
	"iceServers": [
         {
            "url": "stun:cn1-stun.wilddog.com:3478"
        }
    ]
};
window.onload = function() {

    selfView = document.getElementById("self_view");
    viewContainer = document.getElementById("video-container");

    joinButton = document.getElementById("join_but");
    audioCheckBox = document.getElementById("audio_cb");
    videoCheckBox = document.getElementById("video_cb");
    room_text = document.getElementById("roomid_txt");
    appid_text = document.getElementById("appid_txt");
    // appid_text = 'p2pv-01';
    joinButton.onclick = function(evt) {
        //检查是否所有的输入项都满足
        if (false == runCheck()) {
            console.log("please check !");
            return;
        }
        joinRoom();
    }
    //检查是否所需的参数都已经设置
    function runCheck() {
        if (!(audioCheckBox.checked || videoCheckBox.checked)) {
            alert("Choose at least audio or video");
            return false;
        }
        var roomName = room_text.value;
        var appid = appid_text.value;
        if (roomName == "" || appid == "") {
            alert("room name and appid must be have a value");
            return false;
        }

        //禁用所有按钮和输入
        videoCheckBox.disabled = true;
        audioCheckBox.disabled = true;
        joinButton.disabled = true;
        room_text.disabled = true;
        appid_text.disabled = true;
        return true;
    }

    function joinRoom() {
        var appid = appid_text.value;
        var room_id = room_text.value;
        //根据AppId和房间名创建一个url
        var url = "https://" + appid + ".wilddogio.com/" + room_id;
        console.log("url = ", url);
        //创建一个房间节点
        ref_room = new Wilddog(url);

        //获取本地流。注意，如果使用chrome，html页面需要放在本地或公共服务器上，
        //特别的，最近的chrome版本要求必须要使用https服务器，否则GetUserMedia无法
		//被调用。而使用firefox可以本地打开页面。
        //同样，如果既没有音频输入也没有视频输入，那么 GetUserMedia 会返回错误。
        navigator.getUserMedia({
            "audio": audioCheckBox.checked,
            "video": videoCheckBox.checked
        }, function(stream) {
            //将stream绑定到浏览器输出
            selfView.src = URL.createObjectURL(stream);
            localStream = stream;

            if (videoCheckBox.checked)
                selfView.style.visibility = "visible";

            createUser(ref_room, stream);
        }, function(err) {
            console.log("GetUserMedia error: ", err);
        });
    }
    
    function createId() {
        return Math.random().toString(16).substr(2);
    }
    
    function createUser(ref, localStream) {
        //创建一个随机用户名
        var localUserId = createId();

        console.log("create local user, id = ", localUserId);

        //创建自己的节点到云端
        ref.child(localUserId).update({ "status": "created" }, function(err) {
			if(err)
			{
	            console.log("create own node ", err);
			}
        });
        
        //去云端查看现在有哪些用户，向这些用户的信箱发信
        ref.once("value", function(snap) {
            snap.forEach(function(snapshot) {
                if (snapshot.key() == localUserId) {
                    return;
                }
                var remoteUserId = snapshot.key();
                var ref_remoteUserMailbox = ref.child(remoteUserId).child("mailbox");

                //创建peer-->创建offer-->设置本地offer-->向对端用户信箱发送offer
                sendOfferToRemote(ref_remoteUserMailbox, localUserId);
            });
        });
        //监听自己信箱下是否有新信到来
        ref.child(localUserId).child("mailbox").on("child_added", function(snapshot) {
            if (snapshot.val() == null)
                return;

            //获取寄件人的id
            var remoteUserId = snapshot.child("from").val();

            //获取信的类型
            var type = snapshot.child("type").val();

            if (type == "offer") {
                //收到对端的offer请求
                var offer = JSON.parse(snapshot.child("value").val());
                console.log("received offer");
                var ref_remoteUserMailbox = ref.child(remoteUserId).child("mailbox");
                //收到远方的一个连接请求，建立p2p连接，并将回复返回给远方
                handleRemoteOffer(ref_remoteUserMailbox, localUserId, offer, localStream);
            }
            else if (type == "answer") {
                //收到对端的answer响应
                var answer = JSON.parse(snapshot.child("value").val());
                console.log("received answer");
                //收到对端的响应，将对端的answer响应设置到本地
                handleRemoteAnswer(answer);
            }
			else if (type == "candidate"){
				//收到对端的candidate，设置到本地
				var candidate = new RTCIceCandidate(JSON.parse(snapshot.child("value").val()));
				if(peer != null)
				{
					peer.addIceCandidate(candidate);
				}
			}
        });
    }

    function sendOfferToRemote(ref_remoteUserMailbox, localUserId) {
        //创建新的peer连接
        peer = createPeer(localStream, ref_remoteUserMailbox, localUserId);

        //生成offer-->发送offer到对端信箱
        createOffer(ref_remoteUserMailbox, localUserId);
    }
    function handleRemoteOffer(ref_remoteUserMailbox, localUserId, offer, localStream) {
        //创建新的peer
        peer = createPeer(localStream, ref_remoteUserMailbox, localUserId);

        //将对端的offer sdp信息设置为RTCSessionDescription对象
        var desc = new RTCSessionDescription(offer);

        //设置对端offer sdp到本地-->创建answer-->设置本地sdp-->发送answer
        peer.setRemoteDescription(desc, function(err) {
            peer.createAnswer(function(description) {
                peer.setLocalDescription(description, function() {
                    var answer = {};
                    answer["from"] = localUserId;
                    answer["type"] = "answer";
                    answer["value"] = JSON.stringify(peer.localDescription);
                    //发送answer到对端信箱
                    ref_remoteUserMailbox.push(answer);
                }, function(err) {
                    console.log("setLocalDescription Failure callback: " + err);
                });
            }, function(err) {
                console.log('createAnswer Failure callback: ' + err);
            });
        }, function(err) {
            console.log('setRemoteDescription Failure callback: ' + err);
            peer._remoteState = "failed";
        });
    }

    function handleRemoteAnswer(answer) {
        if (peer == null) {
            console.log("local peer is null!");
            return;
        }

        var description = new RTCSessionDescription(answer);
        //收到对端的answer，将其设置到本地
        peer.setRemoteDescription(description, function(err) {
            console.log("setRemoteDescription success");
        },function(err){
			console.log("setRemoteDescription err:",err);
		});
    }
    
    function createOffer(ref_remoteUserMailbox, localUserId) {
        if (peer == null) {
            console.error("peer is null");
            return;
        }
        //根据本地信息（媒体/ip等）创建offer，并发送到对端
        peer.createOffer(function(description) {
            //创建出来的offer先在本地保存一份
            peer.setLocalDescription(description, function(evt) {
				var data = {};
				data["from"] = localUserId;
				data["type"] = "offer";
				data["value"] = JSON.stringify(description);
				//发送到对端信箱
				ref_remoteUserMailbox.push(data);
            },function(err){
				console.log("err:",err);
			});
        },function(err){
			console.log("err:",err);
		});
    }
    function createPeer(stream, ref_remoteUserMailbox, localUserId) {
        if (null == stream) {
            console.log("set peer: cannot get local stream");
            return null;
        }

        var peer = new RTCPeerConnection(configuration);
        
        //添加本地stream到要传输的的stream列表中
        peer.addStream(stream, function(err) {
			if(err)
			{
				console.log("setPeer: add stream error code: ", err);
			}
        });
        
        //设置当收到对端stream时的回调
        peer.onaddstream = function(evt) {
            console.log("on add stream");

            //在html上创建对端的video DOM
            var view = document.createElement("video");
            viewContainer.appendChild(view);
            view.autoplay = true;
            view.src = URL.createObjectURL(evt.stream);
            view.style.visibility = "visible";
        };
		//当收到底层ice candidate消息，说明已经准备好了新的candidate，发送给对端
		peer.onicecandidate = function(evt){
			console.log("on ice candidate", evt);
			var candidate = {};
            candidate["from"] = localUserId;
            candidate["type"] = "candidate";
            candidate["value"] = JSON.stringify(evt.candidate);
			ref_remoteUserMailbox.push(candidate);
		}
        return peer;
    }
}

