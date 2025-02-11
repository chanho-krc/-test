const SPREADSHEET_ID = '10pdyPTu6OsEGg5LQR9EVYyH1OB8-1jKZxwIRPMrUdoE'; // 구글 시트 ID
const API_KEY = 'AIzaSyAK8E5V6co3Isf-Za2NC9rISu-0p9C2T4k'; // 구글 API 키

function initClient() {
    gapi.client.init({
        'apiKey': API_KEY,
        'discoveryDocs': ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    }).then(() => {
        loadProgressData();
    }).catch((error) => {
        console.error('Error initializing Google API client:', error);
    });
}

function loadProgressData() {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: '진도율!A1:D', // 시트 이름과 범위
    }).then((response) => {
        const range = response.result;
        const progressContainer = document.getElementById('progressContainer');
        progressContainer.innerHTML = ''; // 기존 내용 초기화

        if (range.values && range.values.length > 1) { // 헤더를 제외한 데이터가 있는지 확인
            for (let i = 1; i < range.values.length; i++) { // 첫 번째 행은 헤더이므로 건너뜀
                const row = range.values[i];
                const actual = row[1]; // 실적
                const target = row[2]; // 목표
                let progress = parseInt(row[3]); // 진도율

                // 진도율이 100%를 초과할 경우 100으로 설정
                if (progress > 100) {
                    progress = 100;
                }

                const progressItem = document.createElement('div');
                progressItem.className = 'progress-item';
                progressItem.innerHTML = `
                    <h2>${row[0]}</h2>
                    <div class="sub-item">
                        <span>실적: ${actual}</span>
                        <span>목표: ${target} (${progress}%)</span>
                        <div class="progress-bar" style="width: ${progress}%; background-color: ${progress === 100 ? 'green' : '#76c7c0'};"></div>
                    </div>
                `;
                progressContainer.appendChild(progressItem);
            }
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