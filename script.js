const SPREADSHEET_ID = '10pdyPTu6OsEGg5LQR9EVYyH1OB8-1jKZxwIRPMrUdoE'; // 구글 시트 ID
const API_KEY = 'AIzaSyAK8E5V6co3Isf-Za2NC9rISu-0p9C2T4k'; // 구글 API 키

let allData = []; // 모든 데이터를 저장할 배열

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
        allData = []; // 데이터 초기화

        if (range.values && range.values.length > 1) { // 헤더를 제외한 데이터가 있는지 확인
            for (let i = 1; i < range.values.length; i++) { // 첫 번째 행은 헤더이므로 건너뜀
                const row = range.values[i];
                const itemName = row[0]; // 항목 이름
                const actuals = row.slice(1, 5); // 실적 (B, C, D, E 열)
                const targets = row.slice(5, 9); // 목표 (F, G, H, I 열)

                // A, B, C, D 열 중 하나라도 공란인 경우 건너뜀
                if (!itemName.trim() || actuals.some(actual => actual === "") || targets.some(target => target === "")) {
                    continue;
                }

                allData.push({ itemName, actuals, targets });
            }
            displayData('year'); // 기본적으로 1년 데이터를 표시
        } else {
            progressContainer.innerHTML = '데이터가 없습니다.';
        }
    }, (response) => {
        console.error('Error: ' + response.result.error.message);
    });
}

function displayData(period) {
    const progressContainer = document.getElementById('progressContainer');
    progressContainer.innerHTML = ''; // 기존 내용 초기화

    allData.forEach(({ itemName, actuals, targets }) => {
        const progressItem = document.createElement('div');
        progressItem.className = 'progress-item';
        progressItem.innerHTML = `<h2>${itemName}</h2>`;

        let displayContent = '';

        if (period === 'year') {
            displayContent = actuals.map((actual, index) => `<span>Q${index + 1} 실적: ${actual} 목표: ${targets[index]} (${calculateProgress(actual, targets[index])}%)</span>`).join('<br>');
        } else if (period === 'half') {
            const halfActuals = [parseFloat(actuals[0]) + parseFloat(actuals[1]), parseFloat(actuals[2]) + parseFloat(actuals[3])];
            const halfTargets = [parseFloat(targets[0]) + parseFloat(targets[1]), parseFloat(targets[2]) + parseFloat(targets[3])];
            displayContent = halfActuals.map((actual, index) => `<span>반기 ${index + 1} 실적: ${actual} 목표: ${halfTargets[index]} (${calculateProgress(actual, halfTargets[index])}%)</span>`).join('<br>');
        } else if (period === 'quarter') {
            const quarterActuals = [parseFloat(actuals[0]), parseFloat(actuals[1]), parseFloat(actuals[2]), parseFloat(actuals[3])];
            const quarterTargets = [parseFloat(targets[0]), parseFloat(targets[1]), parseFloat(targets[2]), parseFloat(targets[3])];
            displayContent = quarterActuals.map((actual, index) => `<span>Q${index + 1} 실적: ${actual} 목표: ${quarterTargets[index]} (${calculateProgress(actual, quarterTargets[index])}%)</span>`).join('<br>');
        }

        progressItem.innerHTML += `<div class="progress-header">${displayContent}</div>`;
        progressContainer.appendChild(progressItem);
    });
}

function calculateProgress(actual, target) {
    const progress = target > 0 ? (parseFloat(actual) / parseFloat(target)) * 100 : 0;
    return progress.toFixed(2);
}

// 진도율 업데이트 버튼 클릭 시 페이지 새로 고침
document.getElementById('updateProgress').addEventListener('click', () => {
    location.reload(); // 페이지 새로 고침
});

// 버튼 클릭 이벤트 추가
document.getElementById('viewYear').addEventListener('click', () => displayData('year'));
document.getElementById('viewHalf').addEventListener('click', () => displayData('half'));
document.getElementById('viewQuarter').addEventListener('click', () => displayData('quarter'));

// Google API 로드
gapi.load('client', initClient); 