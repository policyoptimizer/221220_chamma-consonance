let recognizer;
let currentTeam = null;

// 모델 로드 함수
async function loadModel(team) {
    // 기존에 로드된 모델이 있으면 중지하고 해제
    if (recognizer) {
        recognizer.stopListening();
        recognizer.dispose();
    }

    currentTeam = team;
    recognizer = speechCommands.create(
        'BROWSER_FFT',
        undefined,
        `${team}/model.json`,
        `${team}/metadata.json`
    );

    try {
        await recognizer.ensureModelLoaded();
        console.log(`${team} 모델 로드 완료`);
        document.getElementById('start-btn').disabled = false;
        document.getElementById('label').innerText = `${team} 모델 로드 완료. 음성 인식을 시작하세요.`;
    } catch (error) {
        console.error(`모델 로드 실패: ${error}`);
        document.getElementById('label').innerText = `모델 로드 실패: ${error}`;
    }
}

// 음성 인식 시작 함수
async function startListening() {
    if (!recognizer) {
        alert('먼저 모델을 로드하세요.');
        return;
    }

    document.getElementById('label').innerText = '음성 인식 중...';

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
}

// 이벤트 리스너 등록
document.getElementById('start-btn').addEventListener('click', startListening);

