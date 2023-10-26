document.addEventListener('DOMContentLoaded', function () {
    // เมื่อหน้าเว็บโหลดเสร็จ
    initializeLiff();
});

var roomNumber;
var profile;

async function initializeLiff() {
    console.log('--- initializeLiff ---')
    await liff.init({ liffId: LIFF_ID });

    const queryString = decodeURIComponent(window.location.search).replace("?liff.state=", "");
    const params = new URLSearchParams(queryString);
    const userId = params.get('userId');
    if (userId != null && userId != '') {
      console.log(userId);
    }
    document.getElementById('userId').value = userId;

    // ตรวจสอบสถานะการเข้าสู่ระบบ
    // if (!liff.isLoggedIn()) {
    //     liff.login();
    //     return;
    // }

    // แสดงปุ่มและกำหนดค่าการคลิก
    const oButton = document.getElementById('o-button');
    oButton.style.display = 'initial';
    oButton.addEventListener('click', callAPICreateWorkSheet);

    // const rButton = document.getElementById('r-button');
    // rButton.style.display = 'initial';
    // rButton.addEventListener('click', oButtonEvent);

    // เรียกใช้ API ดึงข้อมูลผู้ใช้
    // this.profile = await liff.getProfile();

    // แสดงข้อมูลผู้ใช้
    const dataContainer = document.getElementById('data-container');
    // dataContainer.innerHTML = `
    //     <p>UserID: ${profile.userId}</p>
    //     <p>Display Name: ${profile.displayName}</p>
    //     <p>Status Message: ${profile.statusMessage}</p>
    //     <img src="${profile.pictureUrl}" alt="Profile Picture">
    // `;

}

async function oButtonEvent() {
    const divNumber = document.getElementById('div_number');
    divNumber.style.display = 'initial';
    const oButton = document.getElementById('o-button');
    oButton.style.display = 'none';
    // const rButton = document.getElementById('r-button');
    // rButton.style.display = 'none';
    const confirmButton = document.getElementById('confirm-button');
    confirmButton.style.display = 'initial';
    confirmButton.addEventListener('click', confirmButtonEvent);
    const backButton = document.getElementById('back-button');
    backButton.style.display = 'initial';
    backButton.addEventListener('click', backButtonEvent);
    const confirmLabel = document.getElementById('confirm-label');
    confirmLabel.style.display = 'none';
    // const confirmButton2 = document.getElementById('confirm-button2');
    // confirmButton2.style.display = 'none';
    document.getElementById('room-number').value = '';
}

async function backButtonEvent() {
    const divNumber = document.getElementById('div_number');
    divNumber.style.display = 'none';
    const oButton = document.getElementById('o-button');
    oButton.style.display = 'initial';
    // const rButton = document.getElementById('r-button');
    // rButton.style.display = 'initial';
    const confirmButton = document.getElementById('confirm-button');
    confirmButton.style.display = 'none';
    const backButton = document.getElementById('back-button');
    backButton.style.display = 'none';
    const confirmLabel = document.getElementById('confirm-label');
    confirmLabel.style.display = 'none';
    // const confirmButton2 = document.getElementById('confirm-button2');
    // confirmButton2.style.display = 'none';
}

async function confirmButtonEvent() {
    this.roomNumber = document.getElementById('room-number').value;
    if (this.roomNumber.trim() === '') {
        document.getElementById('roomNumberError').style.display = 'block';
        document.getElementById('room-number').classList.add('error-border');
    } else {
        document.getElementById('roomNumberError').style.display = 'none';
        document.getElementById('room-number').classList.remove('error-border');
        callAPICreateWorkSheet();
    }
}

