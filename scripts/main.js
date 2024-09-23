let recognizer = null;
let isListening = false;

// 모델 로드 함수
async function loadModel(team) {
    try {
        // 기존 recognizer가 있으면 중지
        if (recognizer) {
            if (isListening) {
                recognizer.stopListening();
                isListening = false;
            }
            // speechCommands 라이브러리는 dispose 메서드를 지원하지 않으므로 null로 설정
            recognizer = null;
        }

        // 현재 사이트의 기본 URL을 사용하여 절대 경로 설정
        const baseURL = window.location.origin;
        const modelURL = `${baseURL}/${team}/model.json`;
        const metadataURL = `${baseURL}/${team}/metadata.json`;

        // 모델 생성
        recognizer = speechCommands.create(
            'BROWSER_FFT',
            undefined,
            modelURL,
            metadataURL
        );

        // 모델 로드
        await recognizer.ensureModelLoaded();
        console.log(`${team} 모델 로드 완료`);
        document.getElementById('start-btn').disabled = false;
        document.getElementById('label').innerText = `${team} 모델 로드 완료. 음성 인식을 시작하세요.`;
    } catch (error) {
        console.error('모델 로드 실패:', error);
        document.getElementById('label').innerText = `모델 로드 실패: ${error.message}`;
    }
}

// 음성 인식 시작 함수
function startListening() {
    if (!recognizer) {
        alert('먼저 모델을 로드하세요.');
        return;
    }

    recognizer.listen(result => {
        const scores = result.scores; // 각 클래스의 확률
        const labels = recognizer.wordLabels(); // 클래스 라벨

        // 가장 높은 확률을 가진 클래스 찾기
        const maxScore = Math.max(...scores);
        const maxIndex = scores.indexOf(maxScore);
        const predictedLabel = labels[maxIndex];

        document.getElementById('label').innerText = `예측: ${predictedLabel}`;
    }, {
        includeSpectrogram: true,
        probabilityThreshold: 0.75
    });

    isListening = true;
    document.getElementById('label').innerText = `음성 인식 중...`;
}

// 음성 인식 중지 함수 (선택 사항)
function stopListening() {
    if (recognizer && isListening) {
        recognizer.stopListening();
        isListening = false;
        document.getElementById('label').innerText = `음성 인식 중지됨.`;
    }
}

// 이벤트 리스너 설정
document.getElementById('start-btn').addEventListener('click', () => {
    if (isListening) {
        stopListening();
        document.getElementById('start-btn').innerText = '음성 인식 시작';
    } else {
        startListening();
        document.getElementById('start-btn').innerText = '음성 인식 중지';
    }
});
