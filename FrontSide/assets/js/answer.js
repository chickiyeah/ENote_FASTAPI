import { clickEnter } from "./enterEvent.js";

const container = document.querySelector(".container");
const w = document.querySelector("#word");
const a = document.querySelector("#answer");
const s = document.querySelector("#submit");
const inf = document.querySelector("#inf");
const wordBorder = document.querySelector("#wordBorder");


clickEnter(a, s);

// //정답이 맞는지 확인해주는 기능
// function checkAnswer() {
//   if (data.data[num].Korean === a.value) {
//     inf.textContent = "정답입니다!";
//     console.log(isCorrect);
//     num += 1;
//     if (num >= data.length) {
//       //정답 입력 공간 없애기
//       container.textContent = "수고하셨습니다.";
//       a.disabled = true;
//       s.disabled = true;
//     } else {
//       a.value = "";
//       w.textContent = data.data[num].English;
//     }
//   } else {
//     inf.textContent = "틀렸습니다! 다시 시도해보세요.";
//     a.focus();
//     a.value = "";
//   }
// }


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
      if (a.value.length <= 0) {
        inf.textContent = "답을 입력해주세요.";
      } else {
        if (isCorrect) {
          inf.textContent = "정답입니다";
          wordBorder.style.border = "1px solid rgba(0, 87, 255, 0.5)";
          a.style.border = "1px solid rgba(0, 87, 255, 0.5)";
          inf.style.color = "rgba(0, 87, 255, 0.5)";
          num += 1;
          if (num >= data.data.length) {
            //정답 입력 공간 없애기
            w.textContent = "수고하셨습니다.";
            wordBorder.style.border = "1px solid #ccc";
            a.disabled = true;
            a.style.display = "none";
            s.disabled = true;
            s.style.display = "none";
            inf.textContent = "";
          } else {
            a.value = "";
            w.textContent = data.data[num].English;
          }
          //오답이면 붉은색으로 바뀜
        } else {
          inf.textContent = "올바른 답을 적어주세요.";
          wordBorder.style.border = "1px solid rgba(255, 0, 0, 0.5)";
          a.style.border = "1px solid rgba(255, 0, 0, 0.5)";
          inf.style.color = "rgba(255, 0, 0, 0.5)";
          a.value = "";
        }
      }
    });
  })
  .catch((error) => {
    console.log(error);
    alert("로그인 후 사용해주세요.");
    location.href = "/login";
  });
