document.addEventListener('DOMContentLoaded', function () {
    // เมื่อหน้าเว็บโหลดเสร็จ
    initializeLiff();
});

var roomNumber;
var profile;
// var domain = 'http://localhost:8091'
var domain = 'https://tis-report.com';

async function initializeLiff() {
    await liff.init({ liffId: LIFF_ID });

    // ตรวจสอบสถานะการเข้าสู่ระบบ
    // if (!liff.isLoggedIn()) {
    //     liff.login();
    //     return;
    // }

    // แสดงปุ่มและกำหนดค่าการคลิก
    const oButton = document.getElementById('o-button');
    oButton.style.display = 'initial';
    oButton.addEventListener('click', callAPICreateWorkSheet);

    const rButton = document.getElementById('r-button');
    rButton.style.display = 'initial';
    rButton.addEventListener('click', oButtonEvent);

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
    const rButton = document.getElementById('r-button');
    oButton.style.display = 'none';
    rButton.style.display = 'none';
    const confirmButton = document.getElementById('confirm-button');
    confirmButton.style.display = 'initial';
    confirmButton.addEventListener('click', confirmButtonEvent);
    const backButton = document.getElementById('back-button');
    backButton.style.display = 'initial';
    backButton.addEventListener('click', backButtonEvent);
    const confirmLabel = document.getElementById('confirm-label');
    confirmLabel.style.display = 'none';
    const confirmButton2 = document.getElementById('confirm-button2');
    confirmButton2.style.display = 'none';
    document.getElementById('room-number').value = '';
}

async function backButtonEvent() {
    const divNumber = document.getElementById('div_number');
    divNumber.style.display = 'none';
    const oButton = document.getElementById('o-button');
    const rButton = document.getElementById('r-button');
    oButton.style.display = 'initial';
    rButton.style.display = 'initial';
    const confirmButton = document.getElementById('confirm-button');
    confirmButton.style.display = 'none';
    const backButton = document.getElementById('back-button');
    backButton.style.display = 'none';
    const confirmLabel = document.getElementById('confirm-label');
    confirmLabel.style.display = 'none';
    const confirmButton2 = document.getElementById('confirm-button2');
    confirmButton2.style.display = 'none';
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
            liff.login();
            return;
        }
        document.getElementById('overlay').style.display = 'block';
        this.profile = await liff.getProfile();

        this.roomNumber = document.getElementById('room-number').value;
        const responseValidate = await fetch('http://localhost:5000/api/v1/workSheet/line/validate', {
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
        if(dataValidate.errors && dataValidate.errors.length > 0){
            const confirmLabel = document.getElementById('confirm-label');
            confirmLabel.style.display = 'initial';
            const confirmButton2 = document.getElementById('confirm-button2');
            confirmButton2.style.display = 'initial';
            confirmButton2.addEventListener('click', callAPICreateWorkSheet2);

            const confirmButton = document.getElementById('confirm-button');
            confirmButton.style.display = 'none';
            return;
        }

        const response = await fetch('http://localhost:5000/api/v1/workSheet/line', {
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
                roomNumber: this.roomNumber
            })
        });

        const data = await response.json();
        console.log('API Response:', data);

        // เรียกใช้ LIFF ในการตอบกลับไปยัง Line
        if (liff.isInClient()) {
            dataContainer.innerHTML = '<h1>เปิดใบงานเรียบร้อย\nใบงานเลขที่: ' + JSON.stringify(data.workSheetCode) + '</h1>';
            setTimeout(() => {
                liff.closeWindow();
            }, 2000);

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
        document.getElementById('overlay').style.display = 'block';

        this.profile = await liff.getProfile();

        this.roomNumber = document.getElementById('room-number').value;
        const response = await fetch('http://localhost:5000/api/v1/workSheet/line', {
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
                roomNumber: this.roomNumber
            })
        });
        document.getElementById('overlay').style.display = 'none';
        const data = await response.json();
        console.log('API Response:', data);

        // เรียกใช้ LIFF ในการตอบกลับไปยัง Line
        if (liff.isInClient()) {
            dataContainer.innerHTML = '<h1>เปิดใบงานเรียบร้อย\nใบงานเลขที่: ' + JSON.stringify(data.workSheetCode) + '</h1>';
            setTimeout(() => {
                liff.closeWindow();
            }, 2000);

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
        console.error('API Error:', error);
    }
}