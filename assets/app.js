const getUuid = function () {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
	    return v.toString(16);
	});
};

const showStream = function(stream, username, callIdx = -1) {
    let videoCard = document.createElement('div');
    videoCard.classList.add('p0');
    videoCard.setAttribute('id','call-' + callIdx);

    let video = document.createElement('video');
    video.setAttribute('autoplay', 'autoplay');
    video.classList.add('m0');
    video.srcObject = stream;
    videoCard.appendChild(video);

    let userOverlay = document.createElement('span');
    userOverlay.classList.add('userOverlay');
    userOverlay.innerText = username;
    videoCard.appendChild(userOverlay);

    document.getElementById('videos').appendChild(videoCard);
};

const sinchClient = new SinchClient({
	applicationKey: '5697dd46-131c-48b1-9007-b3ec58362ec0',
	applicationSecret: '9H6d7FVup0eRoAX1/beiUw==', //WARNING: This is insecure, only for demo easy/instant sign-in where we don't care about user identification
	capabilities: {calling: true, video: true, multiCall: true},
	startActiveConnection: true,
	onLogMessage: function(message) {
        console.log(message);
	},
	onLogMxpMessage: function(message) {
		console.log(message);
	},
});

const callClient    = sinchClient.getCallClient();

const channel       = 'cf7401b7-010b-4fb1-a023-701b0fca95e5';
const remoteCalls     = [];

if(navigator.userAgent.toLowerCase().indexOf('chrome') == -1) {
	document.getElementById('notChromeWarning').style.display = 'inherit';
}
else {
    document.getElementById('userForm')
    .addEventListener('submit', function(e) {
        e.preventDefault();
        e.srcElement.style.display = 'none';

        const username      = document.getElementById('user').value;
        const fullUsername  = getUuid() + '_' + username; 

        sinchClient.start({username: fullUsername}).then(function() {
            const groupCall = callClient.callGroup(channel);
            
            groupCall.addEventListener({
                onGroupRemoteCallAdded: function(call) {
                    remoteCalls.push(call);

                    console.log('Call: ');
                    console.log(call);

                    let otherName = call.toId.split('_')[1];
                    otherName = otherName.charAt(0).toUpperCase() + otherName.slice(1);

                    showStream(call.incomingStream, otherName, remoteCalls.indexOf(call));
                },
                onGroupLocalMediaAdded: function(stream) {
                    let myName = username.charAt(0).toUpperCase() + username.slice(1);

                    showStream(stream, username);
                },
                onGroupRemoteCallRemoved: function(call) {
                    console.log('removed call');
                    let callIdx = remoteCalls.indexOf(call);
                    remoteCalls.splice(callIdx, 1);
                    document.getElementById('videos').removeChild(document.getElementById('call-' + callIdx));
                    console.log('removed : ' + callIdx);
                },
            });
        });
    });
}