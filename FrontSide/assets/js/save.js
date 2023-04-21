import { clickEnter } from "./enterEvent.js";

// 단어 저장하기
const enSpace = document.querySelector("#en");
const koSpace = document.querySelector("#ko");
const spSpace = document.querySelector("#pr");
const saveBtn = document.querySelector("#saveBtn");
const inf = document.querySelector(".inf");

clickEnter(spSpace, saveBtn);
clickEnter(koSpace, saveBtn);

//영어 입력하고 엔터누르면 번역된 뜻이 한국어칸에 기입된다.
enSpace.addEventListener("keydown", (e) => {
  if (e.keyCode === 13) {
    resultCode();
  }
});

// translate api
const getDataTranslate = (changeValue) => {
  fetch("http://3.34.125.70:83/api/papago/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: sessionStorage.getItem("access-token"),
    },
    body: JSON.stringify({
      text: enSpace.value,
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((funcData) => (changeValue.value = funcData.text).split("."));
};

//langCode api 연결
const code = (space) => {
  return new Promise((resolve, reject) => {
    fetch("http://3.34.125.70:83/api/papago/detectlang", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: sessionStorage.getItem("access-token"),
      },
      body: JSON.stringify({ text: space.value }),
    })
      .then((response) => response.json())
      .then((data) => {
        resolve(data.langCode);
      })
      .catch((error) => {
        alert(error);
      });
  });
};
const resultCode = async () => {
  //영어칸에 적었을 때 en코드가 나오면
  (await code(enSpace)) === "en"
    ? getDataTranslate(koSpace)
    : //영어칸에 적었을 때 ko코드가 나오면 영어만 입력해주세요 알림
      getDataTranslate(enSpace);
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

saveBtn.addEventListener("click", () => {
  const koreanWords = koSpace.value.split(",").sort();
  const koreanWordsTrimmed = koreanWords.map((word) => word.trim());

  // created_At에 저장할 날짜 데이터
  function day() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const date = now.getDate().toString().padStart(2, "0");
    const hour = now.getHours();
    const minute = now.getMinutes();
    const sec = now.getSeconds();
    return [year, month, date, hour, minute, sec];
  }
  //get_all api로 단어데이터 다 불러오기 왜? 중복 확인해야하니까
  fetch("http://3.34.125.70:83/api/note/get_all", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: sessionStorage.getItem("access-token"),
    },
    data: JSON.stringify([
      {
        Author: sessionStorage.getItem("user_id"),
        English: enSpace.value,
        Korean: koreanWordsTrimmed,
        Speak: spSpace.value,
        Created_At: String(day()),
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
      console.log(data.data);
      const enRegex = /^[a-z|A-Z]+$/;
      const koRegex = /^[ㄱ-ㅎ|가-힣|ㅏ-ㅣ|,]+$/;
      let eng = data.data.map((x, i) => data.data[i].English);

      //영어칸이 공백이면
      if (enSpace.value.length <= 0) {
        inf.textContent = "제대로 작성해주세요.";
        enSpace.focus();
        //한국어칸이 공백이면
        // } else if (koSpace.value.length <= 0) {
        // inf.textContent = "제대로 작성해주세요.";
        // koSpace.focus();
        //형식이 맞지 않는다면
        // } else if (!enRegex.test(enSpace.value)) {
        //   inf.textContent = "영어로 입력해주세요";
        // } else if (!koRegex.test(koSpace.value)) {
        //   inf.textContent = "한국어로 입력해주세요";
        //이미 저장되어있는 단어라면
      } else if (eng.includes(enSpace.value)) {
        alert("이미 저장되어 있는 단어입니다.");
        //위 조건들을 통과하면 저장완료하기
      } else {
        noteData();
      }
    })
    .catch((error) => {
      console.log(error);
      alert("다시 입력해주세요.");
    });
});
