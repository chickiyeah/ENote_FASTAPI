import { clickEnter } from "./enterEvent.js";

const container = document.querySelector(".container");
const w = document.querySelector(".word");
const a = document.querySelector(".answer");
const s = document.querySelector(".submit");
const inf = document.querySelector(".inf");
const wordBorder = document.querySelector("#wordBorder");
// const title = document.querySelector(".title");

clickEnter(a, s);

window.addEventListener("load", (e) => {
  e.preventDefault();
  var refreshUrl = "http://35.212.150.195/api/user/refresh_token";
  $(".loading").show()
  //리프레쉬 토큰이 없다면 로그인 페이지로 이동
  if (sessionStorage.getItem("refresh_token") === null) {
    alert("로그인 후 이용이 가능합니다.");
    location.href = "/logIn";
    //리프레쉬 토큰이 있으면 재발급받기
  } else if (sessionStorage.getItem("refresh_token") !== null) {
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
      .then((res) => {
        if (res.status !== 200) {
          res.json().then((json) => {
            let detail_error = json.detail;
            if (detail_error.code === "ER011") {
              alert("해당 유저는 존재하지 않습니다.");
              $(".loading").hide()
            } else if (detail_error.code === "ER997") {
              alert("재로그인이 필요합니다.");
              localStorage.clear();
              sessionStorage.clear();
              $(".loading").hide()
              location.href = "/login"

            } else if (detail_error.code === "ER998") {
              alert("재로그인이 필요합니다.");
              localStorage.clear();
              sessionStorage.clear();
              $(".loading").hide()
              location.href = "/login"
            } else if (detail_error.code === "ER999") {
              alert("비활성화된 유저입니다. 관리자에게 문의해주세요.");
              $(".loading").hide()
            }
          });
        } else {
          res.json().then((data) => {
            sessionStorage.setItem("access_token", data.access_token);
            sessionStorage.setItem("user_id", data.id);
            sessionStorage.setItem("refresh_token", data.refresh_token);
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
              .then((res) => {
                if (res.status !== 200) {
                  let detail_error = json.detail;
                  if (detail_error.code === "ER013") {
                    alert("로그인 후 이용해주시길 바랍니다.");
                    localStorage.clear();
                    sessionStorage.clear();
                    $(".loading").hide()
                    location.href = "/login"
                  } else if (detail_error.code === "ER014") {
                    alert("재로그인이 필요합니다.");
                    localStorage.clear();
                    sessionStorage.clear();
                    $(".loading").hide()
                    location.href = "/login"
                  } else if (detail_error.code === "ER015") {
                    alert("로그인 후 이용해주시길 바랍니다.");
                    localStorage.clear();
                    sessionStorage.clear();
                    $(".loading").hide()
                    location.href = "/login"
                  } else if (detail_error.code === "ER016") {
                    alert("비활성화된 유저입니다. 관리자에게 문의해주세요.");
                    $(".loading").hide()
                  } else if (detail_error.code === "ER017") {
                    alert("한국어 칸을 채워주세요.");
                    $(".loading").hide()
                  } else if (detail_error.code === "ER018") {
                    alert("영어 칸을 채워주세요.");
                    $(".loading").hide()
                  }
                } else {
                  res.json().then((data) => {
                    console.log(data);
                    var num = 0;
                    console.log(data.data[num])
                    w.textContent = data.data[num].English;
                    $(".loading").hide()
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
                        inf.style.color = "rgba(255, 0, 0, 0.5)";
                        wordBorder.style.border =
                          "1px solid rgba(255, 0, 0, 0.5)";
                        a.style.border = "1px solid rgba(255, 0, 0, 0.5)";
                        a.value = "";
                      } else {
                        if (isCorrect) {
                          inf.textContent = "정답입니다";
                          inf.style.color = "rgba(0, 87, 255, 0.5)";
                          wordBorder.style.border =
                            "1px solid rgba(0, 87, 255, 0.5)";
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
                          inf.textContent = "올바른 답을 적어주세요. .(점)까지 포함해주세요.";
                          inf.style.color = "rgba(255, 0, 0, 0.5)";
                          wordBorder.style.border =
                            "1px solid rgba(255, 0, 0, 0.5)";
                          a.style.border = "1px solid rgba(255, 0, 0, 0.5)";
                          a.value = "";
                        }
                      }
                    });
                  });
                }
              })
              .catch((error) => {
                alert(error);
              });
          });
        }
      })
      .catch((error) => {
        alert(error);
      });
  }
});
