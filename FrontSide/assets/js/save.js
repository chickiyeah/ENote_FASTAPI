import { clickEnter } from "./enterEvent.js";

const enSpace = document.querySelector("#en");
const koSpace = document.querySelector("#ko");
const spSpace = document.querySelector("#pr");
const saveBtn = document.querySelector(".saveBtn");

//detectlang api
function detectLangFetch(textConten, translate) {
  fetch("http://3.34.125.70:83/api/papago/detectlang", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: sessionStorage.getItem("access-token"),
    },
    body: JSON.stringify({
      text: textConten.value,
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      translate;
    })
    .catch((error) => {
      console.log(error);
      alert("로그인 후 사용해주세요");
    });
}

// translate api
const getDataTranslate = (whichOne, changeValue) => {
  fetch("http://3.34.125.70:83/api/papago/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: sessionStorage.getItem("access-token"),
    },
    body: JSON.stringify({
      text: whichOne.value,
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((funcData) => (changeValue.value = funcData.text))
    .catch((error) => {
      console.log(error);
      alert("형식에 맞게 입력해주세요.");
    });
};

//노트 저장할때
const getData = () => {
  return new Promise((resolve, reject) => {
    fetch("http://3.34.125.70:83/api/note/add", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: sessionStorage.getItem("access-token"),
      },
      body: JSON.stringify({
        Korean: koSpace.value,
        English: enSpace.value,
        Speak: spSpace.value,
        Category: "",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        alert(error);
      });
  });
};
const noteData = async () => {
  //저장하는거임
  console.log(await getData());
};

//엔터 누르면 saveBtn 클릭!
clickEnter(enSpace, saveBtn);
clickEnter(koSpace, saveBtn);
clickEnter(spSpace, saveBtn);

saveBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const enRegex = /^[a-z|A-Z]+$/;
  const koRegex = /^[ㄱ-ㅎ|가-힣|ㅏ-ㅣ|,]+$/;
  if (enSpace.value.length <= 0 || koSpace.value.length <= 0) {
    //형식에 맞게 입력하게 하기
    if (!enRegex.test(enSpace.value) && !koRegex.test(koSpace.value)) {
      alert("형식에 맞게 입력해주세요.");
    } else {
      let translate = confirm("번역 기능을 사용해 빈칸을 채우시겠습니까?");
      if (translate) {
        //영어칸이 공백일 때
        if (enSpace.value.length <= 0) {
          detectLangFetch(koSpace, getDataTranslate(koSpace, enSpace));
          enSpace.focus();
          //한국어칸이 공백일 때
        } else if (koSpace.value.length <= 0) {
          detectLangFetch(enSpace, getDataTranslate(enSpace, koSpace));
          koSpace.focus();
        }
      } else {
        alert("빈칸을 채워주세요.");
      }
    }
  } else {
    alert("저장성공");
    noteData();
    enSpace.value = "";
    koSpace.value = "";
    spSpace.value = "";
  }
});

window.addEventListener("load", () => {
  //refresh_token api
  fetch("http://3.34.125.70:83/api/user/refresh_token", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refresh_token: localStorage.getItem("refresh-token"),
    }),
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      sessionStorage.setItem("access-token", data.access_token);
      sessionStorage.setItem("user_id", data.id);
      localStorage.setItem("refresh-token", data.refresh_token);
      //verify token api
      fetch("http://3.34.125.70:83/api/user/verify_token", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: sessionStorage.getItem("access-token"),
        }),
      })
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          console.log(data);
          sessionStorage.setItem("user_email", data.email);
          //근데 nickname 어떻게 가져오지 고민고민
        })
        .catch((error) => console.log(error));
    })
    .catch((error) => {
      console.log(error);
      alert("재로그인이 필요합니다.");
    });
});

// saveBtn.addEventListener("click", () => {
//   const koreanWords = koSpace.value.split(",").sort();
//   const koreanWordsTrimmed = koreanWords.map((word) => word.trim());

//   // created_At에 저장할 날짜 데이터
//   function day() {
//     const now = new Date();
//     const year = now.getFullYear();
//     const month = (now.getMonth() + 1).toString().padStart(2, "0");
//     const date = now.getDate().toString().padStart(2, "0");
//     const hour = now.getHours();
//     const minute = now.getMinutes();
//     const sec = now.getSeconds();
//     return [year, month, date, hour, minute, sec];
//   }
//   //get_all api로 단어데이터 다 불러오기 왜? 중복 확인해야하니까
//   fetch("http://3.34.125.70:83/api/note/get_all", {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: sessionStorage.getItem("access-token"),
//     },
//     data: JSON.stringify([
//       {
//         Author: sessionStorage.getItem("user_id"),
//         English: enSpace.value,
//         Korean: koreanWordsTrimmed,
//         Speak: spSpace.value,
//         Created_At: String(day()),
//       },
//     ]),
//   })
//     .then((response) => {
//       if (response.status !== 200) {
//         throw new Error("400 아니면 500 에러남");
//       } else {
//         return response.json();
//       }
//     })
//     .then((data) => {
//       console.log(data.data);
//       const enRegex = /^[a-z|A-Z]+$/;
//       const koRegex = /^[ㄱ-ㅎ|가-힣|ㅏ-ㅣ|,]+$/;
//       let eng = data.data.map((x, i) => data.data[i].English);

//       //영어칸이 공백이면
//       if (enSpace.value.length <= 0) {
//         inf.textContent = "제대로 작성해주세요.";
//         enSpace.focus();
//         //한국어칸이 공백이면
//         // } else if (koSpace.value.length <= 0) {
//         // inf.textContent = "제대로 작성해주세요.";
//         // koSpace.focus();
//         //형식이 맞지 않는다면
//         // } else if (!enRegex.test(enSpace.value)) {
//         //   inf.textContent = "영어로 입력해주세요";
//         // } else if (!koRegex.test(koSpace.value)) {
//         //   inf.textContent = "한국어로 입력해주세요";
//         //이미 저장되어있는 단어라면
//       } else if (eng.includes(enSpace.value)) {
//         inf.textContent = "이미 저장되어 있는 단어입니다.";
//         //위 조건들을 통과하면 저장완료하기
//       } else {
//         noteData();
//       }
//     })
//     .catch((error) => {
//       console.log(error);
//       inf.textContent = "다시 입력해주세요.";
//     });
// });
