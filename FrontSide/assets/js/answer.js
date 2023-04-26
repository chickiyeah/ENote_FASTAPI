import { clickEnter } from "./enterEvent.js";

const w = document.querySelector("#word");
const a = document.querySelector("#answer");
const s = document.querySelector("#submit");
const inf = document.querySelector("#inf");
const wordBorder = document.querySelector("#wordBorder");

// var num = 0;

// 공백인데 정답버튼 클릭하면 input에 포커스 주기
// 공백이 아니라면 checkAnswer실행하기
// s.addEventListener("click", function () {
//   if (a.value.length <= 0) {
//     inf.textContent = "답을 입력해주세요.";
//     a.focus();
//   } else {
//     checkAnswer();
//   }
// });
//input에서 엔터키 누르면 정답 버튼 누르기
// a.addEventListener("keydown", function (e) {
//   if (e.keyCode === 13) {
//     e.preventDefault();
//     s.click();
//   }
// });

clickEnter(a, s);
//영단어 보여주는 칸엔 data 배열의 English만 보여주기
// w.textContent = data.data[num].English;

//정답이 맞는지 확인해주는 기능
function checkAnswer() {
  // w.textContent = data.data[num].English;
  // const answerWords = a.value.split(",");
  // 정답 1개 or 2개 입력했을때 맞다고 하기 && 순서가 바뀌어도 정답 인식하기
  // const answerWordsTrimmed = answerWords.map((word) => word.trim()).sort();
  // const isCorrect = data.data[0].Korean.some((x) =>
  //   answerWordsTrimmed.includes(x)
  // );
  if (data.data[num].Korean === a.value) {
    inf.textContent = "정답입니다!";
    console.log(isCorrect);
    num += 1;
    if (num >= data.length) {
      //정답 입력 공간 없애기
      container.textContent = "수고하셨습니다.";
      a.disabled = true;
      s.disabled = true;
    } else {
      a.value = "";
      w.textContent = data.data[num].English;
    }
  } else {
    inf.textContent = "틀렸습니다! 다시 시도해보세요.";
    a.focus();
    a.value = "";
  }
}

////시도중---------------------------------------------------------
fetch("http://3.34.125.70:83/api/note/get_all", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: sessionStorage.getItem("access-token"),
  },
  data: JSON.stringify([
    {
      Author: "유저 고유 아이디",
      English: "영어",
      Korean: "한국어",
      Speak: "발음",
      Created_At: "노트가 등록된 시간",
    },
  ]),
})
  .then((response) => {
    if (response.status !== 200) {
      throw new Error("400 아니면 500 에러남");
    } else {
      return response.json();
    }
  })
  .then((data) => {
    console.log(data);
    var num = 0;
    w.textContent = data.data[num].English;
    s.addEventListener("click", () => {
      const answerWords = a.value.split(",");
      // 정답 1개 or 2개 입력했을때 맞다고 하기 && 순서가 바뀌어도 정답 인식하기
      const answerWordsTrimmed = answerWords
        .map((answerWords) => answerWords.trim())
        .sort();
      const isCorrect = data.data[num].Korean.split(",")
        .map((x) => x.trim())
        .some((x) => answerWordsTrimmed.includes(x));
      console.log(isCorrect);
      if (a.value.length <= 0) {
        inf.textContent = "답을 입력해주세요.";
      } else {
        if (isCorrect) {
          inf.textContent = "정답입니다";
          wordBorder.style.border = "1px solid rgba(0, 87, 255, 0.5)";
          a.style.border = "1px solid rgba(0, 87, 255, 0.5)";
          // a.blur();
          console.log(isCorrect);
          num += 1;
          if (num >= data.data.length) {
            //정답 입력 공간 없애기
            container.textContent = "수고하셨습니다.";
            a.disabled = true;
            s.disabled = true;
          } else {
            a.value = "";
            w.textContent = data.data[num].English;
          }
          //오답이면 붉은색으로 바뀜
        } else {
          inf.textContent = "올바른 답을 적어주세요.";
          wordBorder.style.border = "1px solid rgba(255, 0, 0, 0.5)";
          a.style.border = "1px solid rgba(255, 0, 0, 0.5)";
          // a.focus();
          a.value = "";
          // a.blur();
        }
      }
    });
  })
  .catch((error) => {
    console.log(error);
    alert("로그인 후 사용해주세요.");
    location.href = "/logIn.html";
  });
