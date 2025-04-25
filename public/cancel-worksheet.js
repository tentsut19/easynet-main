document.addEventListener('DOMContentLoaded', function () {
    initializeLiff();
});

var roomNumber;
var profile;

async function initializeLiff() {
    try {
        document.getElementById("overlay").style.display = "block";
        
        console.log('--- initializeLiff ---')
        await liff.init({ liffId: LIFF_ID });

        if (!liff.isLoggedIn() && PROD) {
            const destinationUrl = window.location.href;
            liff.login({redirectUri: destinationUrl});
            return;
        }

        cancelWorkSheet();
    } catch (error) {
        document.getElementById("overlay").style.display = "none";
        alert('เกิดข้อผิดพลาด');
        console.error('API Error:', error);
        liff.closeWindow();
    }
}

async function cancelWorkSheet(workSheetId){
    try {

        var profile
        if (PROD) {
            profile = await liff.getProfile();
        }else{
            profile = profileTest;
        }

        var urlParams = new URLSearchParams(window.location.search);
        var workSheetId = urlParams.get('workSheetId');
        var workSheetIdValue = decodeURIComponent(workSheetId);

        const response = await fetch(PATCH_DELETE_WORKSHEET+workSheetIdValue, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                lineUserId: profile.userId,
                displayName: profile.displayName,
                statusMessage: profile.statusMessage,
                pictureUrl: profile.pictureUrl
            })
        });

        document.getElementById("overlay").style.display = "none";
        console.log('response:', response);
        if(response.status == 200){
            liff.closeWindow();
        }else{
            liff.closeWindow();
        }
    } catch (error) {
        document.getElementById("overlay").style.display = "none";
        console.error('API Error:', error);
        liff.closeWindow();
    }
}

function swalError(title,text){
    Swal.fire({
        title: title,
        text: text,
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'ตกลง'
      }).then((result) => {
        
      })
}