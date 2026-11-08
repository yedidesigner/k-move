import { useState } from "react";
import { NotebookLectureViewer } from "@/components/NotebookLectureViewer";

const STUDENT_FOLDER = "https://drive.google.com/drive/folders/1RXyFhYBKaCjiC9HCiHHao9Fta2VoG2xM";
const INSTRUCTOR_FOLDER = "https://drive.google.com/drive/folders/1C_GKLc2eNHEUlNpl9x_zr6UH6yOw4Wi0";
const resources = [
  { title: "학생용 실습 교재", detail: "50쪽 · 화면 설명, 조작 순서, 실습과 검수", type: "PDF", url: "https://drive.google.com/file/d/1iLQZG9SAXK87I1yuf6JjmuHT2B-FeP3m/view" },
  { title: "학생용 실습 패키지", detail: "기본 소스 6개 · 선택 소스 2개 · 프롬프트 18개 · 제출 템플릿", type: "ZIP · 다운로드", url: "https://drive.google.com/file/d/1kC2W5HVgnP_9UqGBId1qRz-z0irbH2qp/view" },
];

const homeItems = [
  ["로고 · 전체 · 내 노트북", "서비스 이름과 현재 선택된 탭을 확인합니다. 내 프로젝트는 구체적인 이름으로 구분하고, 이미 만든 노트북 카드를 열어 작업을 이어갑니다. '전체'와 '내 노트북'의 실제 포함 범위는 본인 계정에서 비교합니다."],
  ["둘러보기 · 공유 문서함 · 컬렉션", "공개 자료 탐색, 공유 자료 확인, 주제별 정리에 관련된 메뉴입니다. 공유 여부와 편집 권한은 별개입니다. 첨부 화면에서는 내부 메뉴가 열려 있지 않으므로 컬렉션 생성 방식과 세부 권한을 추정하지 않고 실제 화면에서 확인합니다."],
  ["노트북 검색 · 그리드/목록 보기", "상단 검색창에서 프로젝트명을 찾아봅니다. 사각형 격자와 가로줄 아이콘은 보기 방식의 차이를 비교하는 지점입니다. 검색이 소스 본문까지 대상으로 하는지는 확인 없이 단정하지 않습니다."],
  ["설정 · PRO · Google 앱 · 프로필", "설정 아이콘과 현재 로그인 계정을 확인합니다. PRO 표시는 모든 기능의 무제한 사용을 뜻하지 않습니다. 개인·기관 계정에 따라 제공 메뉴가 다를 수 있으므로 실습 전 현재 계정에서 확인합니다."],
  ["추천 노트북 · 모두 보기", "카드의 제작자/제공자, 제목, 표시 날짜, 소스 개수, 공개 관련 아이콘과 더보기를 구분합니다. 추천 노트북이 곧 내 소유 자료라는 뜻은 아닙니다. 표시 날짜의 정확한 의미와 더보기 항목은 실제 화면에서 확인합니다."],
  ["최근 노트북 · 정렬 · 카드", "대표 이모지, 제목, 표시 날짜, 소스 개수, 더보기 메뉴로 노트북을 구분합니다. 최근 노트북 제목 옆 정렬 아이콘도 확인합니다. K-MOVE 카드를 예로 사용하며, 교육 화면에서는 다른 개인 프로젝트명과 프로필을 가립니다."],
  ["+ 새 노트북", "홈 화면 오른쪽 버튼으로 시작합니다. 제목을 프로젝트명으로 바꾸고 소스를 추가한 뒤, 세 패널의 위치와 소스가 정상적으로 들어왔는지 확인합니다. 버튼을 눌렀을 때 보이는 창은 본인 계정의 실제 안내를 따릅니다."],
];

const workspaceItems = [
  ["상단 작업 메뉴", "노트북 제목, + 노트북 만들기, 공유, 더보기, 설정, PRO, Google 앱과 프로필을 확인합니다. 제목 영역에서 이름 변경이 가능한지 확인하고 'K-MOVE | MORU 리디자인 | 이름'처럼 저장합니다. 공유 시 수신자와 읽기/편집 범위를 별도로 확인합니다."],
  ["왼쪽 · 출처", "+ 소스 추가는 분석에 사용할 자료를 넣는 시작점입니다. + 메모 만들기는 조사 기록을 남기는 작업과 구분합니다. 메모가 자동으로 검증된 원본 자료가 되는 것은 아닙니다. 소스로 전환하거나 다시 활용하는 경로는 실제 제공 메뉴에서 확인합니다."],
  ["왼쪽 · 웹 검색과 Research", "검색어 영역, '웹' 선택 메뉴, 'Fast Research' 선택 메뉴, 실행 화살표를 구분합니다. 먼저 검색 범위와 목적을 정하고 결과의 작성자·날짜·본문을 검토한 뒤 가져옵니다. Deep Research가 제공될 때만 심층 조사 실습을 수행하고, 없으면 직접 검증한 자료로 대체합니다."],
  ["가운데 · 시작 화면", "'노트북을 시작해 보세요'와 '새로운 주제에 관해 알아보기 / 새로운 항목 만들기 / 프로젝트 진행하기'는 시작을 돕는 선택지입니다. 제공된 화면은 소스 0개 상태입니다. 아직 추가하지 않은 실습 자료를 근거로 답했다고 판단하지 않습니다."],
  ["가운데 · 질문 입력창", "입력창의 설정 아이콘, '질문하거나 창작하세요', 소스 개수와 전송 화살표를 확인합니다. 자료 처리 완료 후 선택한 소스와 질문의 범위를 일치시킵니다. 설정 아이콘의 상세 옵션은 현재 계정에서 열어 확인합니다."],
  ["가운데 · 답변과 인용", "답변의 인용을 열어 원문이 실제 주장을 지지하는지 확인합니다. 사실·해석·설계 가설을 구분하고, 없는 정보는 '확인 불가'로 남깁니다. 여러 자료를 선택했다는 사실만으로 모든 자료가 답변에 반영되었다고 보지 않습니다."],
  ["오른쪽 · 스튜디오", "첨부 화면의 9개 생성 버튼과 결과 저장 영역을 구분합니다. 위쪽 안내 배너의 단계별 제작 기능은 실제 계정에서 열리는 옵션을 확인한 뒤 사용합니다. 원본 소스를 바꿨다면 기존 결과도 다시 대조하고 필요한 결과물을 재생성합니다."],
  ["패널 접기 · 세 가지 화면 상태", "출처와 Studio 상단의 패널 아이콘 위치를 확인합니다. 빈 화면 → 소스와 인용이 있는 작업 화면 → 생성 결과가 있는 화면의 차이를 직접 관찰합니다. 수업에서 제공하지 않은 실행 화면을 실제 캡처처럼 꾸며서 사용하지 않습니다."],
];

