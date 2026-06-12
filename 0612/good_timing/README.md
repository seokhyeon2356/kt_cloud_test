# Good Timing

헬스장 출입 인증 번호 카운트를 가정해 현재 인원, 포화도, 시간대별 혼잡도, 추천 방문 시간을 보여주는 한 화면짜리 정적 웹사이트 초안입니다.

데이터는 실제 API나 데이터베이스를 쓰지 않고 `app.js`의 더미 데이터만 사용합니다. 공식 참고 문서는 공공데이터포털의 `함안지방공사 운영 체육시설 현황`입니다. 해당 데이터셋은 함안체육관 및 칠원국민체육센터의 수영장, 헬스장, GX 프로그램 등 월별 이용객 수와 일평균 이용객 수를 제공합니다.

이 초안의 시간대별 사용자 수는 공공데이터 파일을 직접 호출한 실제 집계값이 아니라, 헬스장 이용 현황이 포함된 공공데이터를 참고 문서로 두고 만든 정적 더미 시나리오입니다. 실제 서비스에서는 헬스장 입장 시 찍는 본인 인증 번호나 출입 카운트 기록을 시간대별로 집계해 `count` 값을 대체하는 구조를 가정합니다.

Reference: https://www.data.go.kr/data/15010457/fileData.do

## Data metadata

`app.js`에는 시간대별 사용자 수와 함께 `trafficMetadata`를 저장했습니다.

- `sourceName`: 참고한 공식 문서 이름
- `sourceProvider`: 공식 데이터 제공기관
- `sourceUrl`: 공식 문서 URL
- `sourceMethod`: 공식 데이터셋 설명
- `appliedMethod`: 이 초안에서 더미 카운트로 환산한 방식
- `sourceCategory`: 공공데이터포털 분류
- `sourceFormat`: 파일 형식
- `sourceUpdateCycle`: 데이터 업데이트 주기
- `sourceTimeRange`: 데이터 시간 범위
- `sourceColumnsUsedAsReference`: 헬스장 이용 현황 참고 컬럼
- `sourceLicense`: 공식 데이터 라이선스
- `capacity`: 화면에서 쓰는 가정 정원
- `peakTime`: 피크 기준 시간
- `peakCount`: 피크 기준 사용자 수
- `unit`: 사용자 수 단위
- `isDummyData`: 실제 데이터가 아닌 더미 데이터 여부
- `lastUpdated`: 메타데이터 수정일

시간대별 `trafficData`는 아래 필드를 포함합니다.

- `time`: 표시 시간
- `count`: 화면에 표시할 더미 사용자 수
- `relativeToPeak`: 이 초안에서 피크 시간 `19:00`을 `100`으로 둔 상대 혼잡도
- `basis`: 해당 시간대 카운트를 정한 내부 기준 라벨

현재 더미 데이터는 공공데이터포털의 체육시설 헬스장 이용 현황 자료를 공식 참고 문서로 사용했다는 메타데이터를 포함합니다. 다만 이 페이지는 백엔드와 API를 쓰지 않는 정적 초안이므로, `count` 값은 공공데이터 원본에서 내려받은 시간대별 방문자 수가 아니라 소형-중형 헬스장 정원 `45명` 안에서 만든 예시값입니다.

실제 운영 전환 시에는 `trafficData`의 `count`를 아래와 같은 출입 카운트 집계값으로 바꾸면 됩니다.

- 입장 인증 번호 태그 1회 = 현재 입장 카운트 +1
- 퇴장 태그 또는 운영 정책상 체류 시간 만료 = 현재 입장 카운트 -1
- 시간대별 누적 입장/체류 인원 = 그래프의 `count`
- 정원 대비 비율 = 포화도 게이지와 혼잡 상태

| Time | Count | Relative to peak | Basis |
| --- | ---: | ---: | --- |
| 06:00 | 7 | 19 | early-low |
| 07:00 | 12 | 33 | morning-rise |
| 08:00 | 17 | 47 | morning-peak |
| 09:00 | 10 | 28 | post-commute-drop |
| 11:00 | 5 | 14 | midday-low |
| 13:00 | 8 | 22 | lunch-light |
| 15:00 | 6 | 17 | afternoon-low |
| 17:00 | 18 | 50 | after-work-rise |
| 18:00 | 29 | 81 | evening-busy |
| 19:00 | 36 | 100 | weekly-peak-reference |
| 20:00 | 30 | 83 | evening-busy |
| 21:00 | 18 | 50 | late-evening-drop |
| 22:00 | 11 | 31 | late-night-light |
| 23:00 | 6 | 17 | closing-hour-low |

## Requirements

- VS Code 터미널
- Python 3
- 최신 브라우저
- 선택 사항: Node.js

외부 CDN, 백엔드, 데이터베이스, 로그인, 유료 API, 클라우드 배포는 필요하지 않습니다.

## Start command

```bash
cd /Users/a123/github/kt_cloud_test/0612/good_timing
python3 -m http.server 8000
```

브라우저에서 아래 주소를 엽니다.

```text
http://localhost:8000
```

## Check command

Node.js가 설치되어 있으면 JavaScript 문법을 확인할 수 있습니다.

```bash
cd /Users/a123/github/kt_cloud_test/0612
node --check good_timing/app.js
```

서버 응답을 확인하려면 다른 터미널에서 실행합니다.

```bash
curl -I http://localhost:8000/index.html
curl -I http://localhost:8000/style.css
curl -I http://localhost:8000/app.js
```

## Expected result

- 페이지 상단에 `Good Timing` 대시보드가 표시됩니다.
- 현재 입장 인원은 `11명`, 정원 대비 포화도는 `24%`로 표시됩니다.
- 시간대별 그래프에서 `19:00`이 가장 붐비는 시간으로 표시됩니다.
- 추천 방문 시간은 `11:00`으로 표시됩니다.
- 시간대 필터를 `오전`, `오후`, `저녁`으로 바꾸면 막대 그래프가 해당 구간만 보여줍니다.

## Stop instruction

서버를 실행한 VS Code 터미널에서 아래 키를 누릅니다.

```text
Ctrl + C
```

## Troubleshooting

포트가 이미 사용 중이면 다른 포트로 실행합니다.

```bash
python3 -m http.server 8080
```

접속 주소도 포트에 맞게 바꿉니다.

```text
http://localhost:8080
```

`python3: command not found`가 나오면 Python 3 설치 여부를 확인합니다.

```bash
python3 --version
```

화면은 열리지만 스타일이나 그래프가 보이지 않으면 `index.html`, `style.css`, `app.js`가 모두 `good_timing` 폴더 안에 있는지 확인합니다.

`node: command not found`가 나오면 Node.js가 없는 상태입니다. 실행에는 Node.js가 필요하지 않고, `node --check` 검증에만 필요합니다.
