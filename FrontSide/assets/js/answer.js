import { clickEnter } from "./enterEvent.js";

const container = document.querySelector(".container");
const w = document.querySelector("#word");
const a = document.querySelector("#answer");
const s = document.querySelector("#submit");
const inf = document.querySelector("#inf");
const wordBorder = document.querySelector("#wordBorder");
// const title = document.querySelector(".title");

clickEnter(a,s);

window.addEventListener("load", (e) => {
  e.preventDefault();
  var refreshUrl = "http://35.212.150.195/api/user/refresh_token";
  var verifyUrl = "http://35.212.150.195/api/user/verify_token";
  if (!sessionStorage.getItem("access_token")) {
    //refresh_token api
    fetch(refreshUrl, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh_token: sessionStorage.getItem("refresh_token"),
      }),
    })
      .then((reas) => {
        if (res.status === 422 || res.status === 500) {
          throw new Error("오류가 발생했습니다. 관리자에게 문의해주세요.");
        } else if (res.status === 200) {
          return res.json();
        }
      })
      .then((data) => {
        sessionStorage.setItem("access_token", data.access_token);
        sessionStorage.setItem("user_id", data.id);
        sessionStorage.setItem("refresh_token", data.refresh_token);
        //verify token api
        fetch(verifyUrl, {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            access_token: sessionStorage.getItem("access_token"),
          }),
        })
          .then((res) => {
            if (res.status === 400) {
              throw new Error("재로그인이 필요합니다.");
            } else if (res.status === 422 || res.status === 500) {
              throw new Error("오류가 발생했습니다. 관리자에게 문의해주세요.");
            } else {
              return res.json();
            }
          })
          .then((data) => {
            location.reload();
          })
          .catch((error) => alert(error));
      })
      .catch((error) => {
        alert(error);
      });
  } else {
    fetch("http://35.212.150.195/api/note/get_all", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: sessionStorage.getItem("access_token"),
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
        if (response.status === 401) {
          // throw new Error("로그인 후 이용해주시길 바랍니다.");
          location.reload();
        } else if (response.status === 404) {
          throw new Error("데이터를 찾을 수 없습니다. 단어를 저장해주세요.");
        } else if (response.status === 500) {
          throw new Error("오류가 발생했습니다. 관리자에게 문의해주세요.");
        } else if (response.status === 200) {
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
          const isCorrect = data.data[num].Korean.split(",").map((x) => x.trim()).some((x) => answerWordsTrimmed.includes(x));
          
          console.log(isCorrect);
          if (a.value.length <= 0) {
            inf.textContent = "답을 입력해주세요.";
          } else {
            if (isCorrect) {
              inf.textContent = "정답입니다";
              inf.style.color="rgba(0, 87, 255, 0.5)";
              wordBorder.style.border = "1px solid rgba(0, 87, 255, 0.5)";
              a.style.border = "1px solid rgba(0, 87, 255, 0.5)";
              console.log(isCorrect);
              num += 1;
              if (num >= data.data.length) {
                //정답 입력 공간 없애기
                wordBorder.innerHTML = "<p>수고하셨습니다.<p>";
                a.disabled = true;
                s.disabled = true;
              } else {
                a.value = "";
                w.textContent = data.data[num].English;
              }
              //오답이면 붉은색으로 바뀜
            } else {
              inf.textContent = "올바른 답을 적어주세요.";
              inf.style.color="rgba(255, 0, 0, 0.5)";
              wordBorder.style.border = "1px solid rgba(255, 0, 0, 0.5)";
              a.style.border = "1px solid rgba(255, 0, 0, 0.5)";
              a.value = "";
            }
          }
        });
      })
      .catch((error) => {
        alert(error);
        // alert("로그인 후 사용해주세요.");
        // location.href = "/logIn";
      });
  }
});