const studioItems = [
  { name: "AI 오디오 오버뷰", use: "인터뷰와 요구사항을 듣고 핵심 쟁점·반례를 검토합니다.", work: "관련 소스를 선택하고 오디오 버튼을 엽니다. 제공되는 언어·형식·맞춤 지시 옵션을 확인한 뒤 생성하고 원문과 함께 청취합니다.", result: "오디오 + 숫자·고유명사·인용 오류 점검 메모", check: "음성이 자연스럽더라도 발언과 수치가 정확하다는 뜻은 아닙니다. 생성 불가 시 읽기용 요약으로 대체합니다.", prompt: "P15" },
  { name: "슬라이드 자료", use: "검증한 리서치를 클라이언트용 디자인 제안으로 구성합니다.", work: "P10으로 먼저 8장 스토리보드를 만들고 P11을 맞춤 지시에 활용합니다. 발표용/상세 설명용 형식, 언어와 분량은 계정에서 제공되는 옵션만 설정합니다.", result: "8장 목표의 제안 초안 + 출처 추적표", check: "장수·편집·내보내기 형식은 실제 결과와 메뉴로 확인합니다. PPTX를 내려받을 수 있어도 모든 글자·도형이 개별 편집 가능하다고 단정하지 않습니다.", prompt: "P10 · P11 · P14" },
  { name: "동영상 개요", use: "브랜드 맥락과 리디자인 필요성을 장면별로 설명합니다.", work: "S01~S03을 선택하고 핵심 메시지·대상·언어를 정합니다. 제공되는 설정으로 생성한 후 자막, 음성, 장면과 원문의 일치 여부를 검토합니다.", result: "영상 또는 장면별 스토리보드", check: "없는 제품 장면·고객 실적을 사실처럼 만들지 않습니다. 기능 미제공 시 텍스트 스토리보드를 제출합니다.", prompt: "P16" },
  { name: "마인드맵", use: "브랜드·사용자·콘텐츠의 개념과 관계를 살펴봅니다.", work: "소스를 선택하고 맵을 생성한 뒤 주요 가지를 펼쳐 관계를 검토합니다. 필요한 정보와 사용자 과업을 P08 표로 다시 연결합니다.", result: "개념 관계도 + 정보구조 후보", check: "개념 분류도는 최종 사이트맵이나 검증된 사용자 이동 경로가 아닙니다.", prompt: "P08" },
  { name: "보고서", use: "UX 리서치, 문제 정의, 경쟁사 분석과 디자인 브리프를 정리합니다.", work: "목적에 맞는 형식 또는 맞춤 지시를 선택합니다. 목표→근거→해석→제안→검증 계획의 순서로 초안을 만들고 핵심 인용을 확인합니다.", result: "MORU LIVING 디자인 브리프", check: "그럴듯한 KPI나 성과를 추가하지 않습니다. 원본 자료와 AI가 작성한 요약의 출처 수준을 구분합니다.", prompt: "P07" },
  { name: "플래시카드", use: "사실·해석·인사이트·가설과 데이터 용어를 복습합니다.", work: "선택 실습 소스 S08을 넣고 카드 기능을 엽니다. 제공되는 개수·난이도 옵션을 확인하고 앞면 질문을 먼저 답한 뒤 뒷면과 비교합니다.", result: "개념 카드 + 헷갈린 용어 기록", check: "짧아진 정의에서 중요한 조건이 빠졌는지 확인합니다. S08 없는 상태에서 자료 밖 지식을 정답으로 만들지 않습니다.", prompt: "P17" },
  { name: "퀴즈", use: "출처 오류와 잘못된 디자인 의사결정을 구별합니다.", work: "S08을 기준으로 사례형 문항을 요청하고, 문제를 푼 뒤 정답과 해설을 원문 정의와 대조합니다.", result: "사례형 퀴즈 + 오답 이유", check: "정답이 둘이거나 자료에 없는 조건이 필요한 문항은 수정합니다.", prompt: "P18" },
  { name: "인포그래픽", use: "검산한 설문 결과의 가장 중요한 패턴을 한 장으로 전달합니다.", work: "P06으로 집계를 먼저 확인한 뒤 P09로 네 항목 비교를 요청합니다. 제공되는 방향·상세도·스타일 옵션을 목적에 맞게 고릅니다.", result: "단일응답 빈도·비율 비교 시각자료", check: "숫자·단위·분모·막대 길이·한글을 모두 확인합니다. 가상 데이터 n=24이며 10/24를 과반수라고 표현하지 않습니다.", prompt: "P06 · P09" },
  { name: "데이터 표", use: "경쟁사와 요구사항을 같은 기준의 열로 구조화합니다.", work: "표의 열과 분석 범위를 먼저 명시하고 생성합니다. Google Sheets 내보내기 메뉴가 보이면 내보낸 결과의 행·열·근거를 다시 확인합니다.", result: "경쟁사 비교표 또는 요구사항 표", check: "자료에 없는 정보와 실제 기능 부재를 구분합니다. 내보내기가 없으면 채팅 표와 제공 CSV 템플릿으로 대체합니다.", prompt: "P02 · P05 · P06" },
];