async function callAPICreateWorkSheet() {
    try {
        var domain = 'https://tis-report.com';
        if (!liff.isLoggedIn()) {
            const destinationUrl = window.location.href;
            liff.login({redirectUri: destinationUrl});
            return;
        }

        const checkLabel = document.getElementById('check-label');
        checkLabel.innerHTML = '';
        var checkedValue = []; 
        var inputElements = document.getElementsByClassName('form-check-input');
        for(var i=0; inputElements[i]; ++i){
            if(inputElements[i].checked){
                checkedValue.push(inputElements[i].value);
            }
        }
        console.log(checkedValue)
        if(checkedValue.length == 0){
            checkLabel.innerHTML = 'กรูณาเลือกประเภทการเปิดใบงาน';
            return;
        }

        const confirmLabel = document.getElementById('confirm-label');
        confirmLabel.innerHTML = '';
        const dataContainer = document.getElementById('data-container');
        document.getElementById('overlay').style.display = 'block';
        this.profile = await liff.getProfile();

        this.roomNumber = document.getElementById('room-number').value;
        const responseValidate = await fetch('https://tis-report.com/api/v1/workSheet/line/validate', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer YOUR_ACCESS_TOKEN', // หากต้องการส่ง Access Token
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // // ข้อมูลที่ต้องการส่งไปยัง API ในรูปแบบ JSON
                lineUserId: this.profile.userId,
                displayName: this.profile.displayName,
                statusMessage: this.profile.statusMessage,
                pictureUrl: this.profile.pictureUrl,
                roomNumber: this.roomNumber
            })
        });
        document.getElementById('overlay').style.display = 'none';

        const dataValidate = await responseValidate.json();
        console.log('API Response:', dataValidate);
        if(dataValidate.errorMessage != '' && dataValidate.errorMessage != null){
            confirmLabel.style.display = 'initial';
            confirmLabel.innerHTML = dataValidate.errorMessage;

            // const confirmButton2 = document.getElementById('confirm-button2');
            // confirmButton2.style.display = 'initial';
            // confirmButton2.addEventListener('click', callAPICreateWorkSheet2);

            const confirmButton = document.getElementById('confirm-button');
            confirmButton.style.display = 'none';
            return;
        }

        const response = await fetch('https://tis-report.com/api/v1/workSheet/line', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer YOUR_ACCESS_TOKEN', // หากต้องการส่ง Access Token
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // ข้อมูลที่ต้องการส่งไปยัง API ในรูปแบบ JSON
                lineUserId: this.profile.userId,
                displayName: this.profile.displayName,
                statusMessage: this.profile.statusMessage,
                pictureUrl: this.profile.pictureUrl,
                roomNumber: this.roomNumber,
                userId: document.getElementById('userId').value,
                workSheetTypeList: checkedValue
            })
        });

        const data = await response.json();
        console.log('API Response:', data);

        // เรียกใช้ LIFF ในการตอบกลับไปยัง Line
        if (liff.isInClient()) {
            // dataContainer.innerHTML = '<h1>เปิดใบงานเรียบร้อย\nใบงานเลขที่: ' + JSON.stringify(data.workSheetCode) + '</h1>';
            alert('เปิดใบงานเรียบร้อย\nใบงานเลขที่: ' + JSON.stringify(data.workSheetCode));
            setTimeout(() => {
                liff.closeWindow();
            }, 500);

            liff.sendMessages([
                {
                    type: 'text',
                    text: 'เปิดใบงานเรียบร้อย\nใบงานเลขที่:' + JSON.stringify(data.workSheetCode)
                }
            ]).then(() => {
                console.log('Message sent');
            }).catch((error) => {
                console.error('Error sending message:', error);
            });
        } else {
            alert('เปิดใบงานเรียบร้อย\nใบงานเลขที่: ' + JSON.stringify(data.workSheetCode));
        }
    } catch (error) {
        document.getElementById('overlay').style.display = 'none';
        // alert('เกิดข้อผิดพลาด');
        alert(error);
        console.error('API Error:', error);
    }
}

async function callAPICreateWorkSheet2() {
    try {
        var domain = 'https://tis-report.com';
        if (!liff.isLoggedIn()) {
            liff.login();
            return;
        }
        const dataContainer = document.getElementById('data-container');
        document.getElementById('overlay').style.display = 'block';

        this.profile = await liff.getProfile();

        this.roomNumber = document.getElementById('room-number').value;
        const response = await fetch('https://tis-report.com/api/v1/workSheet/line', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer YOUR_ACCESS_TOKEN', // หากต้องการส่ง Access Token
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // ข้อมูลที่ต้องการส่งไปยัง API ในรูปแบบ JSON
                lineUserId: this.profile.userId,
                displayName: this.profile.displayName,
                statusMessage: this.profile.statusMessage,
                pictureUrl: this.profile.pictureUrl,
                roomNumber: this.roomNumber,
                userId: document.getElementById('userId').value
            })
        });
        document.getElementById('overlay').style.display = 'none';
        const data = await response.json();
        console.log('API Response:', data);

        // เรียกใช้ LIFF ในการตอบกลับไปยัง Line
        if (liff.isInClient()) {
            // dataContainer.innerHTML = '<h1>เปิดใบงานเรียบร้อย\nใบงานเลขที่: ' + JSON.stringify(data.workSheetCode) + '</h1>';
            alert('เปิดใบงานเรียบร้อย\nใบงานเลขที่: ' + JSON.stringify(data.workSheetCode));
            setTimeout(() => {
                liff.closeWindow();
            }, 500);

            liff.sendMessages([
                {
                    type: 'text',
                    text: 'เปิดใบงานเรียบร้อย\nใบงานเลขที่:' + JSON.stringify(data.workSheetCode)
                }
            ]).then(() => {
                console.log('Message sent');
            }).catch((error) => {
                console.error('Error sending message:', error);
            });
        } else {
            alert('เปิดใบงานเรียบร้อย\nใบงานเลขที่: ' + JSON.stringify(data.workSheetCode));
        }
    } catch (error) {
        document.getElementById('overlay').style.display = 'none';
        // alert('เกิดข้อผิดพลาด');
        alert(error);
        console.error('API Error:', error);
    }
}