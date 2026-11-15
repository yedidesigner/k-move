/* K-MOVE: additive Tools lesson. No model/API calls. Reviewed 2026-11-15. */
(() => {
  'use strict';
  if (document.getElementById('km-tools-dialog')) return;
  const prefix='https://ai.google.dev/gemini-api/docs/';
  const lessons=[
    {id:'structured',name:'Structured outputs',ko:'구조화된 출력',icon:'JSON',summary:'답변을 정해진 데이터 형식에 맞춥니다.',what:'모델의 최종 답변이 지정한 JSON Schema를 따르도록 설정합니다. JSON은 항목 이름과 값을 짝지어 기록하는 데이터 표기법이고, Schema는 어떤 항목과 자료형이 필요한지 정한 규칙입니다.',when:'포트폴리오 프로젝트의 제목·분야·역할을 같은 형식으로 추출하거나, 카드에 넣을 데이터를 일정하게 정리할 때 사용합니다.',steps:['Structured outputs를 선택하고, 실제 AI Studio에서는 Edit에서 출력 구조를 정의합니다.','필요한 항목과 자료형, 필수 항목을 정합니다. 예: title은 글자, year는 숫자.','실행 후 형식뿐 아니라 실제 내용과 누락도 확인합니다.'],off:'자유로운 문장이나 JSON 요청이 가능하지만, 설정한 스키마를 통한 형식 제약은 적용하지 않습니다.',on:'정의한 스키마에 맞춘 구조화 데이터를 요청합니다. 내용의 사실성은 따로 검수합니다.',example:'작업 소개에서 title, category, role을 추출해 정해진 JSON 구조로 정리해줘.',result:'{\n  "title": "가상 브랜드 프로젝트",\n  "category": "Branding",\n  "role": "Graphic designer"\n}',caution:'웹사이트 레이아웃을 구조화하는 버튼이 아닙니다. 일반 기획문에는 불필요할 수 있고, 지원되는 JSON Schema 범위에도 제한이 있습니다.',classroom:'이번 웹사이트 카피 실습의 필수 옵션은 아닙니다. 프로젝트 데이터를 규격화할 때 선택합니다.',glossary:'JSON = 이름·값으로 기록하는 데이터 형식 / Schema = 항목과 자료형의 규칙',doc:'structured-output'},
    {id:'code-execution',name:'Code execution',ko:'코드 실행',icon:'<>',summary:'Python 코드를 실제로 실행해 계산·분석을 돕습니다.',what:'모델이 Python 코드를 만들고 실행 결과를 참고해 답변합니다. Python은 계산과 데이터 처리에 많이 사용하는 프로그래밍 언어입니다.',when:'그리드 너비 계산, 설문 집계, 표 데이터 정리처럼 계산 결과를 확인해야 할 때 사용합니다.',steps:['Code execution을 켭니다.','입력값과 계산 기준을 제공하고 Python 실행 결과를 보여달라고 요청합니다.','생성 코드와 실행 결과를 확인하고, 단위·전제·입력값이 맞는지 검토합니다.'],off:'코드 작성이나 계산을 요청할 수 있어도, 이 도구를 통한 Python 실행은 하지 않습니다.',on:'모델이 필요에 따라 Python을 실행하고 그 결과를 답변에 활용합니다.',example:'콘텐츠 폭 1200px, 좌우 여백 각 48px, 열 간격 24px인 3열 그리드의 카드 폭을 Python으로 계산해줘.',result:'(1200 - 48 × 2 - 24 × 2) ÷ 3\n= 352px\n\n수업용 계산 예시 · 현재 화면에서 실행한 결과가 아닙니다.',caution:'HTML·CSS·React 웹사이트를 실행하는 버튼이 아닙니다. 이 도구는 Python 실행용이며, 웹사이트 제작과 미리보기는 Build에서 진행합니다.',classroom:'바이브코딩을 하려면 반드시 켜야 하는 옵션이 아닙니다. 계산·데이터 분석이 있을 때만 선택합니다.',glossary:'Python = 프로그래밍 언어 / Execution = 작성한 코드를 실행하는 과정',doc:'code-execution'},
    {id:'function-calling',name:'Function calling',ko:'함수 호출',icon:'ƒx',summary:'연결된 외부 기능에 무엇을 요청할지 결정합니다.',what:'모델이 미리 정의된 함수 이름과 입력값을 제안합니다. 연결된 애플리케이션 또는 SDK가 그 함수를 실행하고 결과를 모델에 전달하는 구조입니다.',when:'프로젝트 목록 조회, 예약 확인, 외부 API 조회처럼 모델과 외부 서비스의 기능을 연결할 때 사용합니다.',steps:['실제 서비스에서 실행할 함수와 입력값 규칙을 먼저 준비합니다.','Function calling의 Edit에서 함수 정보를 정의하고 실행 코드와 권한을 연결합니다.','모델이 제안한 입력값을 검증한 뒤 실행합니다. 발송·저장 등 중요한 동작은 사용자 확인 절차를 둡니다.'],off:'이 설정에 등록된 사용자 정의 함수를 모델이 호출하도록 요청하지 않습니다.',on:'등록한 함수 중 필요한 기능과 입력값을 모델이 선택할 수 있습니다. 실제 연결과 실행 처리는 별도입니다.',example:'브랜딩 분야의 프로젝트 목록이 필요하면, 준비된 get_projects 함수를 사용하도록 요청합니다.',result:'모델의 호출 요청 예시\nget_projects({ category: "Branding" })\n\n앱이 권한·입력값 확인 → 실제 조회 → 결과 전달',caution:'스위치만 켠다고 데이터베이스가 연결되거나 이메일이 발송되지 않습니다. Structured outputs의 최종 답변 형식 지정과도 다릅니다.',classroom:'현재 화면 카피 실습에서는 보통 사용하지 않습니다. 데이터베이스·외부 기능 연결을 다루는 이후 단계에서 학습합니다.',glossary:'Function = 정해진 기능 / Argument = 함수에 주는 입력값 / API = 프로그램 사이의 요청·응답 연결',doc:'function-calling'},
    {id:'google-search',name:'Grounding with Google Search',ko:'Google 검색으로 근거 연결',icon:'G',summary:'웹에서 필요한 정보를 찾고 출처와 함께 답변합니다.',what:'모델이 Google 검색을 이용해 웹 정보를 찾고 답변의 근거로 활용합니다. Grounding은 외부 자료에 답변의 근거를 연결한다는 뜻입니다.',when:'새 레퍼런스 찾기, 최신 공식 기능 확인, 최근 공개 자료 조사처럼 검색 대상 URL을 아직 정하지 않았거나 최신 정보가 필요한 경우에 사용합니다.',steps:['Grounding with Google Search를 켭니다. Source: Google Search는 검색 제공자 표시입니다.','찾을 내용, 범위, 날짜 조건을 적고 공식 출처를 우선하도록 요청합니다.','실제 검색 사용 여부와 출처를 확인하고, 링크의 내용·날짜가 답변을 뒷받침하는지 읽어봅니다.'],off:'이 Google 검색 도구를 사용하지 않습니다. 제공한 자료와 다른 활성 도구는 별도로 활용될 수 있습니다.',on:'모델이 필요하다고 판단하면 검색합니다. 켜져 있다고 모든 요청에서 검색하는 것은 아닙니다.',example:'포트폴리오 이미지 최적화에 관한 최신 공식 가이드를 찾아 핵심 내용과 출처를 정리해줘.',result:'기대하는 결과 형식\n핵심 설명 + 관련 출처 + 확인할 날짜\n\n이 예시는 실제 검색 결과가 아닙니다.',caution:'검색을 사용해도 오류가 없어지지는 않습니다. 검색 스니펫과 원문, 오래된 자료와 최신 자료를 구분하세요.',classroom:'레퍼런스 탐색·사실 확인에는 유용합니다. 이미 제공한 화면의 여백이나 글자 크기만 수정할 때는 필수 설정이 아닙니다.',glossary:'Grounding = 근거 연결 / Source = 출처 또는 정보 제공자',doc:'google-search'},
    {id:'url-context',name:'URL context',ko:'제공한 웹주소의 내용 참고',icon:'↗',summary:'내가 지정한 URL의 내용을 읽어 답변에 활용합니다.',what:'프롬프트에 제공한 웹주소의 접근 가능한 내용을 추가 자료로 읽습니다. URL은 웹주소, Context는 답변을 위한 참고 맥락입니다.',when:'이미 고른 레퍼런스나 공식 문서의 내용 요약·비교·정보 추출처럼 읽을 주소가 정해진 작업에 사용합니다.',steps:['URL context를 켜고 분석할 정확한 URL을 입력합니다.','어떤 내용을 확인할지 적고, 접근하지 못한 주소와 미확인 사항을 먼저 밝히도록 요청합니다.','접근 결과를 확인합니다. 시각 재현에는 스크린샷과 직접 확인한 동작 기록도 함께 준비합니다.'],off:'이 URL context 도구로 지정 주소의 내용을 수집하지 않습니다. 주소를 붙였다는 사실만으로 원문을 읽었다고 판단하지 않습니다.',on:'지원되는 URL의 내용을 읽어 답변에 반영하도록 요청합니다. 접근 실패와 지원 제한은 별도로 확인합니다.',example:'[레퍼런스 URL]의 주요 콘텐츠를 정리해줘. 확인한 내용과 추정을 구분하고, 접근하지 못한 부분은 알려줘.',result:'기대하는 결과 형식\n접근 여부 → 확인한 내용 → 추정 → 미확인\n\n정확한 폰트·여백·호버 동작은 별도 관찰',caution:'사이트의 디자인·애니메이션·로그인 뒤 화면을 전부 체험했다는 뜻이 아닙니다. URL 하나만으로 완벽한 카피를 보장하지 않습니다.',classroom:'레퍼런스 주소를 분석할 때 선택합니다. Google Search는 자료를 찾는 것, URL context는 지정한 자료를 읽는 것으로 구분합니다.',glossary:'URL = 웹주소 / Context = 모델이 답변할 때 참고하는 맥락',doc:'url-context'}
  ];
  const byId=new Map(lessons.map(x=>[x.id,x]));
  const state=Object.fromEntries(lessons.map(x=>[x.id,x.id==='google-search']));
  const css=document.createElement('style');
  css.textContent=`
  :root{font-family:'Pretendard','Noto Sans KR',system-ui,sans-serif}
  .km-tools-dialog{position:fixed;margin:0;padding:0;border:1px solid #dce2ea;border-radius:18px;background:#fff;color:#202124;box-shadow:0 18px 64px #16233630;width:min(940px,calc(100vw - 24px));max-width:none;max-height:calc(100dvh - 24px);overflow:hidden;font:14px/1.65 'Pretendard','Noto Sans KR',system-ui,sans-serif}
  .km-tools-dialog::backdrop{background:#17223714}
  .km-tools-dialog *{box-sizing:border-box}
  .km-tools-dialog button,.km-tools-dialog a{font:inherit}
  .km-tools-dialog button{cursor:pointer}
  .km-tools-dialog button:focus-visible,.km-tools-dialog a:focus-visible{outline:3px solid #8ab4f8;outline-offset:2px}
  .km-head{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #e8ecf1;gap:12px}
  .km-head h2{margin:0;font-size:18px;font-weight:700}.km-head h2 small{font-size:14.4px;color:#4676ac;margin-left:10px;font-weight:600}
  .km-close{border:0;background:#f3f5f7;border-radius:50%;width:36px;height:36px;font-size:22px!important;flex:none}
  .km-layout{display:grid;grid-template-columns:320px minmax(0,1fr);height:min(570px,calc(100dvh - 150px));min-height:220px}
  .km-menu{padding:16px 12px;border-right:1px solid #e8ecf1;overflow:auto}.km-menu-intro{margin:0 8px 14px;font-size:12px;color:#667487}
  .km-option{display:flex;align-items:center;gap:8px;border-radius:12px;margin-bottom:6px;padding:3px 7px 3px 3px;border:1px solid transparent}
  .km-option.selected{background:#edf4ff;border-color:#c2d8f7}.km-option:hover{background:#f5f8fc}
  .km-option-name{display:flex;align-items:center;gap:11px;flex:1;min-width:0;border:0;background:none;text-align:left;padding:10px 6px;color:#202124}
  .km-symbol{width:26px;flex:none;font-size:16px;font-weight:600;text-align:center}.km-symbol.json{font-size:9px;border:1.5px solid currentColor;border-radius:2px;line-height:18px}.km-symbol.google{color:#4285f4;font-size:23px;font-weight:800}
  .km-option-copy{min-width:0}.km-option-copy strong{display:block;font-size:14px;line-height:1.35;font-weight:550}.km-option-copy small{display:block;font-size:11.2px;color:#547499;margin-top:4px;line-height:1.4}
  .km-switch{border:1px solid #d9dde2;border-radius:20px;width:40px;height:24px;background:#f0f1f3;flex:none;padding:2px;position:relative}.km-switch:before{content:'';position:absolute;left:3px;top:3px;width:16px;height:16px;border-radius:50%;background:#666a70;transition:.15s}.km-switch[aria-checked=true]{background:#202124;border-color:#202124}.km-switch[aria-checked=true]:before{left:19px;background:#fff}
  .km-legend{margin:15px 8px 0;padding-top:14px;border-top:1px solid #e8ecf1;font-size:11px;color:#687488;line-height:1.7}
  .km-detail{padding:20px 24px;overflow:auto;overscroll-behavior:contain;min-width:0}
  .km-detail h3{display:flex;align-items:baseline;flex-wrap:wrap;gap:6px 10px;margin:2px 0 8px;font-size:20px;line-height:1.4;letter-spacing:-.35px}.km-detail h3 span{font-size:16px;color:#326fa9;font-weight:600}
  .km-summary{font-weight:650;font-size:15px;line-height:1.7;margin:8px 0 16px}.km-kicker{font-size:11px;font-weight:700;color:#547499;letter-spacing:.05em}
  .km-block{margin-top:18px}.km-block h4{font-size:12px;color:#5b6e86;margin:0 0 6px}.km-block p{margin:0;word-break:keep-all;overflow-wrap:anywhere}.km-block ol{margin:0;padding-left:19px}.km-block li{margin:5px 0;word-break:keep-all}
  .km-state{background:#f6f8fb;border-radius:12px;padding:12px 14px}.km-state p+p{margin-top:8px}.km-state b{font-size:11px;margin-right:6px}
  .km-example{border-left:3px solid #78a8ef;padding:12px 14px;background:#f4f8ff;border-radius:0 10px 10px 0}.km-example pre{font:12px/1.8 'Pretendard',system-ui,sans-serif;white-space:pre-wrap;overflow-wrap:anywhere;background:#fff;padding:12px;border:1px solid #e1e8f2;border-radius:8px;margin:10px 0 0}
  .km-caution{padding:12px 14px;border-radius:10px;background:#fff8e9;border:1px solid #f2dfb7;color:#685128}.km-glossary{font-size:12px;color:#56677e}.km-doc{display:inline-block;margin:16px 0 6px;color:#1a73e8;text-underline-offset:3px;font-size:12px!important}
  .km-footer{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 20px;border-top:1px solid #e8ecf1;background:#fff}.km-footer small{font-size:11px;color:#687488}.km-next,.km-back{border:1px solid #d4dfef;border-radius:9px;padding:7px 12px;background:#f4f8ff;color:#2465a9;font-size:12px!important;min-height:36px}
  .km-back{display:none;margin-bottom:12px}.km-selected-chip{display:inline-flex;align-items:center;gap:4px;background:#eaf2ff;border-radius:12px;border:1px solid #cfe1ff;padding:2px 6px;max-width:100%}.km-selected-chip button{border:0;background:none;font-size:11px;min-height:30px;padding:2px 4px;color:#285f9f}.km-chip-label{max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  [data-km-tools-launch]{font-size:11px!important}.coach{position:static;margin:12px 18px 18px auto;max-width:550px;flex-wrap:wrap}.tip-title,.tip-ko{display:inline;margin-right:8px}.tip-ko{font-size:14px}
  @media(max-width:760px){.km-tools-dialog{left:12px!important;top:12px!important;width:calc(100vw - 24px);height:calc(100dvh - 24px);max-height:none}.km-tools-dialog[open]{display:flex;flex-direction:column}.km-layout{display:block;flex:1;min-height:0;height:auto}.km-head,.km-footer{flex:none}.km-menu{height:100%;border-right:0}.km-detail{height:100%;padding:16px 20px;display:none}.km-tools-dialog.detail-open .km-menu{display:none}.km-tools-dialog.detail-open .km-detail{display:block}.km-back{display:inline-block}.km-footer{padding:10px 16px}.km-footer small{max-width:60%}.km-head{padding:12px 16px}.km-option{margin-bottom:10px}.km-option-copy strong{font-size:16px}.km-option-copy small{font-size:12.8px}.km-detail h3{font-size:18px}.km-detail h3 span{font-size:14.4px}.coach{position:static;margin:12px;max-width:none}.km-detail,.km-menu{scrollbar-gutter:stable}}
  @media(prefers-reduced-motion:reduce){.km-switch:before{transition:none}}
  `;
  document.head.append(css);
  if(!document.querySelector('link[data-km-font]')){const font=document.createElement('link');font.rel='stylesheet';font.href='https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css';font.dataset.kmFont='true';document.head.append(font);}
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dialog=document.createElement('dialog');dialog.id='km-tools-dialog';dialog.className='km-tools-dialog';dialog.setAttribute('aria-labelledby','km-tools-heading');
  dialog.innerHTML=`<header class="km-head"><h2 id="km-tools-heading">Tools <small>도구별 특징과 사용법</small></h2><button class="km-close" aria-label="Tools 설명 닫기">×</button></header><div class="km-layout"><nav class="km-menu" aria-label="Tools 옵션 선택"><p class="km-menu-intro">이름을 누르면 설명, 스위치를 누르면 모의 설정이 바뀝니다.</p>${lessons.map(x=>`<div class="km-option" data-option="${x.id}"><button class="km-option-name" data-select="${x.id}" aria-controls="km-tool-detail"><span aria-hidden="true" class="km-symbol ${x.id==='structured'?'json':x.id==='google-search'?'google':''}">${escape(x.icon)}</span><span class="km-option-copy"><strong>${escape(x.name)}</strong><small>${escape(x.ko)}</small>${x.id==='google-search'?'<small>Source: Google Search</small>':''}</span></button><button class="km-switch" type="button" role="switch" aria-label="${escape(x.name)} 모의 설정" aria-checked="${state[x.id]}" data-switch="${x.id}"></button></div>`).join('')}<p class="km-legend">이 화면은 학습용입니다. 실제 모델 실행·검색·외부 연결은 하지 않습니다.<br><br>실제 AI Studio에서 회색으로 비활성화된 옵션은 현재 모델·도구 조합·설정의 지원 여부를 확인하세요. 모두 켜는 것이 정답은 아닙니다.</p></nav><section class="km-detail" id="km-tool-detail" aria-label="선택한 Tools 옵션 설명" tabindex="0"></section></div><footer class="km-footer"><small>제공 화면의 5개 항목 · Google 공식 문서 기준<br>실습 예시·선택 기준은 수업용 제안</small><button class="km-next">다음 옵션 →</button></footer>`;
  document.body.append(dialog);
  let selected=lessons[0].id,origin=null;
  const detail=dialog.querySelector('.km-detail');
  function render(id,focus=false){
    const x=byId.get(id);if(!x)return;selected=id;
    dialog.querySelectorAll('[data-option]').forEach(row=>{const yes=row.dataset.option===id;row.classList.toggle('selected',yes);const label=row.querySelector('[data-select]');if(yes)label.setAttribute('aria-current','true');else label.removeAttribute('aria-current');});
    detail.innerHTML=`<button class="km-back">← 옵션 목록으로</button><div class="km-kicker">OPTION ${String(lessons.indexOf(x)+1).padStart(2,'0')} / 05 · 학습용</div><h3>${escape(x.name)} <span>${escape(x.ko)}</span></h3><p class="km-summary">${escape(x.summary)}</p><div class="km-block"><h4>무엇을 하나요?</h4><p>${escape(x.what)}</p></div><div class="km-block"><h4>언제 사용하나요?</h4><p>${escape(x.when)}</p></div><div class="km-block"><h4>실제 AI Studio 사용 순서</h4><ol>${x.steps.map(s=>`<li>${escape(s)}</li>`).join('')}</ol></div><div class="km-block km-state"><h4>OFF / ON 차이</h4><p><b>OFF</b>${escape(x.off)}</p><p><b>ON</b>${escape(x.on)}</p></div><div class="km-block km-example"><h4>디자인 수업용 예시</h4><p>${escape(x.example)}</p><pre>${escape(x.result)}</pre></div><div class="km-block km-caution"><h4>오해하지 마세요</h4><p>${escape(x.caution)}</p></div><div class="km-block"><h4>이번 바이브코딩 수업에서는?</h4><p>${escape(x.classroom)}</p></div><div class="km-block km-glossary"><h4>용어 풀이</h4><p>${escape(x.glossary)}</p></div><a class="km-doc" href="${prefix+x.doc}" target="_blank" rel="noopener noreferrer">Google 공식 문서에서 확인 ↗</a>`;
    detail.scrollTop=0;dialog.classList.add('detail-open');
    if(focus) detail.focus({preventScroll:true});
  }
  function position(){
    if(!dialog.open)return;
    const w=dialog.offsetWidth,h=dialog.offsetHeight,a=origin?.getBoundingClientRect();
    dialog.style.left=Math.max(12,Math.min(a?.left??(innerWidth-w)/2,innerWidth-w-12))+'px';
    dialog.style.top=Math.max(12,Math.min(a?a.top-h-12:(innerHeight-h)/2,innerHeight-h-12))+'px';
  }
  function open(id,anchor,menu=false){
    document.getElementById('tipClose')?.click();document.querySelectorAll('.help-target.active').forEach(x=>x.classList.remove('active'));
    origin=anchor||document.querySelector('[data-help="input-tools"]');
    render(id||selected);
    if(menu)dialog.classList.remove('detail-open');
    if(!dialog.open)dialog.showModal();
    document.querySelectorAll('[data-help="input-tools"],[data-help="tools"]').forEach(x=>x.setAttribute('aria-expanded','true'));
    position();
    if(menu)dialog.querySelector(`[data-select="${selected}"]`)?.focus({preventScroll:true});
    else detail.focus({preventScroll:true});
  }
  function close(){dialog.close();document.querySelectorAll('[data-help="input-tools"],[data-help="tools"]').forEach(x=>x.setAttribute('aria-expanded','false'));origin?.focus({preventScroll:true});}
  function sync(){
    lessons.forEach(x=>{
      dialog.querySelector(`[data-switch="${x.id}"]`).setAttribute('aria-checked',String(state[x.id]));
      document.querySelectorAll(`[data-help="${x.id}"][data-toggle]`).forEach(b=>b.setAttribute('aria-pressed',String(state[x.id])));
    });
    const row=document.querySelector('.composer-tools');if(!row)return;
    row.querySelectorAll('.tool-pill,.km-selected-chip').forEach(x=>x.remove());
    lessons.filter(x=>state[x.id]).forEach(x=>{const chip=document.createElement('span');chip.className='km-selected-chip';chip.innerHTML=`<button class="km-chip-label" data-km-chip="${x.id}">${escape(x.name)}</button><button data-km-remove="${x.id}" aria-label="${escape(x.name)} 모의 설정 끄기">×</button>`;row.append(chip);});
  }
  function toggle(id){if(!byId.has(id))return;state[id]=!state[id];sync();}
  dialog.querySelector('.km-close').addEventListener('click',close);
  dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  dialog.addEventListener('click',e=>{
    const label=e.target.closest('[data-select]'),sw=e.target.closest('[data-switch]');
    if(label)render(label.dataset.select,true);
    else if(sw){toggle(sw.dataset.switch);render(sw.dataset.switch);}
    else if(e.target.closest('.km-back')){dialog.classList.remove('detail-open');dialog.querySelector(`[data-select="${selected}"]`).focus();}
    else if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}
  });
  dialog.querySelector('.km-next').addEventListener('click',()=>render(lessons[(lessons.findIndex(x=>x.id===selected)+1)%lessons.length].id,true));
  document.addEventListener('click',e=>{
    if(dialog.contains(e.target))return;
    const remove=e.target.closest('[data-km-remove]'),chip=e.target.closest('[data-km-chip]'),launch=e.target.closest('[data-km-tools-launch]'),help=e.target.closest('[data-help]');
    const key=help?.dataset.help;
    if(remove||chip||launch||key==='input-tools'||key==='tools'||byId.has(key)){
      e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
      if(remove){state[remove.dataset.kmRemove]=false;sync();return;}
      if(help&&byId.has(key)&&e.target.closest('.switch'))toggle(key);
      const id=chip?.dataset.kmChip||(byId.has(key)?key:selected);
      open(id,chip||launch||help,key==='input-tools'||key==='tools'||!!launch);
    }
  },true);
  document.querySelectorAll('[data-help="input-tools"],[data-help="tools"]').forEach(b=>{b.setAttribute('aria-haspopup','dialog');b.setAttribute('aria-controls',dialog.id);b.setAttribute('aria-expanded','false');});
  const coach=document.querySelector('.coach');if(coach){const b=document.createElement('button');b.type='button';b.dataset.kmToolsLaunch='true';b.textContent='Tools 5개 배우기';coach.append(b);}
  sync();addEventListener('resize',position);
  if(location.hash==='#tools')setTimeout(()=>open(selected,document.querySelector('[data-help="input-tools"]'),true),80);
  document.documentElement.dataset.kmoveToolsVersion='7';
})();