const prompts = [
  { id: "P01", title: "자료 목록과 누락 점검", sources: "S01~S06", text: "이 노트북의 S01~S06 자료만 검토해 줘. 소스 ID, 제목, 문서 날짜/버전, 자료의 목적, 확인 가능한 내용, 빠진 정보를 표로 정리해 줘. 문서에 없는 날짜·작성자·권한을 추정하지 마. 정상적으로 내용을 읽지 못한 소스는 확인 불가로 표시해 줘.", check: "파일명 표시와 실제 본문 인식을 구분합니다." },
  { id: "P02", title: "요구사항 추출", sources: "S02 + S03", text: "S02와 S03만 사용해 웹사이트 요구사항을 분석해 줘. 표의 열은 요구사항, 클라이언트/사용자 구분, 근거 문장, 소스 ID와 항목/참여자 ID, 확정/가설, 확인 질문으로 해 줘. 자료에 없는 사용자 비율·성과·수치는 만들지 마. 서로 충돌하는 요구는 조용히 합치지 말고 그대로 남겨 줘.", check: "주요 주장 3개를 원문과 대조합니다." },
  { id: "P03", title: "인터뷰 주제 코딩", sources: "S03", text: "S03의 인터뷰를 분석해 줘. 참여자 ID, 발화의 정확한 발췌, 행동 맥락, 잠정 주제, 해석, 반례/추가 질문을 표로 작성해 줘. 참여자 한 명을 같은 주제에서 중복 집계하지 마. 원문을 바꾸어 쓴 문장은 직접 인용처럼 따옴표로 표시하지 마. 주제별 빈도를 쓰면 포함한 참여자 ID를 함께 적어 줘.", check: "직접 인용의 원문과 참여자 중복 집계를 점검합니다." },
  { id: "P04", title: "인사이트와 설계 가설", sources: "S02 + S03 + S06", text: "S02, S03, S06을 바탕으로 디자인 인사이트 3개를 제안해 줘. 각 항목은 관찰된 사실, 소스 ID/근거 위치, 해석, 인사이트, 설계 가설, 반례, 확인할 사용자 과업으로 나누어 줘. 이미 효과가 입증된 것처럼 쓰지 마. 인터뷰 의견을 전체 고객 특성으로 일반화하지 마.", check: "설계 가설을 검증된 효과처럼 쓰지 않습니다." },
  { id: "P05", title: "경쟁사 비교표", sources: "S04", text: "S04만 사용해 가상 경쟁사 3곳을 비교해 줘. 열은 업체, 치수 정보, 소재 정보, 배송 안내 위치, 반품 안내 위치, 직접 인용 가능한 근거 ID, 확인 불가 항목으로 해 줘. 빈칸을 외부 지식으로 채우지 마. 자료에 없다는 것과 실제 기능이 없다는 것을 구분해 줘.", check: "직접 방문·시각 평가한 것처럼 설명하지 않습니다." },
  { id: "P06", title: "설문 빈도 검산", sources: "S05", text: "S05의 응답 원본을 분석해 줘. 먼저 전체 행 수, 고유 respondent_id 수, 결측값을 확인해 줘. primary_barrier는 단일 응답이므로 항목별 빈도와 전체 유효응답 수를 분모로 한 비율을 계산해 줘. 소수점 한 자리로 표시하고 계산식, 분모, 반올림에 따른 합계 차이를 함께 적어 줘. 가상 데이터 n=24라고 표시하고 모집단을 추정하지 마.", check: "원본 24행, 유효응답 수와 합계를 직접 검산합니다." },
  { id: "P07", title: "디자인 브리프", sources: "S01~S06", text: "당신은 디자인 리서치를 정리하는 실무 디자이너다. S01~S06의 근거로 MORU LIVING 웹사이트 리디자인 브리프를 작성해 줘. 순서는 목표, 핵심 과업, 확인된 문제, 근거, 설계 원칙, 필수 콘텐츠, 제외 범위, 확인할 질문, 검증 계획이다. 사실과 제안을 분리하고 각 핵심 주장에 소스 ID와 근거 위치를 붙여 줘. 제공되지 않은 KPI 실적과 사용자 특성은 만들지 마.", check: "S02의 승인된 범위와 제외 조건을 대조합니다." },
  { id: "P08", title: "정보구조 후보", sources: "S02 + S03 + S06", text: "S02, S03, S06을 근거로 사용자 과업, 필요한 정보, 제안 페이지, 내비게이션 이름, 근거, 검증 과업 표를 작성해 줘. 개념 마인드맵을 그대로 사이트 메뉴로 복사하지 마. 후보 구조임을 명시하고 현재 자료로 결정할 수 없는 항목은 보류해 줘.", check: "페이지명과 추상적인 가치 단어를 구분합니다." },
  { id: "P09", title: "한 장 인포그래픽", sources: "S05 + 검증한 빈도표", text: "S05에서 검증한 단일응답 빈도표만 사용해 구매 장애 요인 비교 인포그래픽을 만들어 줘. 네 항목을 같은 기준선의 수평 막대로 표현하고 빈도와 비율을 모두 표시해 줘. 제목은 가장 큰 패턴 하나를 설명하되 10/24를 과반수라고 부르지 마. 가상 데이터, n=24, 단일 응답, 반올림 기준을 표시해 줘. 흰 배경, 검정 글자, 파란 강조색 1종을 사용해 줘.", check: "분모·막대 길이·숫자·한글을 확인합니다." },
  { id: "P10", title: "8장 발표 스토리보드", sources: "S01~S06 + 검증한 브리프", text: "검증한 브리프를 바탕으로 클라이언트용 리디자인 제안 발표자료 8장을 기획해 줘. 각 장은 주장형 제목, 핵심 메시지 1개, 근거 ID/위치, 권장 시각 형식, 발표자 설명, 검증할 항목으로 정리해 줘. 흐름은 제안 요약, 목표, 사용자 근거, 우선순위, 정보구조, 설계 방향, 검증 계획, 다음 결정으로 해 줘. 성과 수치를 만들지 마.", check: "한 장에 한 메시지와 추적 가능한 근거를 배치합니다." },
  { id: "P11", title: "Studio 슬라이드 생성", sources: "검증한 브리프 + 원본", text: "디자인 클라이언트를 대상으로 하는 MORU LIVING 웹사이트 리디자인 제안 슬라이드를 한국어 8장으로 만들어 줘. 각 장은 주장 1개와 그 근거를 중심으로 구성해 줘. 흰 배경, 검정 본문, 뉴트럴 그레이, 파란 강조색 1종을 사용하고 제목·시각 근거·보조 설명의 위계를 명확히 해 줘. 본문을 작게 줄이지 말고 내용을 나누어 줘. 가상 프로젝트임을 명시하고 출처 ID·표본·단위를 표시해 줘. 확인되지 않은 수치나 최종 UI를 꾸며내지 마.", check: "장수와 설정 준수는 생성 후 직접 확인합니다." },
  { id: "P12", title: "반론과 약한 근거 찾기", sources: "원본 + 제안 초안", text: "내 제안을 지지하는 역할이 아니라 비판적으로 검토하는 역할을 수행해 줘. 원본 소스와 대조해 근거 부족, 인용 불일치, 분모 오류, 과도한 일반화, 범위 이탈, 개인정보 문제를 찾아 줘. 표는 문제 문장, 문제 유형, 원본 근거, 심각도, 수정 제안으로 작성해 줘. 확실히 판단할 수 없으면 확인 필요라고 표시해 줘.", check: "AI의 비판도 원본 근거로 재검증합니다." },
  { id: "P13", title: "문서 버전 충돌", sources: "S02 + S07 · 선택 심화", text: "S02와 S07을 비교해 달라진 요구사항을 찾아 줘. 열은 항목, v1 내용, v2 내용, 문서 날짜, 승인/대체 관계, 현재 적용할 조건, 판단 근거, 추가 확인 질문이다. 단순히 최신 날짜라는 이유만으로 선택하지 마. 각 문서의 승인 상태와 이전 문서 대체 문구를 근거로 판단해 줘.", check: "승인·대체 관계를 확인하고 조건 혼용을 찾습니다." },
  { id: "P14", title: "출처 추적표", sources: "제안 초안 + 원본", text: "제안자료의 핵심 주장마다 claim_id, 주장 문장, 소스 ID, 원문 위치, 직접 근거, 사실/해석/가설, 확인 상태를 표로 작성해 줘. AI가 작성한 요약 메모를 1차 자료로 취급하지 마. 인용번호를 임의로 만들지 말고 실제 확인 가능한 인용 또는 원문 위치를 적어 줘.", check: "다른 사람이 같은 원문을 다시 찾을 수 있어야 합니다." },
  { id: "P15", title: "오디오 검토", sources: "S02 + S03", text: "클라이언트와 디자이너가 리서치를 검토하는 관점으로 설명해 줘. 사용자 문제 3개와 반례를 균형 있게 다루고, 제안은 아직 검증 전 가설이라고 밝혀 줘. 원문에 없는 수치·고유명사·사용자 발언은 만들지 마. 청자가 확인해야 할 질문으로 마무리해 줘.", check: "발음·숫자·직접 인용을 듣고 확인합니다." },
  { id: "P16", title: "동영상 개요 기획", sources: "S01 + S02 + S03", text: "가상 브랜드 MORU LIVING의 리디자인 배경을 설명하는 영상 개요를 구성해 줘. 브랜드 맥락, 구매 판단의 어려움, 근거, 설계 가설, 검증 계획 순서로 설명해 줘. 원본 자료에 없는 실제 제품 장면이나 고객 실적을 사실처럼 표현하지 마. 한국어 설명이 가능한 설정을 사용하고 장면마다 하나의 핵심 메시지를 유지해 줘.", check: "생성 장면과 기획안, 한글·음성을 대조합니다." },
  { id: "P17", title: "플래시카드", sources: "S08 · 선택 실습", text: "S08 수업용 용어집만 사용해 앞면에는 질문, 뒷면에는 정의와 짧은 디자인 사례가 있는 플래시카드를 만들어 줘. 사실·해석·인사이트·가설, 출처 검증, 표본과 분모를 구별하게 해 줘. 정의를 짧게 쓰되 원문의 중요한 조건을 생략하지 마.", check: "원본 정의의 의미와 조건을 보존합니다." },
  { id: "P18", title: "사례형 퀴즈", sources: "S08 · 선택 실습", text: "S08만 사용해 디자인 실무 판단에 관한 사례형 퀴즈를 만들어 줘. 인용은 있지만 주장을 지지하지 않는 경우, 10/24를 과반수로 부르는 경우, 마인드맵을 최종 사이트맵으로 확정하는 경우, 가설을 성과로 쓰는 경우를 포함해 줘. 정답이 하나로 정해지도록 조건을 명확히 하고 정답과 오답 이유를 설명해 줘.", check: "복수 정답이나 자료 밖의 조건이 필요한 문항을 수정합니다." },
];

