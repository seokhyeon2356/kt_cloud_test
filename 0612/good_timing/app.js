const capacity = 45;
const peakCount = 36;

const trafficMetadata = {
  sourceName: "함안지방공사 운영 체육시설 현황",
  sourceProvider: "함안지방공사",
  sourceUrl: "https://www.data.go.kr/data/15010457/fileData.do",
  sourceMethod:
    "함안체육관 및 칠원국민체육센터의 수영장, 헬스장, GX 프로그램 등 월별 이용객 수와 일평균 이용객 수를 제공하는 공공데이터포털 파일데이터입니다.",
  appliedMethod:
    "정적 초안이므로 공공데이터 파일을 호출하지 않고, 체육시설 헬스장 이용 현황 데이터를 참고 문서로 둔 소형-중형 헬스장 더미 혼잡도 시나리오입니다.",
  sourceCategory: "문화체육관광 - 체육",
  sourceFormat: "CSV",
  sourceUpdateCycle: "연간",
  sourceTimeRange: "2020년 1월 - 2025년 12월",
  sourceColumnsUsedAsReference: ["헬스회원 방문", "헬스 일일 방문", "헬스 인원소계", "헬스 일평균 인원"],
  sourceLicense: "이용허락범위 제한 없음",
  capacity,
  peakTime: "19:00",
  peakCount,
  unit: "people",
  isDummyData: true,
  lastUpdated: "2026-06-12"
};

// 공공 체육시설의 헬스장 이용 현황을 참고한 시간대별 더미 카운트입니다.
const trafficData = [
  { time: "06:00", count: 7, relativeToPeak: 19, basis: "early-low" },
  { time: "07:00", count: 12, relativeToPeak: 33, basis: "morning-rise" },
  { time: "08:00", count: 17, relativeToPeak: 47, basis: "morning-peak" },
  { time: "09:00", count: 10, relativeToPeak: 28, basis: "post-commute-drop" },
  { time: "11:00", count: 5, relativeToPeak: 14, basis: "midday-low" },
  { time: "13:00", count: 8, relativeToPeak: 22, basis: "lunch-light" },
  { time: "15:00", count: 6, relativeToPeak: 17, basis: "afternoon-low" },
  { time: "17:00", count: 18, relativeToPeak: 50, basis: "after-work-rise" },
  { time: "18:00", count: 29, relativeToPeak: 81, basis: "evening-busy" },
  { time: "19:00", count: 36, relativeToPeak: 100, basis: "weekly-peak-reference" },
  { time: "20:00", count: 30, relativeToPeak: 83, basis: "evening-busy" },
  { time: "21:00", count: 18, relativeToPeak: 50, basis: "late-evening-drop" },
  { time: "22:00", count: 11, relativeToPeak: 31, basis: "late-night-light" },
  { time: "23:00", count: 6, relativeToPeak: 17, basis: "closing-hour-low" }
];

const zoneData = [
  { name: "프리웨이트", users: 10, limit: 14 },
  { name: "유산소", users: 8, limit: 12 },
  { name: "머신존", users: 7, limit: 12 },
  { name: "스트레칭", users: 3, limit: 8 }
];

const filters = {
  all: () => true,
  morning: (item) => parseInt(item.time, 10) < 12,
  afternoon: (item) => {
    const hour = parseInt(item.time, 10);
    return hour >= 12 && hour < 18;
  },
  evening: (item) => parseInt(item.time, 10) >= 18
};

const currentCount = trafficData[trafficData.length - 2].count;
const currentPercent = Math.round((currentCount / capacity) * 100);

const $ = (selector) => document.querySelector(selector);

function getLoadClass(percent) {
  if (percent >= 75) return "is-busy";
  if (percent >= 50) return "is-moderate";
  return "is-easy";
}

function getStatusLabel(percent) {
  if (percent >= 85) return "매우 붐빔";
  if (percent >= 65) return "붐비는 편";
  if (percent >= 40) return "보통";
  return "여유";
}

function renderCurrentStatus() {
  $("#currentCount").textContent = `${currentCount}명`;
  $("#capacityText").textContent = `정원 ${capacity}명 대비 ${currentPercent}%`;
  $("#gaugeValue").textContent = `${currentPercent}%`;
  $("#statusText").textContent = getStatusLabel(currentPercent);
  $("#gaugeRing").style.setProperty("--level", `${currentPercent}%`);
}

function renderBars(filterName = "all") {
  const chart = $("#barChart");
  const filteredData = trafficData.filter(filters[filterName]);
  const maxCount = Math.max(...trafficData.map((item) => item.count));

  chart.style.setProperty("--bar-count", filteredData.length);
  chart.innerHTML = filteredData
    .map((item) => {
      const percent = Math.round((item.count / capacity) * 100);
      const height = Math.max(8, Math.round((item.count / maxCount) * 100));

      return `
        <div class="bar-item ${getLoadClass(percent)}">
          <div class="bar-track">
            <div class="bar-fill" style="height:${height}%"></div>
          </div>
          <div class="bar-value">${item.count}명</div>
          <div class="bar-label">${item.time}</div>
        </div>
      `;
    })
    .join("");
}

function renderZones() {
  $("#zoneList").innerHTML = zoneData
    .map((zone) => {
      const percent = Math.round((zone.users / zone.limit) * 100);

      return `
        <div class="zone-row ${getLoadClass(percent)}">
          <div class="zone-top">
            <span>${zone.name}</span>
            <span>${percent}%</span>
          </div>
          <div class="zone-meter" aria-label="${zone.name} 포화도 ${percent}%">
            <span style="width:${percent}%"></span>
          </div>
          <div class="zone-meta">${zone.users}명 이용 중 / 권장 ${zone.limit}명</div>
        </div>
      `;
    })
    .join("");
}

function renderRecommendation() {
  const sorted = [...trafficData].sort((a, b) => a.count - b.count);
  const quiet = sorted[0];
  const peak = sorted[sorted.length - 1];

  $("#bestTime").textContent = `${quiet.time} 방문 추천`;
  $("#bestReason").textContent = `${quiet.time}은 ${quiet.count}명으로 오늘 기록 중 가장 낮습니다. ${peak.time} 전후는 ${peak.count}명까지 올라가 대기 가능성이 큽니다.`;
  $("#peakTime").textContent = peak.time;
  $("#quietTime").textContent = quiet.time;
}

function init() {
  renderCurrentStatus();
  renderBars();
  renderZones();
  renderRecommendation();

  $("#timeFilter").addEventListener("change", (event) => {
    renderBars(event.target.value);
  });
}

init();
