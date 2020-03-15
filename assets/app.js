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

    let userOverlay = document.createElement('span');
    userOverlay.classList.add('userOverlay');
    userOverlay.innerText = username;
    videoCard.appendChild(userOverlay);

    let video = document.createElement('video');
    video.setAttribute('autoplay', 'autoplay');
    video.classList.add('m0');
    video.srcObject = stream;
    videoCard.appendChild(video);

    document.getElementById('videos').appendChild(videoCard);

    return video;
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
const muteBtn = document.getElementById('mute');
let muted = true;

if(navigator.userAgent.toLowerCase().indexOf('chrome') == -1) {
	document.getElementById('notChromeWarning').style.display = 'inherit';
}
else {
    document.getElementById('userForm')
    .addEventListener('submit', function(e) {
        e.preventDefault();
        e.srcElement.style.display = 'none';
        muteBtn.style.display = 'block';

        const username      = document.getElementById('user').value;
        const fullUsername  = getUuid() + '_' + username; 

        sinchClient.start({username: fullUsername}).then(function() {
            const groupCall = callClient.callGroup(channel);
            
            groupCall.addEventListener({
                onGroupRemoteCallAdded: function(call) {
                    remoteCalls.push(call);
                    if(muted) {
                        call.mute();
                    }

                    let otherName = call.toId.split('_')[1];
                    otherName = otherName.charAt(0).toUpperCase() + otherName.slice(1);

                    showStream(call.incomingStream, otherName, remoteCalls.indexOf(call));
                },
                onGroupLocalMediaAdded: function(stream) {
                    let myName = username.charAt(0).toUpperCase() + username.slice(1);
                    let video = showStream(stream, myName);
                    video.muted = true;
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


muteBtn.addEventListener('click', function(e) {
    e.preventDefault();
    if(muted) {
        muted = false;
        for(let call of remoteCalls) {
            call.unmute();
        }
        muteBtn.innerHTML = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAABmJLR0QA/wD/AP+gvaeTAAAFGUlEQVR4nO2cXWgdRRSAv71eY60NmFpFbYuxRdv4W/MkirEFQdo+RK300WLRii9SEHzwxVf1wfqLIigWQSwi9a8KSlFso4ig1J9YQUWbBqQ/VhPUpi1ZH84ss11nbzZ3Znb33swHy97smXvmzMmcmZ3dMxcCgUAgEAgEOpKoagMyDALDwBBwIbBUXR8Dfgc+Bd4GvqrEupoSAXcC+4G44LEf2ED9OkDpXAp8jnbMr8ATwFpgGXCOOpYD64BtwG+p8iNAf8k214Yh4DDacXcBTcQpewzlk+tnApvQjjykdM0phoApxAE7gHNTsj3IWJcle70PeEPpmGIOObEf6TUx8CJ241gEPKd0HUFCvauJ0GPe62jnzRS2ra5H6J44QskTS6PMypCZ83rgIHA/0miA6dTnNEWux8B9wDhwA3C7Q3trRYS+VdnkQf/dSveoB921YBBp4BjQg13Ymq73IL0wBlY5sLcQZYbwsDq/CZzALmxN108o3em6uoqPkYb6bNywqmO3xzoq40ekcR8aZK7C+SP0Uq8Uygzhi9R5nkHmKpwT3RfP2roOIFm/dks9QPn3gWlcz8KVUKUDXc/CXU8IYUf4DNsRC7vaogoH+gzbaQu7ak8IYceEWdiSMAvPkhDCjgizcIp2/tt1moVL7a22BtQxhK1tatp8OWPIbBlBesxNnq6X0rPCLFwx6RAYoPVLnTqE8KiSDbiyqcoe2BXYjoGdnh1lbX/ogZYEB1oSHGiJSwceV2fTWzeASXXuLahvPZJDM4YkXBYh0T2ZIz9bnY/nyCvlAuSW4HCOPHkvfHlBfWPo24wDBb+zgtbvhY8q+aKC+mbEZQ88gvxnzwMWGOTj6rzMYZ1ZkvzAcYOsF0nK/BdxpBNcOnAa+AW5NVhhkCdPT9YV1LcFHcJbCn4n0W3KcF2pbPuZGq9cXkGMe8AgS7KzDgBneKi7iQ57U3bWViV7yUPdztiMGPmOQZbOD9zsoe57ab2U3IW/3ERnnA+cRJK+FxrkG9A5gqZxsl160bmBpgzVRUj620lkjK41HyAN2WqQRcjjpxjYiZsxuIHsXoqBvTllHlTyXQ7q8856Ts9EzdKPztLfhp0TG8CT6P0ilxjKzEP3zlst6iqNBrKXLQYeyimT3ieyk/bCuRfd86b4/wPVhIdVmS/poIcftyBGTyLbuUwMoXviQeAeis3OTWTCSHrVIfKdtxz4W5VbU9D22rAdMfwLzKEM4txkTExucZ5Flm4rkZ65QH1eq2TpFcpezGELcBbS62LgZevWVEAf+qZ1O/nhEwF3oJ8WFzlGab0fJAJeVWV/4vStZB3FNUgYx8DTzDwGrQIeQZLEf1DfnVSfdyvZTFsYGkhPjYEJ4Oo2ba8Na4B/kAa9hn4i4oP5yBayGBn7Vnusq1RWA8eQhu0DrvRQx1XAt6qOP+jC3ZtXAN+jN8U8ipuxqQ94XOmMge+QSacrmQ88A5xCGvsn4sh2GjwAPAb8pXSdAp7C7xBRGwbRS77k2Ids998IXIuspXvUsRCZPDYiq5dvMt99X+mccwwCL6DHx9kcx4DnKXFjoYm6LG2awI3AzcB1wG055d4CvgY+AT5DwjZgIJtyUXkaWh7htaYlwYGWBAdaUoUDlyC/sjFB/gybkPd39phAdqtf5tn2ylmCfrnt4zgKLC6tNRWQ/L7Lu7ht6GLgPaV7h0O9tSMJWx+9ZCl6eVgaZd9Il3UvV1q7wiwcCAQCgUAgMDf5D3W764kvvWUqAAAAAElFTkSuQmCC"/>';
    }
    else {
        muted = true;
        for(let call of remoteCalls) {
            call.mute();
        }
        muteBtn.innerHTML = '<img src="data:image/png;base64,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"/>';
    }
});