const steps = [
  { title: "노트북과 소스 준비", text: "학생용 ZIP을 다운로드하고 압축을 풉니다. 노트북 이름을 정하고 S01~S06 기본 자료를 추가합니다. 동일한 내용의 PDF/TXT 또는 CSV/TXT 대체본은 중복으로 넣지 않습니다. S05 데이터 설명서를 함께 읽습니다.", prompt: "P01", output: "소스 목록 · 본문 인식 확인 · 누락 정보" },
  { title: "근거를 추적하며 분석", text: "요구사항과 인터뷰 발화를 분리하고, 경쟁사를 같은 열로 비교합니다. 설문은 원본 행·고유 응답자·결측·단일응답 분모를 검산합니다. 중요한 주장에는 원문 위치를 남깁니다.", prompt: "P02 · P03 · P05 · P06", output: "요구사항 표 · 인터뷰 주제표 · 비교표 · 검산 기록" },
  { title: "디자인 전략으로 연결", text: "관찰된 사실 → 해석 → 인사이트 → 설계 가설 → 검증 과업의 흐름으로 정리합니다. 브리프의 필수·제외 범위를 확인하고 사용자 과업을 정보구조 후보에 연결합니다.", prompt: "P04 · P07 · P08", output: "디자인 브리프 · 정보구조 후보" },
  { title: "Studio 결과물 제작", text: "보고서·데이터 표·마인드맵으로 분석을 정리하고, 검산한 숫자로 인포그래픽을 만듭니다. 8장 스토리보드를 먼저 검토한 뒤 발표자료를 생성합니다. 기능 제한 시 템플릿으로 같은 메시지와 근거를 구성합니다.", prompt: "P09 · P10 · P11", output: "시각화 초안 · 8장 제안자료 또는 동등한 스토리보드" },
  { title: "검수하고 제출", text: "원본과 초안을 대조해 근거 오류·범위 이탈·과도한 일반화를 고칩니다. 시각적 위계, 글자 크기, 대비, 정렬과 잘림도 점검합니다. LMS 과제&피드백의 3회차에 결과 파일 또는 접근 가능한 링크를 제출합니다.", prompt: "P12 · P14 / 선택 심화 P13", output: "출처 추적표 · QA 수정 기록 · 최종 제안" },
];

