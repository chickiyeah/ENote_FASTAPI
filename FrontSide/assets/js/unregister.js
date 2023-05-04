import { clickEnter } from "./enterEvent.js";

const inp = document.querySelector("#inp");
const btn = document.querySelector("#btn");

var loginUrl = "http://35.212.150.195/api/user/login";
var deleteUrl = "http://35.212.150.195/api/user/delete";

clickEnter(inp, btn);
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
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    let check = confirm("정말 탈퇴하시겠습니까?");
    if (check) {
      if (inp.length <= 0) {
        alert("빈칸을 채워주세요.");
        inp.focus();
      } else {
        //비밀번호가 다르다면
        fetch(loginUrl, {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: sessionStorage.getItem("user_email"),
            password: inp.value,
          }),
        })
          .then((res) => {
            if (res.status === 400) {
              throw new Error("비밀번호를 제대로 입력해주세요.");
            } else if (res.status === 422 || 500) {
              throw new Error("오류가 발생했습니다. 관리자에게 문의해주세요.");
            } else if (res.status === 200) {
              return res.json();
            }
          })
          .then((data) => {
            //api 들고 와서 탈퇴하기
            fetch(deleteUrl, {
              method: "delete",
              headers: {
                "Content-Type": "application/json",
                Authorization: sessionStorage.getItem("access_token"),
              },
            })
              .then((res) => {
                if (res.status === 200) {
                  return res.json();
                } else {
                  throw new Error(
                    "오류가 발생했습니다. 관리자에게 문의해주세요."
                  );
                }
              })
              .then((data) => {
                localStorage.clear();
                sessionStorage.clear();
                alert("탈퇴가 성공적으로 이루어졌습니다.");
                location.href = "/login";
              })
              .catch((error) => {
                alert(error);
              });
          })
          .catch((error) => {
            alert(error);
          });
      }
    } else {
      //탙퇴안하기
    }
  });
}
