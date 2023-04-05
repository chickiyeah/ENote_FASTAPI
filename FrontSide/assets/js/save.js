const data = [ 
    {
    Author : 'id_name',
    English : "hello",
    Korea : ["안녕하세요"],
    Speak : "헬로",
    category : "",
    Created_At :"Tue Apr 04 2023 18:45:47 GMT+0900 (한국 표준시)",
    },
    {
    Author : 'id_name',
    English : "bye",
    Korea : ["잘가"],
    Speak : "바이",
    category : "",
    Created_At :"Tue Apr 04 2023 18:50:47 GMT+0900 (한국 표준시)",
    }
];
 // 단어 저장하기
 const enSpace = document.querySelector(".en");
 const koSpace = document.querySelector(".ko");
 const spSpace = document.querySelector(".sp");
 const saveBtn = document.querySelector(".saveBtn");
 const inf = document.querySelector(".inf");


 saveBtn.addEventListener("click", function () {
    const day = String(new Date());
    //빈칸일때
    if (enSpace.value.length <= 0 || koSpace.value.length <= 0) {
      inf.textContent = "입력해주세요.";
    } else {
        //빈칸이 아닐때
        const enRegex = /^[a-z|A-Z]+$/;
        const koRegex =  /^[ㄱ-ㅎ|가-힣|ㅏ-ㅣ|,]+$/;
        if(enRegex.test(enSpace.value) && koRegex.test(koSpace.value)) {

            //저장할 때 중복된 영단어라면 이미 저장된 단어라 알려주고 저장막기
            let eng = data.map((x,i)=>data[i].English);
            if(eng.includes(enSpace.value)){
                alert("중복된 영단어입니다.");
            }else{
                const koreanWords = koSpace.value.split(',');
                const koreanWordsTrimmed = koreanWords.map(word => word.trim());
             //저장하는 함수 만들어서 넣기
             data.push(
                {
                Author : 'id_name',
                English : enSpace.value,
                Korea : koreanWordsTrimmed,
                Speak : spSpace.value,
                Created_At : day,
                }
             )
             inf.textContent = '';
            }
        }else{
            inf.textContent = "제대로 작성했는지 확인해주세요"
            enSpace.value="";
            koSpace.value="";
            spSpace.value="";
        }
    }
    //저장하면 빈칸
    enSpace.value="";
    koSpace.value="";
    spSpace.value="";
    inf.textContent = "";
  });