const checks = [
  "기본 소스 6개의 실제 본문을 확인했고 대체 파일을 중복 업로드하지 않았다.",
  "핵심 주장마다 원문 위치를 남겼고 사실·해석·가설을 구분했다.",
  "설문 n=24, 유효응답 분모, 단일응답과 반올림 기준을 확인했다.",
  "브리프에 목표·필수 콘텐츠·제외 범위·확인 질문·검증 계획이 있다.",
  "발표자료의 각 장은 하나의 메시지와 근거를 중심으로 구성했다.",
  "제목·본문·보조 정보의 위계, 대비, 여백과 텍스트 잘림을 확인했다.",
  "가상 프로젝트임을 표시하고 없는 성과·인용·사용자 특성을 만들지 않았다.",
  "소스 목록, 근거표, 브리프, 제안자료, QA 기록을 제출할 준비가 되었다.",
];

function PromptCard({ item }: { item: (typeof prompts)[number] }) {
  const [message, setMessage] = useState("");
  const copy = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(item.text);
      setMessage("복사했습니다. 선택 소스를 확인한 뒤 붙여넣으세요.");
    } catch {
      setMessage("자동 복사가 제한되었습니다. 아래 문장을 직접 선택해 복사하세요.");
    }
  };
  return (
    <details id={`notebook-${item.id}`} className="scroll-mt-6 border-b border-neutral-200">
      <summary className="cursor-pointer px-4 py-4 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
        <span className="mr-3 font-mono text-blue-700">{item.id}</span>{item.title}
      </summary>
      <div className="px-4 pb-5">
        <p className="text-xs leading-6 text-neutral-600">선택 소스 · {item.sources}</p>
        <p className="mt-2 select-text whitespace-pre-wrap break-keep border-l-2 border-neutral-300 bg-neutral-50 p-4 text-sm leading-7">{item.text}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="button" onClick={copy} className="min-h-11 border border-neutral-400 px-4 text-sm font-semibold hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">프롬프트 복사</button>
          <p className="text-xs leading-6 text-neutral-600">검수 · {item.check}</p>
        </div>
        <p role="status" className="mt-2 text-xs leading-6 text-blue-800">{message}</p>
      </div>
    </details>
  );
}

