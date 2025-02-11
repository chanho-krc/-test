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
        range: '진도율!A1:E', // 시트 이름과 범위 (E열 추가)
    }).then((response) => {
        const range = response.result;
        const progressContainer = document.getElementById('progressContainer');
        progressContainer.innerHTML = ''; // 기존 내용 초기화

        if (range.values && range.values.length > 1) { // 헤더를 제외한 데이터가 있는지 확인
            for (let i = 1; i < range.values.length; i++) { // 첫 번째 행은 헤더이므로 건너뜀
                const row = range.values[i];
                const itemName = row[0]; // 항목 이름
                const actuals = row.slice(1, 5); // 실적 (B, C, D, E 열)
                const targets = row.slice(5, 9); // 목표 (F, G, H, I 열)
                const progress = actuals.map((actual, index) => {
                    const target = targets[index] ? parseFloat(targets[index]) : 0;
                    return target > 0 ? (parseFloat(actual) / target) * 100 : 0;
                });

                // A, B, C, D 열 중 하나라도 공란인 경우 건너뜀
                if (!itemName.trim() || actuals.some(actual => actual === "") || targets.some(target => target === "")) {
                    continue;
                }

                const progressItem = document.createElement('div');
                progressItem.className = 'progress-item';
                progressItem.innerHTML = `
                    <h2>${itemName}</h2>
                    <div class="progress-header">
                        ${actuals.map((actual, index) => `<span>Q${index + 1} 실적: ${actual} 목표: ${targets[index]} (${progress[index].toFixed(2)}%)</span>`).join('<br>')}
                    </div>
                    <div class="progress-bar-container">
                        ${progress.map((p, index) => `
                            <div class="progress-bar" style="width: ${p}%; background-color: ${p >= 100 ? 'green' : '#76c7c0'};">
                                <div class="months-container">
                                    ${generateMonthsHTML()}
                                </div>
                            </div>
                        `).join('')}
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

function generateMonthsHTML() {
    const months = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // 0부터 시작하므로 현재 월을 가져옴

    return months.map((month, index) => {
        return `<span class="month-item ${index === currentMonth ? 'current-month' : ''}">${month}</span>`;
    }).join('');
}

// 진도율 업데이트 버튼 클릭 시 페이지 새로 고침
document.getElementById('updateProgress').addEventListener('click', () => {
    location.reload(); // 페이지 새로 고침
});

// Google API 로드
gapi.load('client', initClient); 