// ─────────────────────────────────────────────────────────────
// HTML 요소 참조 — getElementById로 한 번만 가져와 변수에 저장
// (매번 검색하지 않아 성능에 유리)
// ─────────────────────────────────────────────────────────────
const cityInput = document.getElementById('city');  // 도시명 입력창
const info      = document.getElementById('info');  // 결과 표시 영역


// ─────────────────────────────────────────────────────────────
// URL을 안전하게 조립하는 헬퍼 함수
// 백틱 템플릿 리터럴로 직접 만들면 ¤t 같은 문자열이
// HTML 엔티티(¤)로 오해받아 깨질 위험이 있음
// → 브라우저 내장 URL/URLSearchParams가 안전하게 처리
// ─────────────────────────────────────────────────────────────
function buildUrl(base, params) {
  const url = new URL(base);                         // 기본 URL 객체 생성
  Object.entries(params).forEach(([k, v]) =>        // 객체를 [키,값] 쌍 배열로
    url.searchParams.set(k, v)                          // 쿼리 파라미터로 추가
  );
  return url.toString();                              // 완성된 URL 문자열 반환
}


// ─────────────────────────────────────────────────────────────
// 메인 함수: 도시 검색 → 날씨 표시 (비동기 함수)
// async 키워드를 붙이면 함수 안에서 await를 사용할 수 있음
// ─────────────────────────────────────────────────────────────
async function getWeather() {
  // 입력값에서 앞뒤 공백 제거
  const city = cityInput.value.trim();

  // 빈 문자열이면 함수 종료 (아무 일도 하지 않음)
  if (!city) return;

  // 로딩 메시지 표시 (요청을 보내기 직전 사용자에게 진행 상태 알림)
  info.innerHTML = '<p class="loading">⏳ 날씨 정보를 가져오는 중...</p>';

  // try-catch: 네트워크 오류, 도시 못 찾음, 응답 형식 이상 등
  // 모든 예외를 한 곳에서 잡아 사용자에게 친절히 알림
  try {

    // ───── ① 1차 API 호출: 도시명 → 위경도 좌표 변환 ─────
    // Open-Meteo Geocoding API는 도시명으로 좌표를 찾아줌
    // language=ko로 결과를 한국어로 받음
    const geoUrl = buildUrl('https://geocoding-api.open-meteo.com/v1/search', {
      name: city,         // 검색할 도시명
      count: 1,           // 가장 일치하는 1개만 받기
      language: 'ko'     // 결과 표시 언어
    });

    // fetch로 HTTP 요청 → Response 객체 반환
    // .json()으로 본문을 JavaScript 객체로 파싱
    // (await 두 번 — fetch 응답 + json 파싱 모두 비동기)
    const geo = await (await fetch(geoUrl)).json();

    // 검색 결과가 없으면 직접 오류 발생 (catch 블록으로 점프)
    if (!geo.results || geo.results.length === 0) {
      throw new Error('도시를 찾을 수 없습니다');
    }

    // 첫 번째 결과에서 필요한 값만 구조 분해(Destructuring)로 추출
    // latitude=위도, longitude=경도, name=도시명, country=국가명
    const { latitude, longitude, name, country } = geo.results[0];


    // ───── ② 2차 API 호출: 위경도 → 현재 날씨 정보 ─────
    // current 파라미터에 원하는 항목을 콤마로 나열
    // temperature_2m: 지면 2m 높이의 기온 (사람이 느끼는 위치)
    // relative_humidity_2m: 상대습도(%)
    // wind_speed_10m: 지면 10m 높이의 풍속 (기상 표준)
    const wUrl = buildUrl('https://api.open-meteo.com/v1/forecast', {
      latitude: latitude,
      longitude: longitude,
      current: 'temperature_2m,relative_humidity_2m,wind_speed_10m'
    });

    // 날씨 데이터 받아오기
    const data = await (await fetch(wUrl)).json();

    // data.current가 없으면 응답 형식이 예상과 다른 것 → 오류 처리
    if (!data.current) throw new Error('날씨 정보를 가져올 수 없습니다');

    // 짧은 별칭 — 이후 c.temperature_2m처럼 간결하게 사용
    const c = data.current;


    // ───── ③ 화면에 결과 표시 ─────
    // 문자열 연결(+)로 HTML 조립 — 백틱 대신 사용해 인코딩 문제 회피
    // Math.round로 기온을 정수로 반올림 (소수점 제거)
    info.innerHTML =
      '<div class="city">'   + name + ', ' + country + '</div>' +
      '<div class="temp">'   + Math.round(c.temperature_2m) + '°C</div>' +
      '<div class="detail">' +
        '<span>💧 습도 ' + c.relative_humidity_2m + '%</span>' +
        '<span>💨 바람 ' + c.wind_speed_10m + ' km/h</span>' +
      '</div>';

  } catch (err) {
    // 어떤 단계에서든 오류가 나면 여기로 옴
    // throw new Error로 던진 메시지가 err.message에 담김
    info.innerHTML = '<p class="error">❌ ' + err.message + '</p>';
  }
}


// ─────────────────────────────────────────────────────────────
// 이벤트 등록
// ─────────────────────────────────────────────────────────────

// 검색 버튼 클릭 → getWeather 호출
document.getElementById('searchBtn').addEventListener('click', getWeather);

// 입력창에서 Enter 키 → getWeather 호출 (마우스 없이도 검색 가능)
cityInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') getWeather();
});


// ─────────────────────────────────────────────────────────────
// 페이지 로드 시 자동 검색 — 빈 화면 대신 기본 도시 날씨가 보임
// (HTML의 input 기본값이 'Seoul'이므로 서울 날씨가 자동 표시됨)
// ─────────────────────────────────────────────────────────────
getWeather();