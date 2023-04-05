let data = [
    {
      Author : 1,
      English : "answer",
      Korea : ["정답","정답이다"],
      Speak:"엔설",
      Created_At : "날짜",
    },
    {
      Author : 'id_name',
      English : "hungry",
      Korea : ["배고픈","배고프다"],
      Speak : "헝그리",
      Created_At :"Tue Apr 04 2023 18:50:47 GMT+0900 (한국 표준시)",
    },
    {
      Author : 'id_name',
      English : "happy",
      Korea : ["행복한","행복하다"],
      Speak : "해피",
      Created_At :"Tue Apr 04 2023 18:50:47 GMT+0900 (한국 표준시)",
    },
    {
      Author : 'id_name',
      English : "bye",
      Korea : "잘가",
      Speak : "바이",
      Created_At :"Tue Apr 04 2023 18:50:47 GMT+0900 (한국 표준시)",
    },
]

const container = document.querySelector(".container");
const w = document.querySelector(".word");
const a = document.querySelector(".answer");
const s = document.querySelector(".submit");
const inf = document.querySelector(".inf");

let num = 0;

// 공백인데 정답버튼 클릭하면 input에 포커스 주기
// 공백이 아니라면 checkAnswer실행하기
s.addEventListener("click", function () {
    if (a.value.length <= 0) {
      inf.textContent = "답을 입력해주세요.";
      a.focus();
    } else {
      checkAnswer();
    }
  });
  //input에서 엔터키 누르면 정답 버튼 누르기
  a.addEventListener("keydown", function (e) {
    if (e.keyCode === 13) {
      e.preventDefault();
      s.click();
    }
  });
  //영단어 보여주는 칸엔 data 배열의 English만 보여주기
  w.textContent = data[num].English;

  //정답이 맞는지 확인해주는 기능
  function checkAnswer() {
    const aV = a.value;
    if (data[num].Korea.includes(aV)) {
      inf.textContent = "정답입니다!";
      num += 1;
      if (num >= data.length) {
        //정답 입력 공간 없애기
        container.textContent = "수고하셨습니다.";
        a.disabled = true;
        s.disabled = true;
      } else {
        a.value = "";
        w.textContent = data[num].English;
      }
    } else {
      inf.textContent = "틀렸습니다! 다시 시도해보세요.";
      a.focus();
      a.value = "";
    }
  }