/** Student-facing content only. Storage RLS protects slides; Drive protects instructor files. */
export function WeekThreeNotebook({ isInstructor }: { isInstructor: boolean }) {
  const [checked, setChecked] = useState<string[]>([]);
  return (
    <section id="notebook-module" aria-labelledby="notebook-module-title" className="mt-6 min-w-0 border border-neutral-200 bg-white">
      <header className="border-b border-neutral-200 p-5 sm:p-8">
        <p className="text-xs font-bold tracking-widest text-blue-700">SESSION 03 · DESIGN RESEARCH</p>
        <h2 id="notebook-module-title" className="mt-3 break-keep text-2xl font-bold leading-tight tracking-tight sm:text-3xl">Gemini Notebook으로<br />근거 있는 디자인 제안 만들기</h2>
        <p className="mt-4 max-w-2xl break-keep text-sm leading-7 text-neutral-700">NotebookLM으로 익숙한 도구를 첨부된 Gemini Notebook 화면 기준으로 학습합니다. 자료를 요약하는 데서 끝내지 않고, 출처 검증부터 디자인 브리프와 프레젠테이션까지 연결합니다.</p>
        <p className="mt-4 border-l-2 border-blue-700 pl-3 text-sm font-semibold leading-7">자료 입력 → 이해·분석 → 디자인 인사이트 → 제안 → 검증</p>
        <nav aria-label="Notebook 학습 영역 바로가기" className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
          {[["notebook-resources", "수업 자료"], ["notebook-interface", "화면 해설"], ["notebook-studio", "Studio 9개"], ["notebook-workshop", "실습"], ["notebook-prompts", "프롬프트 18개"], ["notebook-review", "제출 점검"]].map(([id, label]) => (
            <a key={id} href={`#${id}`} className="inline-flex min-h-11 items-center border border-neutral-300 px-3 hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">{label}</a>
          ))}
        </nav>
      </header>

      <div className="space-y-8 p-5 sm:p-8">
        <section id="notebook-resources" className="scroll-mt-6" aria-labelledby="notebook-resources-title">
          <h3 id="notebook-resources-title" className="text-lg font-bold">01. 수업 자료</h3>
          <NotebookLectureViewer />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {resources.map((resource) => (
              <a key={resource.title} href={resource.url} target="_blank" rel="noopener noreferrer" className="flex min-w-0 flex-col border border-neutral-300 p-4 transition-colors hover:border-black hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
                <span className="text-xs font-medium text-neutral-500">{resource.type}</span>
                <span className="mt-2 text-base font-bold">{resource.title} ↗</span>
                <span className="mt-2 break-keep text-xs leading-6 text-neutral-600">{resource.detail}</span>
              </a>
            ))}
          </div>
          <p className="mt-3 text-xs leading-6 text-neutral-600">강의 슬라이드는 위의 LMS 전용 뷰어에서만 열람합니다. 학생용 교재와 실습 ZIP은 기존처럼 Google Drive에서 이용합니다. 교재·ZIP에 접근 권한 요청이 표시되면 강사에게 알려주세요.</p>
          <a href={STUDENT_FOLDER} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex min-h-11 items-center text-xs underline underline-offset-4">학생용 교재·실습 자료 폴더 ↗</a>
          {isInstructor && (
            <aside className="mt-4 border border-blue-200 bg-blue-50 p-4" aria-label="강사 전용 원본과 자료 관리">
              <p className="text-sm font-bold">강사 전용 · 원본 및 참고자료</p>
              <p className="mt-2 break-keep text-xs leading-6 text-neutral-700">슬라이드 원본 PDF와 전체 패키지는 비공개 강사용 폴더에 보관했습니다. 학생에게 원본이나 강사용 폴더를 공유하지 마세요. 학생용 폴더에는 교재와 실습 ZIP만 남겨 두었습니다.</p>
              <a href={INSTRUCTOR_FOLDER} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4">강사용 원본·해설·정답 보관함 ↗</a>
              <p className="text-xs leading-6 text-neutral-600">슬라이드는 LMS 수강 권한으로 열람합니다. 학생용 교재·ZIP의 Drive 공유 권한은 별도로 관리합니다.</p>
            </aside>
          )}
        </section>

        <section aria-labelledby="notebook-foundation-title">
          <h3 id="notebook-foundation-title" className="text-lg font-bold">02. 먼저 이해할 개념</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="border-l-2 border-black pl-4"><h4 className="text-sm font-bold">노트북은 프로젝트, 소스는 근거</h4><p className="mt-2 break-keep text-sm leading-7 text-neutral-700">노트북 하나에 프로젝트의 자료를 모읍니다. 일반 AI 채팅과 비교할 때 중요한 것은 답변의 길이가 아니라, 지금 어떤 자료를 근거로 답하고 있는지 추적하는 과정입니다.</p></div>
            <div className="border-l-2 border-black pl-4"><h4 className="text-sm font-bold">요약과 분석은 다릅니다</h4><p className="mt-2 break-keep text-sm leading-7 text-neutral-700">요약은 내용을 줄이고, 분석은 차이·패턴·충돌을 찾아 의사결정과 연결합니다. 원문에 있는 사실과 디자이너의 해석, 검증 전 설계 가설을 각각 표시합니다.</p></div>
          </div>
          <p className="mt-4 break-keep bg-neutral-50 p-4 text-sm leading-7">출처 인용이 있다는 이유만으로 정답은 아닙니다. 인용을 열어 주장과 원문을 대조하고, 근거가 부족하면 확인 질문을 남깁니다. Notebook의 문서 분석만으로 실제 웹사이트의 시각적 품질이나 동작 테스트가 끝났다고 판단하지 않습니다.</p>
        </section>

        <section id="notebook-interface" className="scroll-mt-6" aria-labelledby="notebook-interface-title">
          <h3 id="notebook-interface-title" className="text-lg font-bold">03. 홈 화면과 작업 화면 읽기</h3>
          <p className="mt-2 text-sm leading-7 text-neutral-600">제공된 두 스크린샷을 기준으로 합니다. 실제 화면 확대·번호 주석은 강의 슬라이드 6~14장과 학생용 교재에서 함께 확인하세요. 보이지 않는 하위 메뉴의 동작은 추정하지 않습니다.</p>
          <details open className="mt-4 border border-neutral-200">
            <summary className="cursor-pointer bg-neutral-50 px-4 py-4 text-sm font-bold focus-visible:outline focus-visible:outline-2">A. 기본 홈 화면 · 프로젝트 찾기와 생성</summary>
            <dl className="divide-y divide-neutral-200 px-4">{homeItems.map(([title, text]) => <div key={title} className="py-4"><dt className="text-sm font-bold">{title}</dt><dd className="mt-2 break-keep text-sm leading-7 text-neutral-700">{text}</dd></div>)}</dl>
          </details>
          <details className="mt-3 border border-neutral-200">
            <summary className="cursor-pointer bg-neutral-50 px-4 py-4 text-sm font-bold focus-visible:outline focus-visible:outline-2">B. 노트북 작업 화면 · 출처 / 채팅 / 스튜디오</summary>
            <dl className="divide-y divide-neutral-200 px-4">{workspaceItems.map(([title, text]) => <div key={title} className="py-4"><dt className="text-sm font-bold">{title}</dt><dd className="mt-2 break-keep text-sm leading-7 text-neutral-700">{text}</dd></div>)}</dl>
          </details>
        </section>

        <section aria-labelledby="notebook-sources-title">
          <h3 id="notebook-sources-title" className="text-lg font-bold">04. 소스 추가·선택·갱신과 질문</h3>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-7 text-neutral-700">
            <li><strong className="text-black">파일을 고릅니다.</strong> + 소스 추가에서 현재 계정이 받는 형식을 확인합니다. PDF/텍스트는 브랜드·브리프, Docs/Slides/Sheets는 협업 자료, 웹 URL은 공개 문서, 자막 있는 YouTube·오디오는 발화 자료처럼 목적을 나눕니다. 이미지·Office·CSV·Markdown은 현재 지원 여부와 실제 인식 결과를 확인하고, 실패하면 제공된 TXT 대체본을 사용합니다.</li>
            <li><strong className="text-black">본문을 확인합니다.</strong> 파일명 표시만 보지 말고 표·이미지·자막·숫자가 읽혔는지 확인합니다. 웹 URL을 추가한 것은 화면 레이아웃·인터랙션 전체를 직접 테스트한 것과 다릅니다.</li>
            <li><strong className="text-black">질문 범위를 좁힙니다.</strong> 관련 소스만 선택하고 P02처럼 출력 열과 검증 조건을 지시합니다. 일부 선택 / 전체 선택 결과를 비교하고 선택한 자료가 인용에 반영됐는지 봅니다. 소스 0개 상태의 답변을 업로드 자료의 근거로 사용하지 않습니다.</li>
            <li><strong className="text-black">인용과 버전을 관리합니다.</strong> 출처를 열어 주장·원문 위치·문서 승인 상태를 확인합니다. 라벨·분류 메뉴가 없다면 파일명에 S01 같은 식별자를 붙입니다. S01~S08은 실습용 파일 ID이며 서비스가 붙인 인용번호가 아닙니다.</li>
            <li><strong className="text-black">변경 후 다시 검증합니다.</strong> 원본 수정이 자동 반영된다고 가정하지 않습니다. 제공되는 갱신·다시 가져오기 기능을 확인하고, 기존 보고서와 슬라이드도 수정된 근거와 대조합니다. 삭제 전에는 사용 중인 결과물의 근거가 사라지는지 확인합니다.</li>
          </ol>
          <p className="mt-4 border-l-2 border-blue-700 pl-4 text-sm leading-7">좋은 질문 = 목표 + 사용할 소스 + 작업 범위 + 출력 형식 + 검증 조건. 자료에 없는 숫자·발언은 만들지 말고, 충돌과 확인 불가 항목을 숨기지 않도록 요청합니다.</p>
        </section>

        <section id="notebook-studio" className="scroll-mt-6" aria-labelledby="notebook-studio-title">
          <h3 id="notebook-studio-title" className="text-lg font-bold">05. Studio 9개 기능 · 목적에서 결과물까지</h3>
          <p className="mt-2 text-sm leading-7 text-neutral-600">첨부 화면의 버튼 이름을 사용합니다. 상세 옵션·생성 횟수·공유·내보내기는 계정과 서비스 변경에 따라 다르므로 실제 제공 메뉴를 먼저 확인합니다.</p>
          <div className="mt-4 border-x border-t border-neutral-200">
            {studioItems.map((item, index) => <details key={item.name} className="border-b border-neutral-200">
              <summary className="cursor-pointer px-4 py-4 text-sm font-bold focus-visible:outline focus-visible:outline-2"><span className="mr-3 font-mono text-neutral-400">{String(index + 1).padStart(2, "0")}</span>{item.name}</summary>
              <dl className="space-y-3 px-4 pb-5 text-sm leading-7">
                {[["사용 목적", item.use], ["실행 흐름", item.work], ["기대 결과", item.result], ["검수·대안", item.check]].map(([label, text]) => <div key={label}><dt className="font-semibold text-black">{label}</dt><dd className="break-keep text-neutral-700">{text}</dd></div>)}
                <div><dt className="font-semibold">연결 프롬프트</dt><dd className="font-mono text-blue-700">{item.prompt}</dd></div>
              </dl>
            </details>)}
          </div>
        </section>

        <section id="notebook-workshop" className="scroll-mt-6" aria-labelledby="notebook-workshop-title">
          <h3 id="notebook-workshop-title" className="text-lg font-bold">06. MORU LIVING 웹사이트 리디자인 실습</h3>
          <p className="mt-2 break-keep text-sm leading-7 text-neutral-700">브랜드·경쟁사·인터뷰·설문은 모두 교육용 가상 자료입니다. 실제 고객 조사나 검증된 사업 성과로 발표하지 않습니다. 새 유료 결제 없이 가능한 범위부터 진행합니다.</p>
          <div className="mt-4 border border-neutral-200 bg-neutral-50 p-4 text-sm leading-7">
            <p className="font-bold">소스 구성</p>
            <p className="mt-2 break-keep">S01 브랜드 소개 · S02 승인된 요구사항 v2 · S03 사용자 인터뷰 · S04 경쟁사 기록 · S05 설문 원본과 데이터 설명 · S06 사이트 관찰 기록</p>
            <p className="mt-2 text-xs text-neutral-600">선택 심화: S07 이전 요구사항 v1 비교 / S08 디자인 리서치 용어집. ZIP 자체를 분석 소스로 넣지 말고 압축을 푼 뒤 필요한 파일을 추가하세요.</p>
          </div>
          <ol className="mt-4 divide-y divide-neutral-200">
            {steps.map((step, index) => <li key={step.title} className="grid gap-3 py-5 sm:grid-cols-[48px_1fr]">
              <span className="font-mono text-2xl text-neutral-400">{String(index + 1).padStart(2, "0")}</span>
              <div><h4 className="text-base font-bold">{step.title}</h4><p className="mt-2 break-keep text-sm leading-7 text-neutral-700">{step.text}</p><p className="mt-2 text-xs font-medium leading-6 text-blue-800">프롬프트 · {step.prompt}</p><p className="text-xs leading-6 text-neutral-600">완료 기준 · {step.output}</p></div>
            </li>)}
          </ol>
          <p className="border-l-2 border-black pl-4 text-sm leading-7">브랜드 디자인에는 가치·포지셔닝의 근거를, UX/UI에는 사용자 과업과 요구사항을, 웹디자인에는 페이지별 콘텐츠를, 그래픽·발표에는 하나의 핵심 메시지를 연결하세요. 최종 시각 판단과 실제 사용성 확인은 디자이너가 수행합니다.</p>
        </section>

        <section id="notebook-prompts" className="scroll-mt-6" aria-labelledby="notebook-prompts-title">
          <h3 id="notebook-prompts-title" className="text-lg font-bold">07. 복사해서 사용하는 실습 프롬프트 18개</h3>
          <p className="mt-2 text-sm leading-7 text-neutral-600">프롬프트마다 선택 소스와 검수 기준을 먼저 확인하세요. P01 → P02~P06 → P07~P08 → P10~P11 → P12·P14를 기본 흐름으로 사용합니다.</p>
          <div className="mt-4 border-x border-t border-neutral-200">{prompts.map((item) => <PromptCard key={item.id} item={item} />)}</div>
        </section>

        <section id="notebook-review" className="scroll-mt-6" aria-labelledby="notebook-review-title">
          <h3 id="notebook-review-title" className="text-lg font-bold">08. 최종 제출과 품질 점검</h3>
          <p className="mt-2 text-sm leading-7 text-neutral-700">제출 묶음: 소스 목록 + 출처 근거표 + 디자인 브리프 + 8장 제안자료(또는 동등한 스토리보드) + QA 수정 기록. 기존 AI Studio 과제와는 파일명으로 구분합니다.</p>
          <fieldset className="mt-4 border border-neutral-200 p-4">
            <legend className="px-2 text-sm font-semibold">자기 점검 · {checked.length}/{checks.length}</legend>
            <div className="space-y-3">{checks.map((check, index) => <label key={check} className="flex cursor-pointer items-start gap-3 text-sm leading-7"><input type="checkbox" checked={checked.includes(check)} onChange={(event) => setChecked((current) => event.target.checked ? [...current, check] : current.filter((value) => value !== check))} className="mt-1.5 h-4 w-4 shrink-0 accent-black" aria-label={`점검 ${index + 1}: ${check}`} /><span className="break-keep">{check}</span></label>)}</div>
          </fieldset>
          <p className="mt-2 text-xs leading-6 text-neutral-500">체크는 현재 화면에서만 유지되며 서버에 저장되거나 과제 제출·출석·수료로 처리되지 않습니다.</p>
          <a href="/feedback" className="mt-4 inline-flex min-h-11 items-center justify-center bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">과제&피드백에서 3회차 제출하기 →</a>
          <details className="mt-5 border-t border-neutral-200 pt-4">
            <summary className="cursor-pointer text-sm font-semibold">자주 막히는 상황과 대안</summary>
            <dl className="mt-3 space-y-3 text-sm leading-7 text-neutral-700">
              <div><dt className="font-semibold text-black">업로드 실패·인식 누락</dt><dd>현재 지원 형식·용량·암호 여부와 처리 상태를 확인하고 TXT 대체본을 사용합니다. 표의 열 의미가 사라졌다면 데이터 설명을 함께 제공합니다.</dd></div>
              <div><dt className="font-semibold text-black">답변이 자료와 다름</dt><dd>선택 소스와 문서 버전을 확인하고 질문을 좁힙니다. 문제 주장을 인용 원문과 비교해 확인 불가 또는 수정 항목으로 남깁니다.</dd></div>
              <div><dt className="font-semibold text-black">생성 한도·기능 미제공</dt><dd>추가 결제를 전제로 하지 않습니다. 보고서 텍스트·비교표·8장 스토리보드 템플릿으로 동일한 학습 결과를 만듭니다.</dd></div>
              <div><dt className="font-semibold text-black">공유·파일 접근 오류</dt><dd>슬라이드는 LMS 로그인과 수강 권한을 확인합니다. 교재·실습 ZIP은 로그인한 Google 계정과 해당 파일의 보기 권한을 확인합니다. 강사용 원본 폴더는 학생에게 공유하지 않습니다.</dd></div>
            </dl>
          </details>
        </section>
        <footer className="border-t border-neutral-200 pt-4 text-xs leading-6 text-neutral-500">K-MOVE SESSION 03 · 자료 기준 2026.11.08 · v1.0<br />실제 UI는 제공 스크린샷을 기준으로 하며, 계정별 옵션은 실행 전 확인합니다. 비공개 고객 자료와 개인정보를 허가 없이 업로드하지 마세요. 공식 출처 목록과 검증 범위는 수업자료에 포함되어 있습니다.</footer>
      </div>
    </section>
  );
}
