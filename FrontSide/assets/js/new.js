import { clickEnter } from "./enterEvent.js";

const nickname = document.querySelector("#nickname");
const Id = document.querySelector("#Id");
const Pw = document.querySelector("#Pw");
const newBtn = document.querySelector("#newBtn");
const inf = document.querySelector("#inf");

//비번칸에서 엔터하면 가입 기능
clickEnter(Pw, newBtn);

//가입 기능
newBtn.addEventListener("click", () => {
  var reg_email =
    /^([0-9a-zA-Z_\.-]+)@([0-9a-zA-Z_-]+)(\.[0-9a-zA-Z_-]+){1,2}$/;
  //닉네임이 공백이라면
  if (nickname.value.length <= 0) {
    inf.textContent = "제대로 입력해주세요.";
    nickname.focus();
    //아이디가 공백이라면
  } else if (Id.value.length <= 0) {
    inf.textContent = "제대로 입력해주세요.";
    Id.focus();
    //이메일 형식이 아니라면
  } else if (!reg_email.test(Id.value)) {
    inf.textContent = "이메일 형식을 지켜주세요.";
    Id.focus();
    //비밀번호가 6자리 이하라면
  } else if (Pw.value.length <= 6) {
    inf.textContent = "비밀번호는 6자리 이상 입력해주세요.";
    Pw.focus();
  } else {
    fetch("http://3.34.125.70:83/api/user/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: Id.value,
        password: Pw.value,
        nickname: nickname.value,
      }),
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
        location.href = "/logIn";
      })
      .catch((error) => {
        console.log(error);
        inf.textContent = "이메일이 제대로 입력되지 않았습니다.";
      });
  }
});
