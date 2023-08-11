document.addEventListener('DOMContentLoaded', function () {
    // เมื่อหน้าเว็บโหลดเสร็จ
    initializeLiff();
});

async function initializeLiff() {
    await liff.init({ liffId: LIFF_ID });

    // ตรวจสอบสถานะการเข้าสู่ระบบ
    if (!liff.isLoggedIn()) {
        liff.login();
        return;
    }

    // แสดงปุ่มและกำหนดค่าการคลิก
    // const apiButton = document.getElementById('api-button');
    // apiButton.style.display = 'block';
    // apiButton.addEventListener('click', callAPI);

    // เรียกใช้ API ดึงข้อมูลผู้ใช้
    const profile = await liff.getProfile();

    // แสดงข้อมูลผู้ใช้
    // const dataContainer = document.getElementById('data-container');
    // dataContainer.innerHTML = `
    //     <p>UserID: ${profile.userId}</p>
    //     <p>Display Name: ${profile.displayName}</p>
    //     <p>Status Message: ${profile.statusMessage}</p>
    //     <img src="${profile.pictureUrl}" alt="Profile Picture">
    // `;

    try {
        const response = await fetch('https://tis-report.com/api/v1/workSheet/line', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer YOUR_ACCESS_TOKEN', // หากต้องการส่ง Access Token
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // ข้อมูลที่ต้องการส่งไปยัง API ในรูปแบบ JSON
                lineUserId: profile.userId,
                displayName: profile.displayName,
                statusMessage: profile.statusMessage,
                pictureUrl: profile.pictureUrl
            })
        });

        const data = await response.json();
        console.log('API Response:', data);

        // เรียกใช้ LIFF ในการตอบกลับไปยัง Line
        if (liff.isInClient()) {
            liff.sendMessages([
                {
                    type: 'text',
                    text: 'เปิดใบงานเรียบร้อย\nใบงานเลขที่:' + JSON.stringify(data.workSheetCode)
                }
            ]).then(() => {
                console.log('Message sent');
                liff.closeWindow();
            }).catch((error) => {
                console.error('Error sending message:', error);
                liff.closeWindow();
            });
        } else {
            alert('เปิดใบงานเรียบร้อย\nใบงานเลขที่: ' + JSON.stringify(data.workSheetCode));
            liff.closeWindow();
        }
    } catch (error) {
        console.error('API Error:', error);
        liff.closeWindow();
    }
}

async function callAPI() {
    try {
        const response = await fetch('http://noc.easynet.co.th:8092/api/v1/workSheet/line', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer YOUR_ACCESS_TOKEN', // หากต้องการส่ง Access Token
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // ข้อมูลที่ต้องการส่งไปยัง API ในรูปแบบ JSON
                lineUserId: profile.userId,
                displayName: profile.displayName,
                statusMessage: profile.statusMessage,
                pictureUrl: profile.pictureUrl
            })
        });

        const data = await response.json();
        console.log('API Response:', data);

        // เรียกใช้ LIFF ในการตอบกลับไปยัง Line
        if (liff.isInClient()) {
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

