// /assets/js/settings.js

// 채팅 배경 설정 함수
function setChatBackground(url) {
  document.body.style.backgroundImage = `url('${url}')`;
  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundPosition = 'center';
  document.body.style.backgroundRepeat = 'no-repeat';
  localStorage.setItem('chat_bg_image', url);
}
document.querySelectorAll('.bg-options img').forEach(img => {
    img.addEventListener('click', (event) => {
        const bgUrl = event.target.dataset.bgUrl;
        if (bgUrl) {
            setChatBackground(bgUrl);
        }
    });
});
const savedBgImage = localStorage.getItem('chat_bg_image');
if (savedBgImage) {
    setChatBackground(savedBgImage);
}

// 폰트 크기 설정 함수
function setFontSize(size) {
  document.documentElement.style.setProperty('--chat-font-size', size);
  localStorage.setItem('chat_font_size', size);
}

// 설정 패널 토글 함수 (bottom-nav와 input-area 제어 로직 포함)
function toggleSettings() {
  const settingsPanel = document.getElementById('settings-panel');
  const body = document.body;
  const mainBottomNav = document.getElementById('mainBottomNav');
  const inputArea = document.querySelector(".input-area");
  const chatBox = document.getElementById("chat-box"); // chatBox 참조 추가

  if (!settingsPanel || !mainBottomNav || !inputArea || !chatBox) {
      console.error("필요한 DOM 요소를 찾을 수 없습니다: settingsPanel, mainBottomNav, inputArea, chatBox");
      return;
  }

  const isShowing = settingsPanel.classList.toggle('show'); // 'show' 클래스 토글 (나타나게/숨기게)

  if (isShowing) {
    body.classList.add('settings-active'); // body에 클래스 추가하여 chat-container 패딩 조절


    // 설정 패널의 높이를 CSS 변수로 설정 (애니메이션 완료 후 정확한 높이를 얻기 위해 약간의 지연)
    // 이 높이는 chat-container의 padding-bottom에 영향을 줍니다.
    setTimeout(() => {
      const panelHeight = settingsPanel.offsetHeight;
      document.documentElement.style.setProperty('--settings-panel-height', `${panelHeight}px`);
      // chat-box의 scroll-padding-bottom도 업데이트하여 스크롤 위치를 조정합니다.
      chatBox.style.scrollPaddingBottom = `calc(${panelHeight}px + var(--input-area-height))`;
    }, 50); // 짧은 지연

    // 설정 패널이 열리면 하단 내비게이션 바와 입력창 숨기기
  //  mainBottomNav.classList.add('hide-nav');
    inputArea.style.opacity = '0'; // 투명하게 만들고
    inputArea.style.pointerEvents = 'none'; // 클릭 이벤트 방지
    inputArea.style.bottom = `-${inputArea.offsetHeight}px`; // 화면 밖으로 이동
  } else {
    body.classList.remove('settings-active'); // body에서 클래스 제거
    document.documentElement.style.removeProperty('--settings-panel-height'); // CSS 변수 제거

    // chat-box의 scroll-padding-bottom을 기본값으로 되돌림
    chatBox.style.scrollPaddingBottom = 'var(--total-fixed-height)';

    // 설정 패널이 닫히면 하단 내비게이션 바와 입력창 다시 보이기
    mainBottomNav.classList.remove('hide-nav');
    inputArea.style.opacity = '1'; // 다시 보이게
    inputArea.style.pointerEvents = 'auto'; // 클릭 이벤트 허용
    inputArea.style.bottom = 'var(--bottom-nav-height)'; // 원래 위치로 이동
  }
}