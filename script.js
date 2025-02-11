const SPREADSHEET_ID = '10pdyPTu6OsEGg5LQR9EVYyH1OB8-1jKZxwIRPMrUdoE'; // 구글 시트 ID
const API_KEY = 'AIzaSyAK8E5V6co3Isf-Za2NC9rISu-0p9C2T4k'; // 구글 API 키

function initClient() {
    gapi.client.init({
        'apiKey': API_KEY,
        'discoveryDocs': ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    }).then(() => {
        loadProgressData();
    });
}

function loadProgressData() {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Sheet1!A1:B', // 시트 이름과 범위
    }).then((response) => {
        const range = response.result;
        const progressContainer = document.getElementById('progressContainer');
        progressContainer.innerHTML = ''; // 기존 내용 초기화

        if (range.values && range.values.length > 0) {
            range.values.forEach((row) => {
                const progressItem = document.createElement('div');
                progressItem.className = 'progress-item';
                progressItem.innerHTML = `
                    <h2>${row[0]}</h2>
                    <div class="sub-item">
                        <span>진도율: <span class="progress-value">${row[1]}%</span></span>
                        <div class="progress-bar" style="width: ${row[1]}%;"></div>
                    </div>
                `;
                progressContainer.appendChild(progressItem);
            });
        } else {
            progressContainer.innerHTML = '데이터가 없습니다.';
        }
    }, (response) => {
        console.error('Error: ' + response.result.error.message);
    });
}

document.getElementById('updateProgress').addEventListener('click', () => {
    loadProgressData(); // 데이터 새로 고침
});

// Google API 로드
gapi.load('client', initClient); 